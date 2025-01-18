import auth from '@react-native-firebase/auth';
import { AuthOpCode } from './Model';

export const signIn = async (email: string, password: string):Promise<AuthOpCode>  => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      return AuthOpCode.LOGIN_SUCCESS;
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        return AuthOpCode.WRONG_PASSWORD;
      } else if (error.code === 'auth/user-not-found') {
        return AuthOpCode.USER_NOT_FOUND;
      } else if (error.code === 'auth/invalid-credential') {
        return AuthOpCode.INVALID_CREDENTIALS;
      } else if (error.code === 'auth/invalid-email') {
        return AuthOpCode.INVALID_EMAIL;
      } else{
        console.log(error);
        return AuthOpCode.OTHER;
      }
    }
  };
