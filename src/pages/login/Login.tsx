import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator, Keyboard, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { signIn } from '../../utils/AuthUtils';
import { AuthOpCode } from '../../utils/Model';
import { useNavigation } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
    if (auth().currentUser?.email) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, []);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
    } else {
      setPasswordError('');
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss(); // Dismiss the keyboard

    setLoading(true);
    setError('');

    try {
      if (password.length < 6) {
        setError("Password is invalid");
      } else if (email.length === 0) {
        setError("Email is invalid");
      } else {
        const authResponse: AuthOpCode = await signIn(email, password);
        if (authResponse === AuthOpCode.LOGIN_SUCCESS) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          setError(authResponse);
        }
      }
    } catch (e) {
      console.error('Authentication error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="user" size={30} color="#007bff" />
        <Text style={styles.title}>Login</Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Signing in...</Text>
        </View>
      )}
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#555" 
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validatePassword(text);
          }}
          secureTextEntry
        />
        {passwordError ? <Text style={styles.validationText}>{passwordError}</Text> : null}

        <Button title="Login" onPress={handleLogin} color="#007bff" />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.contactContainer}>
          <Text style={styles.contactText}>If you have any issues, </Text>
          <TouchableOpacity onPress={() => {/* Navigate to support or contact page */}}>
            <Text style={styles.contactLink}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#007bff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#555'
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  validationText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
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
  contactContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
    color: '#000',
  },
  contactLink: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
