import axios from 'axios';
import { Order, OrderType } from './Model';
import DocumentPicker from 'react-native-document-picker';
import { Linking } from 'react-native';
import { CameraOptions, launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import stringSimilarity from 'string-similarity';
import {kmeans} from 'ml-kmeans';



export async function getPdfContent(content : any): Promise<Order[]>{
    const response = await axios.post('https://transtableextractor.vercel.app', content, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    const orders = response.data["table_data"].map((responseItem : any): Order => ({
      COD: responseItem["COD"],
      address: responseItem["address"],
      date: responseItem["date"],
      id: responseItem["id"],
      name: responseItem["name"],
      numbers: responseItem["numbers"],
      orderType: OrderType.PENDING,
      photo: false,
      updatedAt: new Date().getTime()
    }));
      
    return orders; 
}

export async function pdfPicker(): Promise<any> {
  try {
    const doc = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf],
    });

    if (doc && doc[0]) {
      const formData = new FormData();
      formData.append('file', {
        uri: doc[0].uri,
        type: doc[0].type,
        name: doc[0].name,
      });

     
      const content = await getPdfContent(formData);
      return content;
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User canceled the picker');
    } else {
      console.error('Error:', err);

    }
  }
};

export async function excelPicker(): Promise<Order[]> {
  try {
    const doc = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });

    if (doc && doc[0]) {
      const fileUri = doc[0].uri;

      const base64Content = await RNFS.readFile(fileUri, 'base64');
      const bstr = base64Content;

      const workbook = XLSX.read(bstr, { type: 'base64' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonContent = XLSX.utils.sheet_to_json(sheet);

      const orders: Order[] = jsonContent.map((item: any) => ({
        COD: item.COD || 0,
        address: item['Address'] || '',
        date: item['Date'] || '',
        id: item['Waybill Id'] ? item['Waybill Id'].toString() : '',
        name: item['Customer Name'] || '',
        numbers: item['Phone Number'] ? item['Phone Number'].split('/') : [],
        orderType: OrderType.PENDING,  
        photo: false,  
        updatedAt: Date.now()
      }));

      return orders;
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User canceled the picker');
    } else {
      console.error('Error:', err);
    }
  }
  return [];
}

export function invokeCall(number : string) {
  const phoneNumber = `tel:${number}`;
  Linking.openURL(phoneNumber).catch(err => console.error('Failed to open URL:', err));
};

export function invokeMapWithNavigation(destination: string) {
  const encodedDestination = encodeURIComponent(destination);
  const url = `google.navigation:q=${encodedDestination}`;
  Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
};

export function filterOrders(orders: Order[], keyword: string): Order[] {
  const lowercasedKeyword = keyword.toLowerCase();
  return orders.filter(order => {
    return Object.entries(order)
      .filter(([key]) => key !== 'id' && key !== 'updatedAt' && key !== 'photo') 
      .some(([_, value]) =>
        value?.toString().toLowerCase().includes(lowercasedKeyword)
      );
  });
};

export function totalPriceCalculator(orders: Order[]): number{
  const totalDeliveredPrice = orders
    .reduce((total, ticket) => total + (ticket.COD || 0), 0);

  return totalDeliveredPrice;
}

export async function captureImage(): Promise<any> {
  try {
    const options: CameraOptions = {
      quality: 0.5, 
      maxWidth: 500, 
      maxHeight: 500, 
      includeBase64: true, 
      mediaType: 'photo', 
    };

    const photoData = await new Promise(async (resolve, reject) => {
      await launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
          resolve(null);
        } else if (response.errorCode) {
          console.error('Image picker error:', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const photoBase64 = response.assets[0].base64;
          resolve(photoBase64);
        } else {
          console.log( "In else ");
        }
      });
    });

    return photoData;
    
  } catch (e) {
    console.error('Failed to capture and store order. Error:', e);
    return null; 
  }
};

export function createPathToImage(imageName : string): string{
  return  `file://${RNFS.DocumentDirectoryPath}/${imageName}.jpg`
}

