# 🎯 Contexto Svenska

**Ett svenskt ordgissningsspel inspirerat av Contexto - där semantisk likhet leder dig till det dagliga ordet!**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

## 🎮 Vad gör detta spel unikt?

**Contexto Svenska** är inte bara ett ordgissningsspel - det är en semantisk resa genom svenska språket! Till skillnad från Wordle som fokuserar på bokstavspositioner, använder vi avancerad semantisk analys för att ge dig meningsfulla ledtrådar.

### ✨ Huvudfunktioner

- 🎯 **Dagligt svenskt ord** - Ett nytt ord varje dag för alla spelare
- 🧠 **Semantisk likhet** - Få ledtrådar baserat på betydelse, inte bara stavning
- 🏆 **Daglig leaderboard** - Topp 5 vinnare med färre gissningar
- 📊 **Historisk statistik** - Följ din utveckling över tid
- 🔒 **Säker server-side logik** - Semantisk analys skyddad från klienten
- ⚡ **Obegränsade gissningar** - Spela tills du hittar rätt ord
- 🚫 **En chans per dag** - Fair play för alla spelare

## 🛠️ Teknisk Stack

### Frontend
- **React 18** + **TypeScript** - Moderna UI-komponenter
- **Vite** - Snabb utvecklingsserver och build
- **Tailwind CSS** - Responsiv design system
- **Firebase Auth** - Google Sign-In integration

### Backend
- **Express.js** - RESTful API server
- **Custom Semantic Engine** - Hierarkisk kategori-baserad likhet
- **Rate Limiting** - 500 gissningar per runda
- **JWT Authentication** - Säker API-kommunikation

### Database & Storage
- **Firebase Firestore** - Användardata och spelresultat
- **In-memory Storage** - Dagliga leaderboards och spelarstatus

## 🚀 Snabbstart

### Förutsättningar
- Node.js 18+ 
- npm eller yarn
- Firebase-projekt (för authentication)

### Installation

1. **Klona repositoryt**
   ```bash
   git clone https://github.com/BenjaminH1337/ContextoSE.git
   cd ContextoSE/contexto-svenska
   ```

2. **Installera dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd server
   npm install
   cd ..
   ```

3. **Konfigurera miljövariabler**
   ```bash
   # Kopiera exempel-filen
   cp env.example .env
   
   # Fyll i dina Firebase-uppgifter
   nano .env
   ```

4. **Starta utvecklingsservrar**
   ```bash
   # Terminal 1: Backend (port 3001)
   cd server && node index.js
   
   # Terminal 2: Frontend (port 5173)
   npm run dev
   ```

5. **Öppna i webbläsaren**
   ```
   http://localhost:5173
   ```

## 🎯 Hur man spelar

1. **Logga in** med Google-kontot
2. **Gissa svenska ord** - få semantiska ledtrådar
3. **Se din ranking** - färre gissningar = bättre placering
4. **Kom tillbaka imorgon** för ett nytt ord!

### Ledtrådar
- **Perfekt!** - Exakt match (du vann!)
- **Väldigt nära!** - 80%+ semantisk likhet
- **Nära** - 60-80% likhet
- **Ganska nära** - 40-60% likhet
- **Långt borta** - Under 40% likhet

## 🏗️ Projektstruktur

```
contexto-svenska/
├── src/                    # Frontend React-app
│   ├── components/         # UI-komponenter
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API-kommunikation
│   ├── types/             # TypeScript definitions
│   └── firebase/          # Firebase konfiguration
├── server/                # Backend Express-server
│   ├── index.js           # Huvudserver med API-endpoints
│   └── package.json       # Server dependencies
├── public/                # Statiska filer
└── docs/                  # Dokumentation
```

## 🔧 API Endpoints

| Endpoint | Method | Beskrivning |
|----------|--------|-------------|
| `/api/daily-word` | GET | Hämta dagens ord |
| `/api/validate-word` | POST | Validera svenskt ord |
| `/api/calculate-similarity` | POST | Beräkna semantisk likhet |
| `/api/save-game-result` | POST | Spara spelresultat |
| `/api/daily-leaderboard` | GET | Daglig topplista |
| `/api/historical-leaderboards` | GET | Historiska resultat |
| `/api/player-stats` | GET | Spelarstatistik |

## 🧠 Semantisk Likhet

Vår algoritm använder en hierarkisk kategori-baserad approach:

- **Starka relationer** (0.9-1.0): Direkta synonymer, hyperonymer
- **Milda relationer** (0.6-0.8): Relaterade koncept, samma kategori
- **Orthografisk fallback** (0.1-0.5): Levenshtein distance för okända ord

## 🔒 Säkerhet

- ✅ **Server-side validation** - All semantisk logik på servern
- ✅ **Rate limiting** - 500 gissningar per runda
- ✅ **Input sanitization** - Säker ordvalidering
- ✅ **JWT tokens** - Säker API-autentisering
- ✅ **CORS protection** - Begränsad cross-origin access

## 🤝 Bidra

Vi välkomnar bidrag! Se [CONTRIBUTING.md](CONTRIBUTING.md) för detaljer.

### Utvecklingsworkflow
1. Fork repositoryt
2. Skapa feature branch (`git checkout -b feature/amazing-feature`)
3. Commit ändringar (`git commit -m 'Add amazing feature'`)
4. Push till branch (`git push origin feature/amazing-feature`)
5. Öppna Pull Request

## 📋 Roadmap

### Kort sikt (veckor)
- [ ] Automatiserade tester (Jest, Vitest)
- [ ] ESLint + Prettier konfiguration
- [ ] GitHub Actions CI/CD
- [ ] Förbättrad dokumentation

### Medellång sikt (månader)
- [ ] Docker containerization
- [ ] Produktionsdeployment
- [ ] Prestandaoptimering
- [ ] Tillgänglighetsförbättringar

### Lång sikt (framtiden)
- [ ] Mobilapp (React Native)
- [ ] Flerspråkigt stöd
- [ ] Sociala funktioner
- [ ] AI-driven ordval

## 📄 Licens

Detta projekt är licensierat under MIT License - se [LICENSE](LICENSE) filen för detaljer.

## 🙏 Tack

- **Contexto** för inspirationen
- **Firebase** för backend-tjänster
- **Tailwind CSS** för styling
- **Svenska språket** för alla fantastiska ord!

## 📞 Kontakt

**Benjamin Hawtin** - [@BenjaminH1337](https://github.com/BenjaminH1337)

Projektlänk: [https://github.com/BenjaminH1337/ContextoSE](https://github.com/BenjaminH1337/ContextoSE)

---

**Lycka till med att lösa dagens ord! 🎯**