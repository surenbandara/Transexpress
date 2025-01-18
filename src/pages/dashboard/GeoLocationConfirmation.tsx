import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CustomerGeoLocation, Order, RootStackParamList } from '../../utils/Model';
import { getCurrentLocation } from '../../utils/Services';
import { FireStoreService } from '../../utils/DbUtils';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

type GeoLocationConfirmationPageRouteProp = RouteProp<RootStackParamList, 'GeoLocationConfirmationPage'>;

export const GeoLocationConfirmationPage: React.FC = () => {
  const route = useRoute<GeoLocationConfirmationPageRouteProp>();
  const { order } = route.params;
  const navigation = useNavigation();

  const [customerGeoLocation, setCustomerGeoLocation] = useState<CustomerGeoLocation>({
    name: order.name,
    id: "userid",
    latitue: 0,
    longtiude: 0,
    location: order.address,
    originalLocation: order.address,
  });
  const [loading, setLoading] = useState(false); 

  const handleConfirmation = async () => {
    setLoading(true); 
    try {
      const location = await getCurrentLocation();
      const geoLocation: CustomerGeoLocation = { 
        ...customerGeoLocation, 
        longtiude: location?.longitude ?? 0, 
        latitue: location?.latitude ?? 0 
      };
      await FireStoreService.create("CustomerGeoLocation", geoLocation);
      navigation.goBack(); 
    } catch (error) {
      console.error('Error confirming location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Geo Location Confirmation</Text>
      <Text style={styles.descriptionText}>
        Please confirm if this is your intended geo location. If incorrect, adjust the location below.
      </Text>
      <TextInput
        style={styles.input}
        value={customerGeoLocation.location}
        onChangeText={(text) => setCustomerGeoLocation({ ...customerGeoLocation, location: text })}
        placeholder="Enter your location"
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmation}>
          <Text style={styles.buttonText}>Confirm Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Sending feedback...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffffff',
  },
});

export default GeoLocationConfirmationPage;
