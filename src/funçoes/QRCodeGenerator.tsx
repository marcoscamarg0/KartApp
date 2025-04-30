// src/funçoes/QRCodeGenerator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeGeneratorProps {
  circuitId: string;
  userId: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ circuitId, userId }) => {
  // Criamos um objeto com as informações que queremos compartilhar
  const qrData = JSON.stringify({
    circuitId,
    userId,
    timestamp: new Date().toISOString(),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compartilhar Circuito</Text>
      <Text style={styles.subtitle}>Peça para seu amigo escanear este QR Code</Text>
      
      <View style={styles.qrContainer}>
        <QRCode
          value={qrData}
          size={200}
          color="#FF6F20"
          backgroundColor="white"
        />
      </View>
      
      <Text style={styles.circuitId}>ID do Circuito: {circuitId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  circuitId: {
    fontSize: 12,
    color: '#666',
  },
});

export default QRCodeGenerator;