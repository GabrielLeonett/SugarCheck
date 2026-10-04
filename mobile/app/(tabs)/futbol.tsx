import { View, Button, Vibration, Alert, StyleSheet } from 'react-native';

export default function TestApiScreen() {
  const handlePress = () => {
    // 1. API de Vibración: Hace vibrar el celular por 100 milisegundos
    Vibration.vibrate(100); 
    
    // 2. API de Alerta: Muestra un mensaje del sistema
    Alert.alert(
      "¡GOL!",
      "Has activado una API del teléfono",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Probar Hardware" onPress={handlePress} color="#008000" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});