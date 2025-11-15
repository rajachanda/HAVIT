# HAVIT - Gamified Habit Tracking Platform

A modern, gamified habit tracking application with AI-powered coaching, character progression, and social features.

## 🏗️ Project Structure

```
HAVIT/
├── frontend/              # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   ├── contexts/     # React contexts (Auth, etc.)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and Firebase API
│   │   └── config/       # Firebase client config
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
│
├── backend/              # Express + Firebase Admin backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── config/       # Firebase Admin config
│   └── package.json      # Backend dependencies
│
└── package.json          # Root scripts to run both
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Firebase account with project setup
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajachanda/HAVIT.git
   cd HAVIT
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   **Frontend** (`frontend/.env.local`):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

   **Backend** (`backend/.env`):
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your_client_id
   FRONTEND_URL=http://localhost:8082
   ```

### Running the Application

**Development mode (runs both frontend and backend):**
```bash
npm run dev
```

This starts:
- Frontend: `http://localhost:8082`
- Backend: `http://localhost:5000`

**Run frontend only:**
```bash
cd frontend
npm run dev
```

**Run backend only:**
```bash
cd backend
npm run dev
```

## 🎮 Features

### ✅ Implemented
- **Authentication** - Email/password + Google OAuth
- **Conversational Onboarding** - 10-question AI chatbot
- **Character Selection** - 4 archetypes with full customization
- **Habit Tracking** - Create, complete, delete habits with XP & streaks
- **Dashboard** - Real-time user stats and progress
- **Firebase Integration** - Firestore database with real-time sync
- **Protected Routes** - Secure authentication flow

### 🚧 In Progress
- Gemini AI integration for persona generation
- Character preview renderer
- Habit edit modal

### 📋 Planned
- Leaderboard with Firebase data
- Challenges system
- Squad/Friends features
- Community feed
- Firestore security rules

## 🛠️ Tech Stack

**Frontend:**
- React 18.3.1
- TypeScript
- Vite 5.4.19
- Tailwind CSS
- shadcn-ui
- React Router
- React Query
- Firebase SDK 9+

**Backend:**
- Node.js
- Express
- Firebase Admin SDK
- CORS, Helmet, Morgan

**Database:**
- Firebase Firestore
- Collections: users, habits, conversationHistory, personas, challenges, leaderboard, friends

## 📚 Documentation

See [FIREBASE_INTEGRATION.md](./FIREBASE_INTEGRATION.md) for detailed Firebase setup and API documentation.

---

## Original Project Info

**URL**: https://lovable.dev/projects/18a65ab3-702d-4389-a954-6c6dcbec8039

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/18a65ab3-702d-4389-a954-6c6dcbec8039) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/rajachanda/havit.git

# Step 2: Navigate to the project directory.
cd havit

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Features

- **Character Progression System**: Level-based character evolution with visual progression
- **Thunder Animation**: Smooth blue-themed lightning effects on level up
- **Habit Tracking**: Complete habit management system
- **Social Features**: Challenges, leaderboards, and community features

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/18a65ab3-702d-4389-a954-6c6dcbec8039) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
