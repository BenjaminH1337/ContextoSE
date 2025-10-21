const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, updateDoc, increment, query, where, getDocs, orderBy, limit } = require('firebase/firestore');

const app = express();
const PORT = process.env.PORT || 3001;

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting - 500 guesses per round (generous limit)
const gameRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 500, // 500 guesses per day per IP
  message: { error: 'Too many guesses today. Try again tomorrow.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting for API calls
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 API calls per 15 minutes
  message: { error: 'Too many requests. Please try again later.' }
});

app.use('/api/game', gameRateLimit);
app.use('/api', apiRateLimit);

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Swedish word categories (server-side only)
const categories = {
  mat: {
    words: ['mat', 'äta', 'hunger', 'måltid', 'middag', 'frukost', 'lunch', 'kvällsmat', 'snack', 'godis', 'kaka', 'bröd', 'ost', 'kött', 'fisk', 'kyckling', 'frukt', 'grönsak', 'vegetarisk', 'vegan', 'recept', 'kokbok'],
    subCategories: {
      matlagning: ['recept', 'kokbok', 'laga', 'koka', 'steka', 'grilla', 'baka'],
      måltider: ['frukost', 'lunch', 'middag', 'kvällsmat', 'snack', 'mellanmål'],
      livsmedel: ['bröd', 'ost', 'kött', 'fisk', 'frukt', 'grönsak']
    }
  },
  kök: {
    words: ['kök', 'köksbord', 'bord', 'tallrik', 'bestick', 'glas', 'kopp', 'mugg', 'kanna', 'spis', 'ugn', 'kylskåp', 'frys', 'disk', 'diskho', 'skafferi', 'skåp'],
    subCategories: {
      möbler: ['köksbord', 'bord', 'stol', 'pall', 'bänk'],
      porslin: ['tallrik', 'skål', 'kopp', 'mugg', 'glas', 'kanna'],
      verktyg: ['bestick', 'kniv', 'gaffel', 'sked', 'skål', 'kastrull', 'panna']
    }
  },
  familj: {
    words: ['familj', 'förälder', 'mamma', 'pappa', 'mor', 'far', 'mormor', 'morfar', 'farmor', 'farfar', 'syskon', 'bror', 'syster', 'kusin', 'moster', 'morbror', 'faster', 'farbror', 'barn', 'bebis', 'tonåring', 'vuxen', 'släkt', 'anhörig'],
    subCategories: {
      föräldrar: ['mamma', 'pappa', 'mor', 'far', 'förälder'],
      mor_far_föräldrar: ['mormor', 'morfar', 'farmor', 'farfar'],
      syskon: ['bror', 'syster', 'syskon']
    }
  },
  hem: {
    words: ['hem', 'hus', 'lägenhet', 'rum', 'sovrum', 'vardagsrum', 'kök', 'badrum', 'hall', 'garage', 'balkong', 'trädgård', 'vind', 'källare'],
    subCategories: {
      rum: ['sovrum', 'vardagsrum', 'kök', 'badrum', 'hall', 'arbetsrum'],
      möbler: ['säng', 'soffa', 'bord', 'stol', 'skåp', 'hylla', 'lampa']
    }
  },
  natur: {
    words: ['natur', 'skog', 'träd', 'park', 'trädgård', 'blomma', 'ros', 'gräs', 'löv', 'gren', 'jord', 'mark', 'sten', 'berg', 'sjö', 'hav', 'strand', 'vatten'],
    subCategories: {
      växter: ['träd', 'blomma', 'ros', 'gräs', 'löv', 'buske'],
      vatten: ['sjö', 'hav', 'strand', 'vatten', 'å', 'bäck']
    }
  },
  väder: {
    words: ['väder', 'regn', 'snö', 'sol', 'moln', 'vind', 'storm', 'åska', 'blixt', 'frost', 'is', 'dimma'],
    subCategories: {}
  },
  djur: {
    words: ['djur', 'hund', 'katt', 'häst', 'ko', 'fågel', 'fisk', 'orm', 'björn', 'varg', 'räv', 'hare', 'kanin', 'ekorre', 'uggla', 'örn', 'delfin'],
    subCategories: {
      husdjur: ['hund', 'katt', 'kanin', 'hamster'],
      gårdsdjur: ['häst', 'ko', 'gris', 'höna', 'get'],
      vilda: ['björn', 'varg', 'räv', 'älg', 'lodjur']
    }
  },
  sport: {
    words: ['sport', 'fotboll', 'hockey', 'tennis', 'basket', 'simning', 'löpning', 'cykling', 'skidåkning', 'träning', 'gym', 'yoga'],
    subCategories: {}
  },
  känslor: {
    words: ['glädje', 'lycka', 'kärlek', 'vänskap', 'sorg', 'rädsla', 'ilska', 'oro', 'lugn', 'fred', 'hopp', 'stolthet'],
    subCategories: {}
  }
};

