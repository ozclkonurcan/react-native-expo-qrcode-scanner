import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Vibration, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { ListItem } from 'react-native-elements';
import { Swipeable, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToastAndroid } from 'react-native';
import { Linking } from 'react-native';

export default function QrCodePage() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState([]);
  const [showScannedData, setShowScannedData] = useState(false);

  const toggleScanning = () => {
    setScanning(!scanning);
  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scannedData.some(item => item.data === data)) {
    //   console.log('Bu QR kod zaten tarandı');
      return;
    }
  
    setScannedData([...scannedData, { id: Date.now(), type, data }]);
    setScanning(false);
  };

  const onDelete = (id) => {
    const newData = scannedData.filter((item) => item.id !== id);
    setScannedData(newData);
  };


    const handleDeleteConfirmation = (id) => {
      Alert.alert(
        'Uyarı',
        'Bu veriyi silmek istediğinizden emin misiniz?',
        [
          { text: 'Hayır', onPress: () =>  {
            ToastAndroid.show("Silme işlemi iptal edildi !!!",ToastAndroid.BOTTOM)} },
          {
            text: 'Evet',
            onPress: () => {
              onDelete(id);
              Vibration.vibrate(500);
              ToastAndroid.show("Silme işlemi gerçekleşti",ToastAndroid.BOTTOM);
            },
          },
        ],
        { cancelable: false }
      );
    };


    const handlePress = (link) => {
      if (isUrl(link)) { // isUrl fonksiyonu ile link olup olmadığı kontrol ediliyor
        Linking.openURL(link);
      } else {
        // link değilse yapılacak işlemler buraya yazılabilir
      }
    };
    
    const isUrl = (text) => {
      const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
      return urlRegex.test(text);
    };

  const renderScannedDataItem = ({ item }) => (
<TouchableOpacity onPress={() =>handlePress(item.data)}  onLongPress={() => handleDeleteConfirmation(item.id)}>  
<ListItem bottomDivider >
    <ListItem.Content >
      <ListItem.Title>{item.type}</ListItem.Title>
      <ListItem.Subtitle>{item.data}</ListItem.Subtitle>
    </ListItem.Content>
  </ListItem>
  </TouchableOpacity>

  );




  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera 
          style={styles.camera} 
          type={type} 
          ratio={'16:9'} 
          onBarCodeScanned={scanning ? handleBarCodeScanned : null} 
        />
        {scanning && (
          <View style={styles.scanFrame}>
            <Text style={styles.scanText}>QR kodu taratın...</Text>
          </View>
        )}
      </View>
      {showScannedData && (
        <View style={styles.scannedDataContainer}>
          <View style={styles.scannedDataHeader}>
            <Text style={styles.scannedDataHeaderText}>Taranan Kodlar</Text>
            <TouchableOpacity onPress={() => setShowScannedData(false)}>
              <Ionicons name="close-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.scannedDataList}>
          {scannedData.length > 0 ? (
  <FlatList 
    data={scannedData} 
    renderItem={renderScannedDataItem} 
    keyExtractor={item => item.id.toString()} 
  />
) : (
  <Text style={styles.noDataText}>Tarama verisi yok</Text>
)}
          </View>
        </View>
      )}
      <TouchableOpacity style={styles.scanButton} onPress={toggleScanning}>
        <Ionicons name={scanning ? 'stop-circle-outline' : 'scan-circle-outline'} size={72} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.showScannedDataButton} onPress={() => setShowScannedData(!showScannedData)}>
        <Ionicons name="list-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    },
    cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    },
    scanButton: {
    position: 'absolute',
    bottom: 48,
    left: '50%',
    marginLeft: -48,
    },
    showScannedDataButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#2D2D2D',
    padding: 8,
    borderRadius: 8,
    },
    scanFrame: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    width: '80%',
    height: '30%',
    borderWidth: 2,
    borderColor: '#05C46B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    },
    scanText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    },
    scannedDataContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    zIndex: 2,
    padding: 16,
    },
    scannedDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    },
    scannedDataHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    },
    scannedDataList: {
    flex: 1,
    marginTop: 8,
    },
    noDataText: {
    color: '#fff',
    fontStyle: 'italic',
    },
    });