export async function getCurrentLocation(): Promise<{ latitude: number, longitude: number } | null> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show your current position.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission denied');
        return null;
      }
    }
    
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        error => {
          console.error(error);
          reject(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

namespace AddressClustering {

  // Preprocess address strings (basic version)
  export const preprocessAddresses = (addresses: string[]): string[] => {
    return addresses.map(address => 
      address.trim().toLowerCase().replace(/\s+/g, ' ')
    );
  };

  // Calculate similarity matrix
  export const calculateSimilarityMatrix = (addresses: string[]): number[][] => {
    const matrix: number[][] = [];

    for (let i = 0; i < addresses.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < addresses.length; j++) {
        matrix[i][j] = stringSimilarity.compareTwoStrings(addresses[i], addresses[j]);
      }
    }

    return matrix;
  };

  // Convert similarity matrix to feature vectors for clustering
  export const convertToFeatureVectors = (matrix: number[][]): number[][] => {
    return matrix; // In this simple case, the similarity matrix itself can be used as feature vectors
  };

  // Perform K-Means clustering
  export const clusterAddresses = (data: number[][], numberOfClusters: number) => {
    const result = kmeans(data, numberOfClusters, {});
    return result.clusters;
  };

  // Evaluate and map clusters to addresses
  export const evaluateClusters = (clusters: number[], addresses: string[]): { [key: number]: string[] } => {
    const clusterMap: { [key: number]: string[] } = {};

    clusters.forEach((cluster, index) => {
      if (!clusterMap[cluster]) {
        clusterMap[cluster] = [];
      }
      clusterMap[cluster].push(addresses[index]);
    });

    return clusterMap;
  };

  // Main function to perform clustering
  export const performClustering = (addresses: string[], numberOfClusters: number) => {
    // Preprocess addresses
    const preprocessedAddresses = preprocessAddresses(addresses);

    // Calculate similarity matrix
    const similarityMatrix = calculateSimilarityMatrix(preprocessedAddresses);

    // Convert similarity matrix to feature vectors
    const featureData = convertToFeatureVectors(similarityMatrix);

    // Cluster addresses
    const clustered = clusterAddresses(featureData, numberOfClusters);

    // Evaluate clusters
    const resultClusters = evaluateClusters(clustered, addresses);

    return resultClusters;
  };

}

const addresses = [
  'Deraniyagala',
  'Deraniyagala',
  'EEM Maliban Textile Pvt Ltd, Vilukhenaa, Deraniyagala',
  'Chef Master Restaurant, 118/1, Dehiovita Road, Daraniyagala',
  'Deraniyagala, Dakunu Deraniyagala',
  'Deraniyagala',
  'N45/1 Padukgama, Manchanayaka Mawatha, Deraniyagala',
  'F/43/B1, Ranasinghepura Road, Hambanwela, Deraniyagala',
  'Chatura Motors Daraniyagala, Mhandiran Mawatha, Daraniyagala',
  'Commercial Credit & Finance PLC, Deraniyagala',
  '82, Samanpuragama, Deraniyagala',
  '4 Patumaga Vidyalaya Mawatha, Deraniyagala',
  'Polonnaruwa Super Center, Deraniyagala',
  'F 150, Lassana Maga, Dehiovita',
  '06, Miyanawita Road, Daraniyagala',
  'Malandeniya Daraniyagala, Kegalle',
  'No.07 Noory Rd, Deraniyagala',
  '17/2 Ilukthenna, Nawagammanaya, Deraniyagala',
  'RDB Deraniyagala Branch, Deraniyagala',
  'Basnagala, Noori',
  'Sapumal Kanda, No 3, Deraniyagala',
  'No. M/109/1, Miyanawita, Deraniyagala',
  'Deraniyagala, Samanpuragama, Kegalle',
  'Kumburugama, Deraniyagala',
  'M/101/A, Miyanawita, Deraniyagala',
  'Ranwijayagama, Udapola, Daraniyagala',
  'Murakanda Demada, Deraniyagala',
  'S/16/3, Hathkela, Miyanawita, Deraniyagala, Kegalle',
  'Wediyawathta, Miyanwita, Deraniyagala',
  'Miyanawita ED, Daraniyagala, Kegalle',
  'Kurahanwaththa, Hathkela, Miyanawita, Deraniyagala',
  'Wihara Mawatha, Miyanavita, Deraniyagala',
  'No. 57/4, 01 Mahinkanda, Galahitikanda Watta, Deraniyagala',
  'Asamankanda, Miyanvita, Daraniyagala',
  'Yatiwala, Miyanavita, Deraniyagala',
  'Ranahinkanda, Deraniyagala',
  'Digowa Rsnak Kanda, Deraniyagala, Kegalle',
  'Eyila Tea Estate, Boralangada, Dehiovita',
  'R18/1 Weediyawatta, Miyanavita, Deraniyagala',
  'Talawa Maliboda, Deraniyagala',
  'K53 Thalawa Maliboda, Deraniyagala',
  'Orupeellagama, Maliboda, Deraniyagala',
  'Hingurana Maliboda, Deraniyagala',
  'Namalwatta Maligagoda, Deraniyagala',
  'Hingurana Maliboda, Deraniyagala, Kegalle',
  'Pothdenikanda Maliboda',
  'Ranwala, Maliboda, Deraniyagala',
  'Wissahena, Maliboda, Deraniyagala',
  'No. 65 Nindagama Maliboda, Kegalle'
];

const numberOfClusters = 3;

const clusters = AddressClustering.performClustering(addresses, numberOfClusters);

console.log(clusters);