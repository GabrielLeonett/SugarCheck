import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';

import { oscurecer, type EstadoNivel } from './caminoTheme';
import { useReducedMotion } from './useReducedMotion';

interface NivelNodoProps {
  numero: number;
  x: number;
  y: number;
  estado: EstadoNivel;
  titulo: string;
  acento: string;
  acentoSuave: string;
  mapWidth: number;
  mapHeight: number;
  size: number;
  etiquetaNivel: string;
  etiquetaEstado: string;
  onPress: () => void;
}

export function NivelNodo({
  numero,
  x,
  y,
  estado,
  titulo,
  acento,
  acentoSuave,
  mapWidth,
  mapHeight,
  size,
  etiquetaNivel,
  etiquetaEstado,
  onPress,
}: NivelNodoProps) {
  const esActual = estado === 'actual';
  const bloqueado = estado === 'bloqueado';
  const reducido = useReducedMotion();
  const [pulso] = useState(() => new Animated.Value(0));

  useEffect(() => {
    pulso.setValue(0);
    if (!esActual || reducido) return;

    const loop = Animated.loop(
      Animated.timing(pulso, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [esActual, pulso, reducido]);

  const colores =
    estado === 'completado'
      ? {
          arriba: '#d9fbe6',
          medio: '#4ade80',
          abajo: '#16a34a',
          borde: '#ecfdf5',
          lateral: '#0f5132',
        }
      : esActual
        ? {
            arriba: acentoSuave,
            medio: acento,
            abajo: oscurecer(acento, 0.2),
            borde: '#ffffff',
            lateral: oscurecer(acento, 0.42),
          }
        : {
            arriba: '#e2e8f0',
            medio: '#94a3b8',
            abajo: '#64748b',
            borde: '#94a3b8',
            lateral: '#334155',
          };

  const gradienteId = `camino-nodo-${numero}`;
  const haloId = `camino-halo-${numero}`;
  const escala = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.42] });
  const opacidad = pulso.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.7, 0.15, 0] });

  return (
    <View
      style={[
        styles.wrapper,
        {
          left: (x / 1000) * mapWidth - size / 2,
          top: (y / 3200) * mapHeight - size / 2,
          width: size,
          height: size,
          zIndex: esActual ? 12 : 8,
        },
      ]}
    >
      {esActual && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                backgroundColor: acento,
                width: size * 1.25,
                height: size * 1.25,
                left: -size * 0.125,
                top: -size * 0.125,
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulso,
              {
                borderColor: acento,
                opacity: opacidad,
                transform: [{ scale: escala }],
              },
            ]}
          />
        </>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={bloqueado}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${etiquetaNivel} ${numero}: ${titulo}. ${etiquetaEstado}`}
        accessibilityState={{ disabled: bloqueado }}
        style={styles.touchable}
      >
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Defs>
            <LinearGradient id={gradienteId} x1="25%" y1="0%" x2="75%" y2="100%">
              <Stop offset="0%" stopColor={colores.arriba} />
              <Stop offset="52%" stopColor={colores.medio} />
              <Stop offset="100%" stopColor={colores.abajo} />
            </LinearGradient>
            <RadialGradient id={haloId} cx="50%" cy="50%" r="50%">
              <Stop offset="55%" stopColor={acento} stopOpacity={0.35} />
              <Stop offset="100%" stopColor={acento} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {esActual && <Circle cx={60} cy={60} r={58} fill={`url(#${haloId})`} />}

          <Ellipse cx={60} cy={107} rx={36} ry={9} fill="rgba(15,23,42,0.28)" />
          <Circle cx={60} cy={64} r={42} fill={colores.lateral} />
          <Circle
            cx={60}
            cy={56}
            r={42}
            fill={`url(#${gradienteId})`}
            stroke={colores.borde}
            strokeWidth={4}
          />
          <Circle cx={60} cy={56} r={33} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2.5} />
          <Ellipse
            cx={58}
            cy={38}
            rx={27}
            ry={14}
            fill="#ffffff"
            opacity={esActual ? 0.42 : 0.3}
            transform="rotate(-12 58 38)"
          />
          <Circle cx={40} cy={32} r={4.5} fill="#ffffff" opacity={0.55} />
          {bloqueado && <Circle cx={60} cy={56} r={42} fill="rgba(15,23,42,0.22)" />}
        </Svg>

        <View pointerEvents="none" style={styles.numeroWrap}>
          <ThemedText
            style={[
              styles.numero,
              {
                fontSize: size * 0.36,
                color: bloqueado ? '#e2e8f0' : '#ffffff',
              },
            ]}
          >
            {numero}
          </ThemedText>
        </View>

        {estado === 'completado' && (
          <View style={[styles.marca, styles.marcaCheck, { width: size * 0.26, height: size * 0.26, borderRadius: size * 0.13 }]}>
            <FontAwesome name="check" size={size * 0.13} color="#ffffff" />
          </View>
        )}

        {bloqueado && (
          <View style={[styles.marca, styles.marcaLock, { width: size * 0.26, height: size * 0.26, borderRadius: size * 0.13 }]}>
            <FontAwesome name="lock" size={size * 0.12} color="#e2e8f0" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 7,
  },
  halo: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.22,
  },
  pulso: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 999,
    borderWidth: 3,
  },
  touchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    fontFamily: Fonts.extraBold,
    lineHeight: undefined,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  marca: {
    position: 'absolute',
    top: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  marcaCheck: {
    backgroundColor: '#16a34a',
  },
  marcaLock: {
    backgroundColor: '#1e293b',
    borderColor: '#cbd5e1',
  },
});
