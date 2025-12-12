# Registration & Authentication Flow - Complete Guide

## Overview
The registration process is now **robust and persistent**, storing user data across:
1. **Firebase Authentication** - For secure user credentials
2. **Firestore Database** - For user profile information
3. **AsyncStorage** - For local device storage (offline access, quick app startup)
4. **Redux Store** - For in-app state management

---

## Registration Process Flow

### 1. User Registration (register.tsx)
When a user signs up:

**Steps:**
1. User fills in form with email, password, name, address, postcode, city, county, mobile number
2. Form validation checks all required fields
3. Account created in Firebase Authentication
4. User profile saved to Firestore with all details:
   ```
   uid: <Firebase UID>
   email: <user email>
   firstName: <first name>
   lastName: <last name>
   fullName: <concatenated name>
   address: <street address>
   city: <city>
   county: <county>
   postcode: <postcode>
   mobileNumber: <phone>
   createdAt: <timestamp>
   ```
5. **NEW:** User data immediately saved to AsyncStorage for quick access
6. **NEW:** Redux store updated with user information
7. User redirected to login screen

**Key Enhancement:** User data is now persisted locally, so if the app crashes, data is preserved.

---

### 2. User Login (login.tsx)
When a user logs in:

**Steps:**
1. User enters email and password
2. Firebase authentication verifies credentials
3. **NEW:** User profile fetched from Firestore using their uid
4. **NEW:** User data saved to AsyncStorage (`user` key)
5. **NEW:** User ID saved to AsyncStorage (`userId` key)
6. **NEW:** Redux store updated with user information:
   ```typescript
   dispatch(setReduxUser({
       firstName: userData.firstName,
       lastName: userData.lastName,
       postcode: userData.postcode,
       address: userData.address,
       city: userData.city,
       county: userData.county,
       name: userData.fullName,
       location: userData.address,
       avatar: "profile.png",
   }));
   ```
7. User redirected to home page

**Key Enhancement:** Complete user information is available immediately after login for use throughout the app.

---

### 3. App Startup (AuthContext.tsx)
When the app starts:

**Bootstrap Process:**
1. Check if user data exists in AsyncStorage
2. If found, restore user to context and Redux store immediately
3. Listen for Firebase auth state changes
4. If user is authenticated in Firebase:
   - Fetch fresh data from Firestore
   - Update AsyncStorage with latest data
   - Update Redux store
5. If user is signed out:
   - Clear AsyncStorage
   - Clear Redux state
   - Show login screen

**Benefits:**
- App boots instantly with cached user data
- User doesn't need to log in again if still authenticated
- Fresh data is always fetched from Firebase
- Seamless offline-to-online transition

---

### 4. Root Layout Integration (_layout.tsx)
The root layout now:
1. Wraps the entire app with `<AuthProvider>`
2. Wraps Redux `<Provider>` around AuthProvider
3. Listens to `useAuth()` hook for authentication state
4. Conditionally shows auth screens or app screens based on `isSignedIn` flag

```
<Provider store={store}>
  <AuthProvider>
    {isSignedIn ? <AppScreens /> : <AuthScreens />}
  </AuthProvider>
</Provider>
```

---

## User Data Availability

### During Food Upload
When posting food, the app has full user information available:

```typescript
// From Redux store (user object)
- user.firstName      // "John"
- user.lastName       // "Doe"
- user.postcode       // "SW1A 1AA"
- user.address        // "123 Main St"
- user.city           // "London"
- user.county         // "Greater London"
- user.location       // Calculated location
```

**Food upload automatically includes:**
- Chef name: `${firstName} ${lastName}`
- Chef avatar: user.avatar
- Supplier location: user.address
- Supplier postcode: user.postcode
- Supplier ID: user.firstName (or configurable)

---

## Data Flow Diagram

