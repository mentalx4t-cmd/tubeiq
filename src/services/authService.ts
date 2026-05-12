import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth';

export const reauthorizeWithYouTube = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      localStorage.setItem('yt_access_token', credential.accessToken);
      window.dispatchEvent(new CustomEvent('yt_token_updated', { detail: credential.accessToken }));
      return credential.accessToken;
    }
    throw new Error("No access token received");
  } catch (error) {
    console.error("Re-authorization failed:", error);
    throw error;
  }
};