const strongRelations = {
  'mat': ['kök', 'familj'],
  'kök': ['mat', 'hem'],
  'familj': ['hem', 'mat'],
  'hem': ['familj', 'kök'],
  'natur': ['väder', 'djur'],
  'väder': ['natur'],
  'djur': ['natur']
};

const weakRelations = {
  'mat': ['natur', 'djur'],
  'familj': ['känslor'],
  'sport': ['känslor'],
  'hem': ['natur']
};

// Comprehensive Swedish word list
const swedishWords = [
  // Natur och väder
  'solstråle', 'fjäril', 'natur', 'skog', 'sjö', 'berg', 'hav', 'moln', 'regn', 'snö',
  'sol', 'måne', 'stjärna', 'dag', 'natt', 'morgon', 'kväll', 'vind', 'blixt', 'åska',
  'träd', 'lund', 'park', 'trädgård', 'blomma', 'ros', 'tulpan', 'lilja', 'gräs', 'löv',
  'barr', 'gren', 'stam', 'rot', 'jord', 'mark', 'sten', 'fjäll', 'dal', 'strand', 'sand',
  'frost', 'is', 'snöstorm', 'dimma', 'himmel', 'sky', 'vinter', 'sommar', 'vår', 'höst',
  
  // Känslor och koncept
  'glädje', 'kärlek', 'vänskap', 'harmoni', 'hopp', 'mod', 'visdom', 'sanning',
  'rättvisa', 'fred', 'frid', 'lugn', 'oro', 'fruktan', 'dumhet', 'lögn',
  'lycka', 'rädsla', 'ångest', 'stress', 'depression', 'sorg', 'ilskan', 'hat', 'avund',
  'svartsjuka', 'skuld', 'skam', 'stolthet', 'tacksamhet', 'medkänsla', 'empati', 'sympati',
  'respekt', 'tillit', 'tro', 'tvivel', 'förvåning', 'nyfikenhet', 'entusiasm', 'passion',
  
  // Liv och tid
  'liv', 'död', 'tid', 'äventyr', 'drömmar', 'minnen', 'framtid', 'förflutet',
  'barndom', 'ungdom', 'vuxenliv', 'ålderdom', 'generation', 'tradition', 'kultur',
  
  // Familj och relationer
  'familj', 'vän', 'hem', 'barn', 'förälder', 'syskon', 'mormor', 'morfar',
  'mamma', 'pappa', 'mor', 'far', 'farmor', 'farfar', 'bror', 'syster', 'kusin', 'moster',
  'morbror', 'faster', 'farbror', 'bebis', 'tonåring', 'ungdom', 'vuxen', 'äldre',
  'släkt', 'anhörig', 'make', 'maka', 'fru', 'man', 'pojkvän', 'flickvän', 'partner',
  
  // Hem och boende
  'hus', 'lägenhet', 'rum', 'sovrum', 'vardagsrum', 'kök', 'badrum', 'hall', 'garage', 'balkong',
  'trädgård', 'vind', 'källare', 'trappa', 'dörr', 'fönster', 'tak', 'vägg', 'golv',
  'säng', 'soffa', 'bord', 'stol', 'skåp', 'hylla', 'lampa', 'matta', 'gardin', 'spegel',
  
  // Kunskap och lärande
  'kunskap', 'frihet', 'utbildning', 'bok', 'skola', 'universitet', 'forskning',
  'högskola', 'lärare', 'professor', 'student', 'elev', 'klassrum', 'föreläsning', 'seminar',
  'kurs', 'examen', 'diplom', 'certifikat', 'biologi', 'historia', 'geografi', 'språk',
  'litteratur', 'filosofi', 'psykologi', 'sociologi', 'ekonomi', 'juridik', 'medicin',
  
  // Mat och dryck
  'mat', 'vatten', 'kaffe', 'te', 'bröd', 'ost', 'kött', 'fisk', 'frukt', 'grönsak',
  'äta', 'hunger', 'måltid', 'middag', 'frukost', 'lunch', 'kvällsmat', 'snack', 'godis', 'kaka',
  'kyckling', 'vegetarisk', 'vegan', 'recept', 'kokbok', 'köksbord', 'bord', 'tallrik', 'bestick',
  'glas', 'kopp', 'mugg', 'kanna', 'kök', 'spis', 'ugn', 'kylskåp', 'frys', 'disk', 'diskho',
  'mjölk', 'juice', 'öl', 'vin', 'vatten', 'saft', 'choklad', 'glass', 'tårta', 'körsbär',
  'äpple', 'banan', 'apelsin', 'jordgubbe', 'blåbär', 'hallon', 'morot', 'potatis', 'tomat',
  'gurka', 'lök', 'vitlök', 'peppar', 'salt', 'socker', 'smör', 'margarin', 'olja',
  
  // Färger och former
  'röd', 'blå', 'grön', 'gul', 'vit', 'svart', 'cirkel', 'kvadrat', 'triangel',
  'orange', 'lila', 'rosa', 'brun', 'grå', 'silver', 'guld', 'färg', 'nyans', 'ton',
  
  // Djur
  'djur', 'hund', 'katt', 'häst', 'ko', 'fågel', 'fisk', 'orm', 'björn', 'varg', 'räv',
  'hare', 'kanin', 'ekorre', 'igelkott', 'mullvad', 'råtta', 'mus', 'fladdermus', 'uggla',
  'örn', 'falk', 'kråka', 'sparv', 'kolibri', 'pingvin', 'delfin', 'val', 'haj', 'krokodil',
  'ödla', 'groda', 'troll', 'myra', 'bin', 'spindel', 'fjäril', 'humla', 'geting', 'fluga',
  'elefant', 'lejon', 'tiger', 'apa', 'giraff', 'zebra', 'noshörning', 'flodhäst', 'panda',
  
  // Transport
  'bil', 'tåg', 'flygplan', 'båt', 'cykel', 'buss', 'motorcykel', 'taxi',
  'lastbil', 'traktor', 'ambulans', 'brandbil', 'polisbil', 'segling', 'rodd', 'kajak',
  'kanot', 'färja', 'kryssning', 'flyg', 'helikopter', 'luftballong', 'paraply', 'skidor',
  'skridskor', 'sparkcykel', 'skateboard', 'rollerblades', 'bensin', 'bränsle', 'väg', 'väg',
  
  // Musik och konst
  'musik', 'sång', 'målning', 'skulptur', 'teater', 'film', 'dans', 'konst',
  'melodi', 'rytm', 'beat', 'instrument', 'piano', 'gitarr', 'trummor', 'flöjt', 'violin',
  'cello', 'trumpet', 'saxofon', 'klarinett', 'orgel', 'synthesizer', 'band', 'orkester',
  'kör', 'konsert', 'opera', 'balett', 'choreografi', 'skådespelare', 'regissör', 'producent',
  'galleri', 'museum', 'utställning', 'konstverk', 'bild', 'foto', 'kamera',
  
  // Sport och aktiviteter
  'sport', 'fotboll', 'hockey', 'tennis', 'basket', 'simning', 'löpning', 'cykling', 'skidåkning',
  'träning', 'gym', 'yoga', 'basket', 'volleyboll', 'handboll', 'badminton', 'pingis', 'golf',
  'boxning', 'brottning', 'judo', 'karate', 'gymnastik', 'pilates', 'viktlyftning',
  'maraton', 'triathlon', 'klättring', 'surfing', 'segling', 'ridning', 'fiske',
  
  // Teknik och vetenskap
  'dator', 'telefon', 'internet', 'vetenskap', 'matematik', 'fysik', 'kemi',
  'teknologi', 'laptop', 'smartphone', 'tablet', 'webb', 'app', 'programvara', 'mjukvara',
  'hårdvara', 'processor', 'minne', 'lagring', 'skärm', 'tangentbord', 'högtalare',
  'mikrofon', 'kamera', 'robot', 'artificiell', 'intelligens', 'maskininlärning', 'algoritm',
  'kod', 'programmering', 'utveckling', 'design', 'innovation', 'uppfinning', 'batteri',
  
  // Platser
  'stad', 'land', 'hem', 'park', 'bibliotek', 'sjukhus', 'kyrka', 'museum',
  'affär', 'butik', 'restaurang', 'hotell', 'flygplats', 'station', 'hamn', 'strand',
  'berg', 'fjäll', 'dal', 'sjö', 'hav', 'ö', 'halvö', 'kontinent', 'landskap',
  
  // Kropp och hälsa
  'kropp', 'huvud', 'ansikte', 'öga', 'öra', 'näsa', 'mun', 'tand', 'hår', 'hals',
  'arm', 'hand', 'finger', 'ben', 'fot', 'hjärta', 'lunga', 'lever', 'mage', 'rygg',
  'hälsa', 'sjukdom', 'läkare', 'sjuksköterska', 'sjukhus', 'medicin', 'tablett', 'vaccin',
  
  // Kläder och mode
  'kläder', 'skjorta', 'byxor', 'kjol', 'klänning', 'jacka', 'rock', 'tröja', 'kofta',
  'hatt', 'handskar', 'skor', 'stövlar', 'sandaler', 'strumpor', 'underkläder', 'pyjamas',
  'mode', 'stil', 'design', 'färg', 'material', 'tyg', 'läder', 'bomull', 'silke',
  
  // Arbete och karriär
  'arbete', 'jobb', 'karriär', 'yrke', 'profession', 'kontor', 'fabrik', 'butik',
  'chef', 'anställd', 'kollega', 'kund', 'klient', 'projekt', 'möte', 'presentation',
  'budget', 'plan', 'mål', 'framgång', 'prestation', 'resultat', 'vinst', 'förlust',
  
  // Fritid och hobby
  'fritid', 'hobby', 'intresse', 'samling', 'spel', 'pussel', 'bok', 'tidning',
  'tv', 'radio', 'podcast', 'youtube', 'netflix', 'sociala', 'medier', 'facebook',
  'instagram', 'twitter', 'tiktok', 'blogg', 'vlogg', 'streaming', 'gaming',
  
  // Resor och semester
  'resa', 'semester', 'semester', 'ferie', 'flyg', 'hotell', 'värdshus', 'camping',
  'backpacking', 'kryssning', 'turism', 'turist', 'guide', 'karta', 'kompass', 'pass',
  'visum', 'tull', 'gräns', 'land', 'stad', 'landskap', 'kultur', 'tradition',
  
  // Väder och klimat
  'väder', 'klimat', 'temperatur', 'grad', 'celsius', 'fahrenheit', 'varm', 'kall',
  'het', 'frysa', 'svettas', 'solsken', 'skugga', 'vind', 'storm', 'orkan', 'tornado',
  'jordbävning', 'tsunami', 'översvämning', 'torka', 'växthuseffekt', 'miljö', 'natur',
  
  // Tid och kalender
  'tid', 'klocka', 'timme', 'minut', 'sekund', 'dag', 'vecka', 'månad', 'år',
  'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag',
  'januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti',
  'september', 'oktober', 'november', 'december', 'kalender', 'schema', 'planering',
  
  // Siffror och matematik
  'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio',
  'hundra', 'tusen', 'miljon', 'miljard', 'plus', 'minus', 'gånger', 'delat',
  'lika', 'mer', 'mindre', 'stor', 'liten', 'lång', 'kort', 'bred', 'smal',
  'hög', 'låg', 'djup', 'grund', 'tung', 'lätt', 'snabb', 'långsam',
  
  // Grundläggande verb
  'gå', 'springa', 'hoppa', 'simma', 'flyga', 'köra', 'cykla', 'rida', 'segla',
  'klättra', 'falla', 'resa', 'sitta', 'stå', 'ligga', 'sova', 'vaka', 'vila',
  'arbeta', 'spela', 'läsa', 'skriva', 'räkna', 'tänka', 'minnas', 'glömma',
  'se', 'höra', 'känna', 'smaka', 'lukta', 'röra', 'hålla', 'släppa', 'ta',
  'ge', 'köpa', 'sälja', 'betalar', 'kosta', 'spara', 'låna', 'ge', 'få',
  'äta', 'dricka', 'hungra', 'törsta', 'mätta', 'tom', 'full', 'hungrig', 'törstig',
  
  // Grundläggande adjektiv
  'bra', 'dålig', 'ny', 'gammal', 'ung', 'ung', 'ung', 'ung', 'ung', 'ung',
  'vacker', 'ful', 'ren', 'smutsig', 'varm', 'kall', 'het', 'kall', 'het', 'kall',
  'ljus', 'mörk', 'ljus', 'mörk', 'ljus', 'mörk', 'ljus', 'mörk', 'ljus', 'mörk',
  'glad', 'ledsen', 'arg', 'rädd', 'modig', 'stolt', 'skamsen', 'tacksam', 'kär',
  'vänlig', 'elak', 'snäll', 'stygg', 'rolig', 'tråkig', 'intressant', 'tråkig',
  'lätt', 'svår', 'enkel', 'komplicerad', 'säker', 'osäker', 'viktig', 'oviktig',
  'riktig', 'falsk', 'sant', 'falskt', 'rätt', 'fel', 'korrekt', 'inkorrekt',
  
  // Grundläggande substantiv
  'människa', 'person', 'man', 'kvinna', 'barn', 'bebis', 'ungdom', 'vuxen', 'äldre',
  'pappa', 'mamma', 'bror', 'syster', 'son', 'dotter', 'far', 'mor', 'farfar', 'farmor',
  'morfar', 'mormor', 'kusin', 'moster', 'morbror', 'faster', 'farbror', 'släkt',
  'vän', 'fiende', 'granne', 'kollega', 'chef', 'anställd', 'kund', 'gäst',
  'hund', 'katt', 'häst', 'ko', 'fågel', 'fisk', 'orm', 'björn', 'varg', 'räv',
  'hus', 'lägenhet', 'rum', 'kök', 'sovrum', 'vardagsrum', 'badrum', 'hall',
  'bil', 'tåg', 'flygplan', 'båt', 'cykel', 'buss', 'motorcykel', 'taxi',
  'mat', 'vatten', 'kaffe', 'te', 'bröd', 'ost', 'kött', 'fisk', 'frukt', 'grönsak',
  'kläder', 'skjorta', 'byxor', 'kjol', 'klänning', 'jacka', 'skor', 'hatt',
  'bok', 'tidning', 'brev', 'telefon', 'dator', 'tv', 'radio', 'musik',
  'pengar', 'kronor', 'euro', 'dollar', 'pris', 'kostnad', 'betalning', 'köp',
  'tid', 'klocka', 'timme', 'minut', 'sekund', 'dag', 'vecka', 'månad', 'år',
  'väder', 'sol', 'regn', 'snö', 'vind', 'moln', 'himmel', 'jord', 'vatten',
  'färg', 'röd', 'blå', 'grön', 'gul', 'vit', 'svart', 'brun', 'grå', 'rosa',
  'storlek', 'stor', 'liten', 'lång', 'kort', 'bred', 'smal', 'hög', 'låg', 'djup',
  'antal', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio',
  'form', 'cirkel', 'kvadrat', 'triangel', 'rektangel', 'oval', 'rund', 'fyrkantig',
  'material', 'trä', 'metall', 'plast', 'glas', 'papper', 'tyg', 'läder', 'sten',
  'känsla', 'glädje', 'sorg', 'rädsla', 'ilska', 'kärlek', 'hat', 'hopp', 'fruktan',
  'aktivitet', 'arbete', 'spel', 'sport', 'resa', 'köp', 'mat', 'sömn', 'träning',
  'plats', 'hem', 'skola', 'arbete', 'butik', 'park', 'sjukhus', 'kyrka', 'museum',
  'riktning', 'norr', 'söder', 'öst', 'väst', 'upp', 'ner', 'fram', 'tillbaka', 'höger', 'vänster',
  'avstånd', 'nära', 'långt', 'här', 'där', 'hit', 'dit', 'hemma', 'borta', 'tillbaka',
  'tidpunkt', 'nu', 'tidigare', 'senare', 'igår', 'idag', 'imorgon', 'förra', 'nästa',
  'frekvens', 'alltid', 'ofta', 'ibland', 'sällan', 'aldrig', 'igen', 'mer', 'mindre',
  'grad', 'mycket', 'lite', 'ganska', 'nästan', 'helt', 'delvis', 'fullständigt',
  'sätt', 'hur', 'varför', 'när', 'var', 'vem', 'vad', 'vilken', 'vilka', 'vars',
  'jämförelse', 'liknande', 'olika', 'samma', 'annorlunda', 'bättre', 'sämre', 'bäst', 'sämst',
  'beskrivning', 'vacker', 'ful', 'bra', 'dålig', 'ny', 'gammal', 'stor', 'liten', 'varm', 'kall'
];

