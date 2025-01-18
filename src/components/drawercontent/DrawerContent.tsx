import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Modal, Pressable } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import SignOutConfirmationPopup from '../popups/SignOutConfirmationPopup';

const CustomDrawerContent = (props: any) => {
  const [userName, setUserName] = useState<string | null | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const navigation = useNavigation();

  useEffect(() => {
    setUserName(auth().currentUser?.email);
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await auth().signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loaderText}>Signing out...</Text>
        </View>
      ) : (
        <>
          <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollView}>
            <View style={styles.profileContainer}>
              <View style={styles.profileImage}>
                <Icon name="user" size={30} color="#fff" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profileRole}>Verified Rider</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <DrawerItemList {...props} />

            <View style={styles.spacer} />
          </DrawerContentScrollView>

          {/* Bottom Divider */}
          <View style={styles.bottomDivider} />

          {/* Sign Out Button */}
          <DrawerItem
            label="Settings"
            icon={({ color, size }) => (
              <Icon name="cog" color={color} size={size} />
            )}
            onPress={() => {}}
          />

          <DrawerItem
            label="Logout"
            icon={({ color, size }) => (
              <Icon name="sign-out" color={color} size={size} />
            )}
            onPress={() => setShowPopup(true)}
          />

          {/* Sign Out Confirmation Popup */}
          <SignOutConfirmationPopup
            visible={showPopup}
            onClose={() => setShowPopup(false)}
            onSignOut={handleSignOut}
          />
        </>
      )}

      {loading && (
        <View style={styles.blurOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.blurText}>Signing out...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, 
    backgroundColor: '#007bff', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555'
  },
  profileRole: {
    fontSize: 12,
    color: '#555'
  },
  textContainer: {
    flexDirection: 'column', 
    alignItems: 'left',  
    justifyContent: 'center', 
  },
  divider: {
    height: 1,
    backgroundColor: '#dcdcdc',
    marginVertical: 16,
  },
  spacer: {
    flex: 1, // Takes up remaining space
  },
  bottomDivider: {
    height: 1,
    backgroundColor: '#dcdcdc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007bff',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffffff',
  },
});

export default CustomDrawerContent;
