import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

import { useReducedMotion } from './useReducedMotion';

interface GlucoGuiaProps {
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  nodeSize: number;
}

/** Gluco flota sobre el nivel desbloqueado para señalar el siguiente paso. */
export function GlucoGuia({ x, y, mapWidth, mapHeight, nodeSize }: GlucoGuiaProps) {
  const reducido = useReducedMotion();
  const [flotacion] = useState(() => new Animated.Value(0));
  const tamano = Math.round(nodeSize * 0.82);

  useEffect(() => {
    if (reducido) {
      flotacion.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flotacion, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(flotacion, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flotacion, reducido]);

  const desplazamiento = flotacion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          left: (x / 1000) * mapWidth - tamano / 2,
          top: (y / 3200) * mapHeight - nodeSize / 2 - tamano - 2,
          width: tamano,
          height: tamano,
          transform: [{ translateY: desplazamiento }],
        },
      ]}
    >
      <Image
        source={require('../../assets/gluco-saludo.png')}
        style={{ width: tamano, height: tamano }}
        resizeMode="contain"
        accessibilityLabel="Gluco, tu guía en el Camino"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 20,
  },
});
