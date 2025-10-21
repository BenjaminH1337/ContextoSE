# 🤝 Contributing to Contexto Svenska

Tack för att du vill bidra till Contexto Svenska! Vi välkomnar alla typer av bidrag - från buggfixar till nya funktioner.

## 🚀 Snabbstart för bidrag

1. **Fork** repositoryt på GitHub
2. **Klona** din fork lokalt:
   ```bash
   git clone https://github.com/DITT-ANVÄNDARNAMN/ContextoSE.git
   cd ContextoSE/contexto-svenska
   ```
3. **Skapa** en ny branch för ditt bidrag:
   ```bash
   git checkout -b feature/ditt-bidrag
   ```
4. **Gör** dina ändringar
5. **Testa** att allt fungerar
6. **Commit** dina ändringar:
   ```bash
   git add .
   git commit -m "Add: beskrivning av ditt bidrag"
   ```
7. **Push** till din fork:
   ```bash
   git push origin feature/ditt-bidrag
   ```
8. **Skapa** en Pull Request på GitHub

## 📋 Typer av bidrag vi söker

### 🐛 Bug Reports
- Rapportera buggar med detaljerad beskrivning
- Inkludera steg för att reproducera problemet
- Ange din miljö (OS, webbläsare, Node.js version)

### ✨ Nya funktioner
- Förbättringar av semantisk likhet
- Nya UI-komponenter
- Prestandaoptimeringar
- Tillgänglighetsförbättringar

### 📚 Dokumentation
- Förbättringar av README
- API-dokumentation
- Kodkommentarer
- Tutorials och guider

### 🧪 Tester
- Unit tests för backend-logik
- Integration tests för API
- Frontend component tests
- E2E tests för användarflöden

## 🛠️ Utvecklingsmiljö

### Förutsättningar
- Node.js 18+
- npm eller yarn
- Git
- Firebase-konto (för testing)

### Setup
```bash
# Installera dependencies
npm install
cd server && npm install && cd ..

# Kopiera miljövariabler
cp env.example .env
# Fyll i dina Firebase-uppgifter i .env

# Starta utvecklingsservrar
# Terminal 1: Backend
cd server && node index.js

# Terminal 2: Frontend  
npm run dev
```

## 📝 Kodstandarder

### TypeScript/JavaScript
- Använd TypeScript för all ny kod
- Följ ESLint-reglerna
- Använd Prettier för formatering
- Skriv beskrivande variabel- och funktionsnamn

### React Components
- Använd funktionella komponenter med hooks
- Props ska vara typsäkra med TypeScript interfaces
- Komponenter ska vara små och fokuserade
- Använd Tailwind CSS för styling

### Backend
- Använd Express.js best practices
- Validera all input
- Hantera fel på ett konsekvent sätt
- Logga viktiga händelser

## 🧪 Testing

### Frontend Tests
```bash
# Kör tester (när implementerat)
npm test

# Kör tester i watch mode
npm run test:watch
```

### Backend Tests
```bash
# Kör server-tester (när implementerat)
cd server && npm test
```

### Manual Testing
- Testa alla funktioner manuellt
- Kontrollera olika webbläsare
- Testa responsiv design
- Verifiera Firebase-integration

## 📦 Commit Messages

Använd beskrivande commit-meddelanden:

```
feat: add daily word rotation system
fix: resolve semantic similarity calculation bug
docs: update API documentation
style: format code with Prettier
refactor: simplify game logic
test: add unit tests for word validation
```

## 🔍 Code Review Process

1. **Automatiska kontroller** körs på alla PRs
2. **Minst en reviewer** måste godkänna ändringar
3. **Diskussion** om ändringar sker i PR-kommentarer
4. **Merge** sker efter godkännande

### Review Checklist
- [ ] Kod följer projektets standarder
- [ ] Funktioner är väl testade
- [ ] Dokumentation är uppdaterad
- [ ] Inga breaking changes utan diskussion
- [ ] Prestanda påverkas inte negativt

## 🐛 Rapportera problem

### Bug Reports
Använd GitHub Issues med följande mall:

```markdown
**Beskrivning av buggen**
En tydlig beskrivning av vad som är fel.

**Steg för att reproducera**
1. Gå till '...'
2. Klicka på '...'
3. Scrolla ner till '...'
4. Se felet

**Förväntat beteende**
Vad som borde hända istället.

**Miljö**
- OS: [t.ex. macOS, Windows, Linux]
- Webbläsare: [t.ex. Chrome, Firefox, Safari]
- Node.js version: [t.ex. 18.17.0]

**Skärmdumpar**
Om tillämpligt, lägg till skärmdumpar.

**Ytterligare kontext**
Lägg till annan kontext om problemet.
```

### Feature Requests
```markdown
**Funktion som önskas**
En tydlig beskrivning av funktionen.

**Motivering**
Varför skulle denna funktion vara användbar?

**Förslag till implementation**
Om du har idéer om hur det skulle kunna implementeras.

**Alternativ**
Beskriv alternativa lösningar du har övervägt.
```

## 🏷️ Labels

Vi använder följande labels för issues och PRs:

- `bug` - Något som inte fungerar
- `enhancement` - Ny funktion eller förbättring
- `documentation` - Förbättringar av dokumentation
- `good first issue` - Bra för nya bidragsgivare
- `help wanted` - Extra hjälp behövs
- `question` - Frågor eller diskussioner
- `wontfix` - Inte planerat att fixa

## 📞 Kontakt

- **Issues**: Använd GitHub Issues för buggar och förfrågningar
- **Diskussioner**: Använd GitHub Discussions för allmänna frågor
- **Email**: [Din email] för privata frågor

## 📄 Licens

Genom att bidra till detta projekt godkänner du att dina bidrag licensieras under MIT License.

## 🙏 Tack

Tack för att du bidrar till Contexto Svenska! Dina bidrag gör spelet bättre för alla spelare. 🎯
