import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, PermissionsAndroid, Platform, TextInput, TouchableOpacity, FlatList, Keyboard, Text, SafeAreaView } from 'react-native';
import MapView, { Marker, LatLng, PROVIDER_GOOGLE } from 'react-native-maps';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; 
import { getCurrentLocation } from '../../utils/Services';
import { FireStoreService } from '../../utils/DbUtils';
import { CustomerGeoLocation } from '../../utils/Model';

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = 0.0421;
const BUTTON_HEIGHT = 50; // Height of the fixed button at the bottom

const Map = () => {
  const mapRef = useRef<MapView | null>(null); 
  const [location, setLocation] = useState<LatLng | null>(null); 
  const [selectedLocation, setSelectedLocation] = useState<CustomerGeoLocation | null>(null); 
  const [customerLocations, setCustomerLocation] = useState<CustomerGeoLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<CustomerGeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false); 
  const [showClearIcon, setShowClearIcon] = useState<boolean>(false); 

  const setCurrentLocation = async (): Promise<void> => {
    try {
      const currentLocation = await getCurrentLocation();
      const latLngLocation = currentLocation as LatLng;
      setLocation(latLngLocation); 
    } catch (error) {
      console.error('Error fetching current location', error);
    }
  };

  const setCustomerLocations = async (): Promise<void> => {
    try {
      const locations: CustomerGeoLocation[] = await FireStoreService.getAll('CustomerGeoLocation');
      setCustomerLocation(locations);
      setFilteredLocations([]); 
    } catch (error) {
      console.error('Error fetching customer locations', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }

      await setCurrentLocation();
      await setCustomerLocations();
      setIsLoading(false); 
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    const lowerCaseQuery = query.trim().toLowerCase();
    const filtered = customerLocations.filter(loc =>
      loc.name.toLowerCase().includes(lowerCaseQuery) ||
      loc.location.toLowerCase().includes(lowerCaseQuery) 
    );
    setFilteredLocations(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const handleClearSearch = () => {
    setSearchQuery(''); 
    setShowDropdown(false); 
    setFilteredLocations([]); 
    setSelectedLocation(null);
    setShowClearIcon(false);
  };

  const handleSelectLocation = (location: CustomerGeoLocation) => {
    setSearchQuery(location.name);  
    setFilteredLocations([location]); 
    setSelectedLocation(location);
    setShowDropdown(false); 
    Keyboard.dismiss(); 

    mapRef.current?.animateToRegion(
      {
        latitude: location.latitue,  
        longitude: location.longtiude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      1000 
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Customers"
          placeholderTextColor="#555"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearch(text);
            setShowClearIcon(filteredLocations.length > 0 || text.length > 0); 
          }}
          onFocus={() => setShowDropdown(true)} 
        />
        {showClearIcon && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Text>
              <FontAwesome name="times-circle" size={20} color="#555" />
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={filteredLocations}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectLocation(item)}>
                <FontAwesome name="user" size={20} color="#555" />
                <View style={styles.dropdownTextContainer}>
                  <Text style={styles.dropdownTextName}>
                    {item.name}
                  </Text>
                  <Text style={styles.dropdownTextAddress}>
                    {item.location}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        location && (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
              showsUserLocation={true}
              provider={PROVIDER_GOOGLE}
              showsMyLocationButton={true}
              showsCompass={true} 
            >
              {selectedLocation && <Marker 
                coordinate={{ latitude: selectedLocation?.latitue, longitude: selectedLocation?.longtiude} as LatLng}
                title={`Customer: ${selectedLocation?.name}`}
                description={`Location: ${selectedLocation?.location}`}
              >
                <View style={styles.iconContainer}>
                  <FontAwesome name="user" size={30} color="blue" />
                </View>
              </Marker>}
            </MapView>
          </View>
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
    color: '#555',
  },
  dropdownContainer: { 
  },
  dropdownItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  dropdownTextContainer: {
    marginLeft: 10,
  },
  dropdownTextName: {
    color: '#555',
    fontWeight: 'bold'
  },
  dropdownTextAddress: {
    color: '#555',
  },
  mapContainer: {
    flex: 1
  },
  map: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Map;
