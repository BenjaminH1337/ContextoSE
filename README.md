# Contexto Svenska 🇸🇪

Ett svenskt ordgissningsspel inspirerat av det populära Contexto-spelet. Spelare försöker gissa ett hemligt svenskt ord genom att få feedback på hur semantiskt nära deras gissningar är.

## 🚀 Funktioner

- **Google-inloggning** med Firebase Authentication
- **Spellogik** med similarity-beräkningar för svenska ord
- **Leaderboard** för att spåra de bästa spelarna
- **Responsiv design** med Tailwind CSS
- **Firestore-databas** för att spara spelresultat

## 🛠️ Teknisk Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Autentisering**: Firebase Authentication (Google Sign-In)
- **Databas**: Firebase Firestore
- **Deployment**: Vercel/Netlify (rekommenderat)

## 📦 Installation

1. **Klona projektet**
   ```bash
   git clone <repository-url>
   cd contexto-svenska
   ```

2. **Installera dependencies**
   ```bash
   npm install
   ```

3. **Konfigurera Firebase**
   - Skapa ett nytt projekt på [Firebase Console](https://console.firebase.google.com/)
   - Aktivera Authentication → Google Sign-In
   - Skapa Firestore Database (börja i testläge)
   - Kopiera Firebase-konfigurationen

4. **Sätt upp miljövariabler**
   ```bash
   cp env.example .env
   ```
   
   Fyll i dina Firebase-konfigurationsvärden i `.env`-filen:
   ```
   VITE_FIREBASE_API_KEY=din_api_key
   VITE_FIREBASE_AUTH_DOMAIN=din_auth_domain
   VITE_FIREBASE_PROJECT_ID=ditt_project_id
   VITE_FIREBASE_STORAGE_BUCKET=din_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=din_sender_id
   VITE_FIREBASE_APP_ID=ditt_app_id
   ```

5. **Starta utvecklingsservern**
   ```bash
   npm run dev
   ```

## 🔧 Firebase-konfiguration

### Firestore Säkerhetsregler

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /gameResults/{resultId} {
      allow read: if true;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    match /dailyWords/{date} {
      allow read: if true;
      allow write: if false; // Endast admin
    }
  }
}
```

### Databasstruktur

**users/**
```
userId (document ID)
  - displayName: string
  - email: string
  - photoURL: string
  - createdAt: timestamp
  - totalGames: number
  - totalWins: number
```

**gameResults/**
```
resultId (auto-generated)
  - userId: string
  - targetWord: string
  - guesses: number
  - won: boolean
  - timestamp: timestamp
  - attempts: Array<string>
```

## 🎮 Hur man spelar

1. **Logga in** med ditt Google-konto
2. **Gissa ord** genom att skriva svenska ord i input-fältet
3. **Få feedback** om hur nära din gissning är till det rätta ordet
4. **Använd ledtrådarna** för att komma närmare det rätta svaret
5. **Vinn** genom att gissa rätt ord!

## 🔮 Framtida förbättringar

- **Bättre similarity-algoritm** med svenska word embeddings
- **Dagligt ord**-funktion
- **Statistik per användare**
- **Olika svårighetsgrader**
- **Sociala funktioner** (dela resultat)
- **Mobila notifikationer**

## 🤝 Bidrag

Bidrag är välkomna! Öppna en issue eller skicka en pull request.

## 📄 Licens

MIT License - se LICENSE-filen för detaljer.

## 🙏 Tack

Tack till originalet Contexto för inspirationen!