# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **NEW PROJECT**
4. Name it "Dawat" and click **CREATE**
5. Wait for the project to be created, then select it

## Step 2: Enable Google+ API
1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for **Google+ API**
3. Click on it and press **ENABLE**
4. Wait for it to enable

## Step 3: Create OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type and click **CREATE**
3. Fill in the form:
   - **App name**: Dawat
   - **User support email**: your@email.com
   - **Developer contact**: your@email.com
4. Click **SAVE AND CONTINUE** (no scopes needed to be added)
5. Add test users if you want (your Gmail account)
6. Click **SAVE AND CONTINUE** and finish

## Step 4: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application**
4. Name it "Dawat Web"
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/callback` (for development)
6. Click **CREATE** and note the **Client ID** and **Client Secret**
   - This is your `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

## Step 5: Create iOS OAuth Credentials
1. In the same **Credentials** page, click **+ CREATE CREDENTIALS** → **OAuth client ID** again
2. Select **iOS**
3. Name it "Dawat iOS"
4. For **Bundle ID**, enter: `com.banothganesh.dawat`
5. For **Team ID**, leave empty (or add your Apple Developer Team ID if you have one)
6. Click **CREATE** and note the **Client ID**
   - This is your `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

## Step 6: Configure Redirect URIs in Google Cloud
1. Back in **Credentials**, click on your **Web application** client you just created
2. Under **Authorized redirect URIs**, add **ONLY**:
   ```
   http://localhost:3000/callback
   ```
   **Important**: Do NOT add the `exp://` URIs here—they are handled automatically by Expo AuthSession at runtime. Google Cloud only accepts HTTP/HTTPS URLs for Web clients.
3. Click **SAVE**

## Step 7: Update app.json
Update `/Users/banothganesh/Desktop/Dawat/app.json` with your credentials:

```json
"extra": {
  "router": {},
  "eas": {
    "projectId": "bf0684ab-caed-44a4-922a-75daae48a5b5"
  },
  "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "your-web-client-id-here.apps.googleusercontent.com",
  "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID": "your-ios-client-id-here.apps.googleusercontent.com",
  "EXPO_PUBLIC_OAUTH_REDIRECT_SIGNIN": "exp://127.0.0.1:19000/--/oauthredirect",
  "EXPO_PUBLIC_OAUTH_REDIRECT_SIGNOUT": "exp://127.0.0.1:19000/--/oauthredirect"
}
```

## Step 8: Test Google Sign-In
1. Clear Expo cache and restart:
   ```bash
   npx expo start -c
   ```
2. Press `i` to open iOS simulator
3. On the login screen, tap **Continue with Google**
4. You should now be redirected to Google's OAuth consent screen
5. After signing in, you should be redirected back to the app

## Troubleshooting

### "Network connection was lost"
- Make sure your `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set in `app.json`
- Verify the redirect URI is correctly added in Google Cloud Console
- Check that your redirect URI matches the one in the code (currently `exp://127.0.0.1:19000/--/oauthredirect`)

### "Invalid client" error
- Double-check your Client ID is correct (copied exactly from Google Cloud Console)
- Make sure you're using the **Web Client ID** for web/dev, not the iOS ID

### iOS-specific issues
- If testing on physical device, use your device's IP instead of 127.0.0.1:
  - In terminal: `ifconfig | grep inet` to find your IP
  - Update redirect URI: `exp://your-ip:19000/--/oauthredirect`
  - Update `app.json` with the same URI

### Simulator issues
- Try restarting the simulator: `xcrun simctl erase all`
- Clear app data and cache between tests

## Additional Resources
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Firebase Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
- [Google Cloud Console](https://console.cloud.google.com/)
