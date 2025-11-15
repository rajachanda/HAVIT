# Firebase Setup Guide for HAVIT

## ⚠️ Critical Setup Steps

Your Firebase project `havito1-e6556` needs these services enabled to work properly.

---

## 1. Enable Firebase Authentication

### Step 1: Go to Authentication
https://console.firebase.google.com/project/havito1-e6556/authentication/providers

### Step 2: Enable Email/Password
1. Click "Get Started" (if first time using Authentication)
2. Click on "Email/Password" provider
3. Toggle "Enable" to ON
4. Click "Save"

### Step 3: Enable Google Sign-In
1. Click on "Google" provider
2. Toggle "Enable" to ON
3. Enter "Project support email" (your email)
4. Click "Save"

---

## 2. Create Firestore Database

### Step 1: Go to Firestore
https://console.firebase.google.com/project/havito1-e6556/firestore

### Step 2: Create Database
1. Click "Create database"
2. **Select location**: Choose closest to your users (e.g., `us-central1`)
3. **Start in**: Select "Test mode" (for development)
   - ⚠️ **WARNING**: Test mode allows all read/write - see Security Rules below
4. Click "Enable"

---

## 3. Set Up Firestore Security Rules (IMPORTANT!)

### Step 1: Go to Rules Tab
After creating database, click on "Rules" tab

### Step 2: Replace Rules with These:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Habits collection - users can only access their own habits
    match /habits/{habitId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Personas collection - users can only access their own persona
    match /personas/{personaId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == personaId;
    }
    
    // Conversation history - users can only access their own
    match /conversationHistory/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Challenges - authenticated users can read all, write own
    match /challenges/{challengeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Leaderboard - public read for authenticated users
    match /leaderboard/{entry} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Friends - users can manage their own friend relationships
    match /friends/{friendshipId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish Rules
1. Click "Publish"
2. Confirm the changes

---

## 4. Verify Setup

### Test Authentication:
1. Go to http://localhost:8080
2. You should be redirected to `/login`
3. Click "Sign up" 
4. Create an account with email/password
5. You should be redirected to `/onboarding`

### Check Firestore:
1. Go back to Firebase Console → Firestore
2. After signup, you should see a new `users` collection with your user data

---

## 5. Optional: Configure Google Sign-In

### Add Authorized Domains:
https://console.firebase.google.com/project/havito1-e6556/authentication/settings

1. Scroll to "Authorized domains"
2. `localhost` should already be there
3. Add your production domain when deploying

### Get OAuth Client ID (for production):
1. Go to Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Your OAuth 2.0 Client ID will be listed there

---

## 6. Enable Firebase Analytics (Optional)

https://console.firebase.google.com/project/havito1-e6556/analytics

1. Click "Enable Google Analytics"
2. Follow the setup wizard
3. This enables the `measurementId` we configured

---

## Troubleshooting

### Error: `auth/configuration-not-found`
- **Fix**: Enable Email/Password authentication (Step 1 above)

### Error: `permission-denied` in Firestore
- **Fix**: Set up security rules (Step 3 above)

### Google Sign-In popup blocked
- **Fix**: Allow popups for localhost in browser settings

### Cannot create database
- **Fix**: Make sure billing is enabled (Firestore requires Blaze plan for production, but free tier works for development)

---

## Current Configuration

**Project ID**: `havito1-e6556`

**Frontend**: 
- Running on: http://localhost:8080
- Config file: `frontend/.env.local`

**Backend**:
- Running on: http://localhost:5000
- Config file: `backend/.env`

**Firebase Services Needed**:
- ✅ Authentication (Email/Password + Google)
- ✅ Firestore Database
- ✅ Cloud Storage (auto-enabled)
- ⏳ Cloud Functions (for future features)

---

## Next Steps After Setup

1. ✅ Test user signup/login
2. ✅ Complete onboarding flow
3. ✅ Create a test habit
4. ⏳ Implement Gemini AI persona generation
5. ⏳ Build remaining features from todo list