```
┌─────────────────┐
│   User Signup   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Firebase Auth      │
│ Create User        │
└────────┬────────────┘
         │
         ▼
┌──────────────────────┐
│ Firestore Database  │
│ Save User Profile   │
└────────┬─────────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│  AsyncStorage    │   │   Redux Store    │
│  (Local Device)  │   │   (App State)    │
└──────┬───────────┘   └──────┬───────────┘
       │                      │
       └──────────┬───────────┘
                  │
                  ▼
         ┌─────────────────────┐
         │   Use on Login      │
         │   Use in Food Posts │
         │   Use in Profile    │
         └─────────────────────┘
```

---

## AsyncStorage Keys

The following keys are stored in AsyncStorage:

| Key | Purpose | Example Value |
|-----|---------|---------------|
| `user` | Complete user profile as JSON string | `{"firstName":"John","lastName":"Doe",...}` |
| `userId` | Firebase user ID for reference | `"user_12345abc"` |

---

## Error Handling

### Registration Errors
- **Email already in use:** "This email is already registered."
- **Weak password:** "Password is too weak."
- **Invalid email:** "Invalid email address."
- **Network error:** Generic "Registration failed" message

### Login Errors
- **User not found:** "No account found with this email."
- **Wrong password:** "Incorrect password."
- **Invalid email:** "Invalid email address."
- **Too many attempts:** "Too many failed login attempts. Please try again later."
- **User disabled:** "This account has been disabled."

---

## Security Considerations

✅ **Implemented:**
- User passwords encrypted in Firebase
- User data encrypted in transit (HTTPS)
- AsyncStorage for local persistence (device-level security)
- Redux for in-memory state (cleared on logout)

⚠️ **Recommendations:**
- Do not store sensitive data like passwords in AsyncStorage
- Periodically refresh user data from Firestore
- Implement logout to clear all user data
- Use Firebase Security Rules to control data access

---

## Testing the Flow

### Test 1: New User Registration
1. Launch app
2. Go to Register
3. Fill form with test data
4. Submit
5. Should see success alert
6. Should be redirected to login
7. Check AsyncStorage: `user` key should have profile data

### Test 2: Login with Registered User
1. On login screen, enter credentials
2. Submit
3. Should fetch from Firestore
4. Should update Redux store
5. Should redirect to home
6. User name should be visible throughout app

### Test 3: App Restart
1. Login successfully
2. Force close app (kill process)
3. Relaunch app
4. Should go directly to home (user cached in AsyncStorage)
5. Data should be fresh (fetched from Firebase)

### Test 4: Food Upload
1. Login
2. Go to Post Food tab
3. Upload food
4. Chef name should be auto-filled with logged-in user's name
5. Address should be from user's registered address
6. Postcode should be from user's registered postcode

---

## Troubleshooting

### User data not showing after login
- Check Firebase Firestore has user document with uid
- Verify Redux middleware is working
- Check AsyncStorage permissions

### App doesn't persist login after restart
- Verify AsyncStorage library is linked
- Check Firebase auth state listener is registered
- Verify AuthProvider wraps entire app

### Food upload missing user name
- Check Redux store has user data
- Verify upload.tsx accesses user from Redux
- Check user.firstName and user.lastName are not empty

---

## File Changes Summary

| File | Changes |
|------|---------|
| `context/AuthContext.tsx` | Complete rewrite with AsyncStorage, Firebase integration, auth state listener |
| `app/(auth)/login.tsx` | Added `saveUserDataLocally()` function, AsyncStorage/Redux updates |
| `app/(auth)/register.tsx` | Added AsyncStorage/Redux saving after Firebase registration |
| `app/_layout.tsx` | Wrapped with AuthProvider, integrated useAuth hook |
| `store/slices/userSlice.ts` | No changes (already compatible) |
| `app/post-food/upload.tsx` | No changes (already uses Redux user data) |

---

## Next Steps

1. Test the complete registration and login flow
2. Verify user data persists across app restarts
3. Test food upload with user information
4. Implement password reset functionality
5. Add email verification for security
6. Implement user profile editing
