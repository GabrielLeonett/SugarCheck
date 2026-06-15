import { StyleSheet, View } from "react-native"; // Cambiamos Host/Card por View
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/card";

export default function HomeScreen() {

  // Las escrituras en WatermelonDB SIEMPRE deben envolverse en un bloque `write`
  const crearTestTodo = async () => {
    await database.write(async () => {
      const nuevoTodo = await database.get('todos').create(todo => {
        todo.text = '¡WatermelonDB está vivito y coleando!'
        todo.isCompleted = false
      })
      console.log('Registro guardado localmente:', nuevoTodo)
    })
  }
  return (
    <ThemedView style={styles.mainContainer}>
      <ThemedText type="title">Home</ThemedText>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Hola, Guerrero Gabriel!</ThemedText>
      </ThemedView>

      {/* Sustituimos la Columna y los Cards por Views con estilo */}
      <View style={styles.column}>
        
        {/* Simulación de Elevated Card */}
        <Card style={[styles.card, styles.elevated]}>
          <ThemedText>Ultima Glicemia</ThemedText>
          <ThemedText>Cronometro de Seguridad</ThemedText>
        </Card>

        {/* Simulación de Outlined Card */}
        <Card style={[styles.card, styles.outlined]}>
          <ThemedText>Registro del Dia</ThemedText>
        </Card>

      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 16,
    marginTop: 40,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 20,
  },
  column: {
    gap: 12, // Esto hace lo mismo que "spacedBy"
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  elevated: {
    // Sombra para Android
    elevation: 4,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
});