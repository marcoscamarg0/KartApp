// src/funçoes/QRCodeScanner.tsx
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

interface QRCodeScannerProps {
  onCodeScanned: (data: { circuitId: string; userId: string }) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onCodeScanned }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.circuitId && parsedData.userId) {
        onCodeScanned(parsedData);
      } else {
        Alert.alert('QR Code inválido', 'O QR code não contém informações de circuito válidas.');
        setScanned(false);
      }
    } catch (error) {
      Alert.alert('Erro ao ler QR Code', 'O formato do QR code não é válido.');
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Sem acesso à câmera</Text>
        <Text style={styles.subText}>É necessário permitir o acesso à câmera para escanear QR codes.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.scanText}>Aponte para o QR Code</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FF6F20',
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginBottom: 30,
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default QRCodeScanner;