// Helper functions
const getLevenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

const getCommonLetters = (str1, str2) => {
  const letters1 = str1.split('').reduce((acc, letter) => {
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {});
  
  const letters2 = str2.split('').reduce((acc, letter) => {
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {});
  
  let common = 0;
  for (const letter in letters1) {
    if (letters2[letter]) {
      common += Math.min(letters1[letter], letters2[letter]);
    }
  }
  
  return common;
};

const getSemanticSimilarity = (word1, word2) => {
  let cat1 = '';
  let cat2 = '';
  let subCat1 = '';
  let subCat2 = '';
  
  for (const [catName, catData] of Object.entries(categories)) {
    if (catData.words.includes(word1)) {
      cat1 = catName;
      for (const [subName, subWords] of Object.entries(catData.subCategories)) {
        if (subWords.includes(word1)) {
          subCat1 = subName;
          break;
        }
      }
    }
    if (catData.words.includes(word2)) {
      cat2 = catName;
      for (const [subName, subWords] of Object.entries(catData.subCategories)) {
        if (subWords.includes(word2)) {
          subCat2 = subName;
          break;
        }
      }
    }
  }
  
  if (subCat1 && subCat2 && subCat1 === subCat2) {
    return 0.95;
  }
  
  if (cat1 && cat2 && cat1 === cat2) {
    return 0.85;
  }
  
  if (cat1 && cat2 && strongRelations[cat1]?.includes(cat2)) {
    return 0.70;
  }
  
  if (cat1 && cat2 && weakRelations[cat1]?.includes(cat2)) {
    return 0.40;
  }
  
  return 0;
};

const calculateSimilarity = (word1, word2) => {
  const w1 = word1.toLowerCase().trim();
  const w2 = word2.toLowerCase().trim();
  
  if (w1 === w2) return 1.0;
  
  const semanticSimilarity = getSemanticSimilarity(w1, w2);
  if (semanticSimilarity > 0) {
    return semanticSimilarity;
  }
  
  const levenshteinDistance = getLevenshteinDistance(w1, w2);
  const maxLength = Math.max(w1.length, w2.length);
  const distanceSimilarity = 1 - (levenshteinDistance / maxLength);
  
  const commonLetters = getCommonLetters(w1, w2);
  const letterSimilarity = commonLetters / maxLength;
  
  const finalSimilarity = (
    distanceSimilarity * 0.6 +
    letterSimilarity * 0.4
  ) * 0.3;
  
  return Math.max(0, Math.min(0.25, finalSimilarity));
};

// API Routes

// Get daily word (temporarily public for testing)
app.get('/api/daily-word', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // For now, use a simple deterministic word based on date
    // This ensures the same word for the same day
    const dateHash = today.split('-').join('');
    const wordIndex = parseInt(dateHash) % swedishWords.length;
    const dailyWord = swedishWords[wordIndex];
    
    res.json({ 
      word: dailyWord, 
      date: today,
      message: `Dagens ord för ${today}`
    });
  } catch (error) {
    console.error('Error getting daily word:', error);
    res.status(500).json({ error: 'Failed to get daily word' });
  }
});

