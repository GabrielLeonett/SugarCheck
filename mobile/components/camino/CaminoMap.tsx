import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

import { AmbienteMundo } from './AmbienteMundo';
import { GlucoGuia } from './GlucoGuia';
import { NivelNodo } from './NivelNodo';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  MUNDOS,
  NIVELES,
  construirSendero,
  estadoDeNivel,
} from './caminoTheme';

interface CaminoMapProps {
  lastCompletedLevel: number;
  onSelectLevel: (level: number) => void;
}

export function CaminoMap({ lastCompletedLevel, onSelectLevel }: CaminoMapProps) {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('screens');

  const mapWidth = Math.min(width - 32, 720);
  const mapHeight = mapWidth * (MAP_HEIGHT / MAP_WIDTH);
  const nodeSize = Math.max(60, Math.min(88, mapWidth * 0.2));

  const nivelActual = Math.min(lastCompletedLevel + 1, NIVELES.length);
  const senderoCompleto = construirSendero(NIVELES.map((nivel) => ({ x: nivel.x, y: nivel.y })));
  const puntosProgreso = NIVELES.filter((nivel) => nivel.numero <= nivelActual);
  const senderoProgreso = construirSendero(puntosProgreso.map((nivel) => ({ x: nivel.x, y: nivel.y })));
  const nodoActual = NIVELES.find((nivel) => nivel.numero === nivelActual);

  const tituloNivel = (numero: number) =>
    t(`warriorPath.lessonTitles.${numero}`, {
      defaultValue: t('warriorPath.level', { number: numero }),
    });

  const etiquetaEstado = (numero: number) => {
    const estado = estadoDeNivel(numero, lastCompletedLevel);
    if (estado === 'completado') return t('warriorPath.completedLevel');
    if (estado === 'actual') return t('warriorPath.available');
    return t('warriorPath.locked');
  };

  return (
    <View style={{ width: mapWidth, height: mapHeight, alignSelf: 'center' }}>
      <Svg
        width={mapWidth}
        height={mapHeight}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient
            id="camino-progreso"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={0}
            x2={0}
            y2={MAP_HEIGHT}
          >
            {MUNDOS.map((mundo, index) => (
              <Stop
                key={mundo.numero}
                offset={`${(index / (MUNDOS.length - 1)) * 100}%`}
                stopColor={mundo.accent}
              />
            ))}
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill={isDark ? '#0b1118' : '#eef4fb'} />

        {MUNDOS.map((mundo) => (
          <AmbienteMundo key={mundo.numero} mundo={mundo} oscuro={isDark} />
        ))}

        <Path
          d={senderoCompleto}
          fill="none"
          stroke="rgba(15,23,42,0.20)"
          strokeWidth={42}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={senderoCompleto}
          fill="none"
          stroke={isDark ? '#3b4a5c' : '#e8ddc2'}
          strokeWidth={32}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={senderoCompleto}
          fill="none"
          stroke={isDark ? '#cbd5e1' : '#ffffff'}
          strokeWidth={8}
          strokeDasharray="1 22"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />

        {puntosProgreso.length > 1 && (
          <Path
            d={senderoProgreso}
            fill="none"
            stroke="url(#camino-progreso)"
            strokeWidth={30}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>

      {/* Carteles de mundo */}
      {MUNDOS.map((mundo) => {
        const primerNivel = NIVELES.find((nivel) => nivel.mundo === mundo.numero);
        const pillIzquierda = (primerNivel?.x ?? 0) > MAP_WIDTH / 2;

        return (
          <View
            key={`titulo-${mundo.numero}`}
            pointerEvents="none"
            style={[
              styles.worldPillWrap,
              {
                top: ((mundo.band.y + 10) / MAP_HEIGHT) * mapHeight,
                alignItems: pillIzquierda ? 'flex-start' : 'flex-end',
                left: pillIzquierda ? 10 : 0,
                right: pillIzquierda ? 0 : 10,
              },
            ]}
          >
            <View
              style={[
                styles.worldPill,
                {
                  backgroundColor: mundo.accent,
                  borderColor: 'rgba(255,255,255,0.85)',
                  maxWidth: mapWidth * 0.56,
                },
              ]}
            >
              <Text style={styles.worldEmoji} allowFontScaling={false}>
                {mundo.emoji}
              </Text>
              <Text style={styles.worldText} allowFontScaling={false} numberOfLines={1}>
                {t(`warriorPath.worldTags.${mundo.key}`)}
              </Text>
            </View>
          </View>
        );
      })}

      {NIVELES.map((nivel) => {
        const mundo = MUNDOS.find((item) => item.numero === nivel.mundo) ?? MUNDOS[0];
        return (
          <NivelNodo
            key={nivel.numero}
            numero={nivel.numero}
            x={nivel.x}
            y={nivel.y}
            estado={estadoDeNivel(nivel.numero, lastCompletedLevel)}
            titulo={tituloNivel(nivel.numero)}
            acento={mundo.accent}
            acentoSuave={mundo.accentSoft}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
            size={nodeSize}
            etiquetaNivel={t('warriorPath.levelShort')}
            etiquetaEstado={etiquetaEstado(nivel.numero)}
            onPress={() => onSelectLevel(nivel.numero)}
          />
        );
      })}

      {nodoActual && lastCompletedLevel < NIVELES.length && (
        <GlucoGuia
          x={nodoActual.x}
          y={nodoActual.y}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          nodeSize={nodeSize}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  worldPillWrap: {
    position: 'absolute',
    zIndex: 10,
  },
  worldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 2,
  },
  worldEmoji: {
    fontSize: 13,
  },
  worldText: {
    color: '#ffffff',
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    flexShrink: 1,
  },
});
