# AWS Amplify Auth Integration (Plan)

## What we'll use
- AWS Amplify + Cognito (Hosted UI) for Google/Apple
- `aws-amplify`, `@aws-amplify/react-native`

## Environment variables (Expo)
Add to `app.json` (expo.extra or expo.plugins) or `.env` via `expo-env`:
```
EXPO_PUBLIC_AWS_REGION=eu-west-2
EXPO_PUBLIC_COGNITO_USER_POOL_ID=your_pool_id
EXPO_PUBLIC_COGNITO_APP_CLIENT_ID=your_app_client_id
EXPO_PUBLIC_COGNITO_DOMAIN=your-domain.auth.eu-west-2.amazoncognito.com
EXPO_PUBLIC_OAUTH_REDIRECT_SIGNIN=exp://127.0.0.1:19000/--/oauthredirect
EXPO_PUBLIC_OAUTH_REDIRECT_SIGNOUT=exp://127.0.0.1:19000/--/oauthredirect
```

## iOS setup
- Apple Sign-In requires Apple Developer account and configuring in Cognito.
- Add `Sign In with Apple` capability in Xcode for the app bundle.
- Google requires configuring an iOS reversed client ID if using Google SDK; with Hosted UI, Cognito handles it.

## Commands
```bash
npm install aws-amplify @aws-amplify/react-native
npx pod-install ios
npx expo start -c
```

## Code entry points
- `utils/amplify.ts`: Amplify.configure(Auth + OAuth)
- `utils/auth/index.ts`: auth wrappers (signIn, signOut, hosted UI)
- `app/_layout.tsx`: calls `configureAmplify()` on startup

## Next implementation steps
1. Add a new screen `app/(auth)/provider-login.tsx` with Google & Apple buttons.
2. After hosted UI returns, check `Auth.currentAuthenticatedUser()` and route to profile completion.
3. Profile completion screen saves data to AsyncStorage and Firestore (or DynamoDB via Amplify DataStore).
4. Persist and route to dashboard.