// Validate Swedish word (temporarily public for testing)
app.post('/api/validate-word', async (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }
    
    const normalizedWord = word.toLowerCase().trim();
    const isValid = swedishWords.includes(normalizedWord);
    
    res.json({
      isValid,
      word: normalizedWord,
      message: isValid ? 'Giltigt svenskt ord' : 'Detta ord finns inte i den svenska ordlistan. Försök igen!'
    });
    
  } catch (error) {
    console.error('Error validating word:', error);
    res.status(500).json({ error: 'Failed to validate word' });
  }
});

// Calculate similarity (temporarily public for testing)
app.post('/api/calculate-similarity', async (req, res) => {
  try {
    const { guess, targetWord } = req.body;
    
    if (!guess || !targetWord) {
      return res.status(400).json({ error: 'Guess and targetWord are required' });
    }
    
    const normalizedGuess = guess.toLowerCase().trim();
    
    // Validate Swedish word
    if (!swedishWords.includes(normalizedGuess)) {
      return res.status(400).json({ 
        error: 'Detta ord finns inte i den svenska ordlistan. Försök igen!',
        isValid: false 
      });
    }
    
    const similarity = calculateSimilarity(normalizedGuess, targetWord.toLowerCase());
    
    // Determine similarity text
    let similarityText;
    if (similarity === 1.0) {
      similarityText = 'Perfekt!';
    } else if (similarity >= 0.8) {
      similarityText = 'Väldigt nära!';
    } else if (similarity >= 0.6) {
      similarityText = 'Nära';
    } else if (similarity >= 0.4) {
      similarityText = 'Ganska nära';
    } else {
      similarityText = 'Långt borta';
    }
    
    res.json({
      similarity,
      similarityText,
      isValid: true,
      isCorrect: normalizedGuess === targetWord.toLowerCase()
    });
    
  } catch (error) {
    console.error('Error calculating similarity:', error);
    res.status(500).json({ error: 'Failed to calculate similarity' });
  }
});

