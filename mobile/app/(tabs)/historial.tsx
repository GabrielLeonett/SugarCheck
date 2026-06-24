import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { H2 } from "@/components/ui/h2";
import { H3 } from "@/components/ui/h3";
import { H4 } from "@/components/ui/h4";
import { Body1 } from "@/components/ui/body1";
import { Body2 } from "@/components/ui/body2";

export default function HistorialScreen() {
  return (
    <>
      <ThemedView style={{ margin: 8 }}>
        <ThemedText type="title">Historial</ThemedText>
        <ThemedView style={styles.stepContainer}>
          <H2>Hola jose</H2>
          <H3>Hola jose</H3>
          <H4>Hola jose</H4>
          <Body1>Hola jose</Body1>
          <Body2>Hola jose</Body2>
          <H2>Hola jose</H2>
          <H2>Hola jose</H2>
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
