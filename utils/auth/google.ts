import { makeRedirectUri, AuthRequest, ResponseType, exchangeCodeAsync } from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../../constants/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Configure using env vars set in app config
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export async function signInWithGoogle() {
  // Request Google tokens
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  };

  const redirectUri = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_SIGNIN || makeRedirectUri({
    native: 'dawat://oauthredirect',
    preferLocalhost: true,
  });

  const request = new AuthRequest({
    clientId: iosClientId || webClientId || '',
    redirectUri,
    scopes: ['profile', 'email', 'openid'],
    responseType: ResponseType.Code,
    extraParams: {
      // Required for code exchange
      access_type: 'offline',
      prompt: 'consent',
    },
  });

  await request.makeAuthUrlAsync(discovery);
  const result = await request.promptAsync(discovery);

  if (result.type !== 'success' || !result.params.code) {
    return { ok: false, error: 'cancelled' };
  }

  // Exchange code for tokens
  const tokenResult = await exchangeCodeAsync(
    {
      code: result.params.code,
      clientId: iosClientId || webClientId || '',
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier!,
      },
    },
    discovery
  );

  const idToken = tokenResult.idToken;
  if (!idToken) return { ok: false, error: 'no_id_token' };

  // Sign in to Firebase with Google credential
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  const user = userCredential.user;

  // Ensure user profile in Firestore
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);
  if (!existing.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      fullName: user.displayName || '',
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      avatar: user.photoURL || 'profile.png',
      createdAt: new Date().toISOString(),
    });
  }

  return { ok: true, user };
}