// In-memory storage for daily leaderboard and player status (temporary solution)
let dailyLeaderboard = {};
let dailyPlayerStatus = {}; // Track if player has already played today

// Save game result (temporarily public for testing)
app.post('/api/save-game-result', async (req, res) => {
  try {
    const { targetWord, guesses, won, attempts, playerName, playerId } = req.body;
    
    if (!targetWord || !guesses || typeof won !== 'boolean') {
      return res.status(400).json({ error: 'Invalid game result data' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const playerKey = `${playerId || 'anonymous'}-${today}`;
    
    // Mark player as having played today (regardless of win/loss/give up)
    dailyPlayerStatus[playerKey] = true;
    
    if (won) {
      // Add to daily leaderboard
      if (!dailyLeaderboard[today]) {
        dailyLeaderboard[today] = [];
      }
      
      const entry = {
        playerName: playerName || 'Anonym',
        guesses: guesses,
        timestamp: new Date().toISOString(),
        attempts: attempts || []
      };
      
      dailyLeaderboard[today].push(entry);
      
      // Sort by guesses (fewer is better) and keep only top 5
      dailyLeaderboard[today].sort((a, b) => a.guesses - b.guesses);
      dailyLeaderboard[today] = dailyLeaderboard[today].slice(0, 5);
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error saving game result:', error);
    res.status(500).json({ error: 'Failed to save game result' });
  }
});

// Mark player as having given up (one chance per day)
app.post('/api/give-up', async (req, res) => {
  try {
    const { playerId, playerName } = req.body;
    
    const today = new Date().toISOString().split('T')[0];
    const playerKey = `${playerId || 'anonymous'}-${today}`;
    
    // Mark player as having played today (give up counts as playing)
    dailyPlayerStatus[playerKey] = true;
    
    res.json({ 
      success: true, 
      message: 'Du har gett upp för idag. Kom tillbaka imorgon för ett nytt ord!',
      date: today
    });
    
  } catch (error) {
    console.error('Error marking give up:', error);
    res.status(500).json({ error: 'Failed to mark give up' });
  }
});

// Check if player has already played today
app.get('/api/player-status/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const playerKey = `${playerId}-${today}`;
    const hasPlayed = dailyPlayerStatus[playerKey] || false;
    
    res.json({
      playerId,
      date: today,
      hasPlayed,
      message: hasPlayed ? 'Du har redan spelat för idag' : 'Du kan spela för idag'
    });
    
  } catch (error) {
    console.error('Error checking player status:', error);
    res.status(500).json({ error: 'Failed to check player status' });
  }
});

// Get daily leaderboard
app.get('/api/daily-leaderboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const leaderboard = dailyLeaderboard[today] || [];
    
    res.json({
      date: today,
      leaderboard: leaderboard,
      message: leaderboard.length > 0 ? `Leaderboard för ${today}` : `Inga vinnare än för ${today}`
    });
    
  } catch (error) {
    console.error('Error fetching daily leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch daily leaderboard' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limitCount = parseInt(req.query.limit) || 10;
    
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      orderBy('totalWins', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const leaderboard = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(leaderboard);
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get historical leaderboards
app.get('/api/historical-leaderboards', async (req, res) => {
  try {
    const { days = 7 } = req.query; // Default to last 7 days
    const today = new Date();
    const historicalData = [];
    
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const leaderboard = dailyLeaderboard[dateString] || [];
      historicalData.push({
        date: dateString,
        leaderboard: leaderboard,
        winnerCount: leaderboard.length
      });
    }
    
    res.json({
      historicalData,
      message: `Historiska leaderboards för senaste ${days} dagarna`
    });
    
  } catch (error) {
    console.error('Error fetching historical leaderboards:', error);
    res.status(500).json({ error: 'Failed to fetch historical leaderboards' });
  }
});

// Get player statistics
app.get('/api/player-stats/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { days = 30 } = req.query;
    
    const today = new Date();
    const playerStats = {
      playerId,
      totalWins: 0,
      totalDaysPlayed: 0,
      bestScore: null,
      averageGuesses: 0,
      winStreak: 0,
      longestWinStreak: 0,
      dailyResults: []
    };
    
    let currentStreak = 0;
    let longestStreak = 0;
    
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const leaderboard = dailyLeaderboard[dateString] || [];
      const playerEntry = leaderboard.find(entry => 
        entry.playerName.toLowerCase().includes(playerId.toLowerCase()) ||
        entry.playerName === playerId
      );
      
      if (playerEntry) {
        playerStats.totalWins++;
        playerStats.totalDaysPlayed++;
        playerStats.dailyResults.push({
          date: dateString,
          guesses: playerEntry.guesses,
          position: leaderboard.indexOf(playerEntry) + 1,
          timestamp: playerEntry.timestamp
        });
        
        if (!playerStats.bestScore || playerEntry.guesses < playerStats.bestScore) {
          playerStats.bestScore = playerEntry.guesses;
        }
        
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    playerStats.winStreak = currentStreak;
    playerStats.longestWinStreak = longestStreak;
    
    if (playerStats.totalWins > 0) {
      const totalGuesses = playerStats.dailyResults.reduce((sum, result) => sum + result.guesses, 0);
      playerStats.averageGuesses = Math.round(totalGuesses / playerStats.totalWins);
    }
    
    res.json({
      ...playerStats,
      message: playerStats.totalWins > 0 ? 
        `Statistik för ${playerStats.totalWins} vinster över ${days} dagar` :
        `Inga vinster hittades för ${playerId} över senaste ${days} dagarna`
    });
    
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Security: Semantic logic hidden from client`);
  console.log(`⚡ Rate limiting: 500 guesses per round`);
});
