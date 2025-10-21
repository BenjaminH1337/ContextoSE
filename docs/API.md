# 🔧 API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently, most endpoints are public for testing. In production, JWT authentication will be required.

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-21T15:30:00.000Z"
}
```

---

### 2. Get Daily Word
**GET** `/daily-word`

Retrieve the word of the day.

**Response:**
```json
{
  "word": "hund",
  "date": "2025-01-21",
  "message": "Dagens ord för 2025-01-21"
}
```

**Notes:**
- Word selection is deterministic based on date
- Same word for all players on the same day
- Word changes at midnight UTC

---

### 3. Validate Swedish Word
**POST** `/validate-word`

Check if a word exists in the Swedish word list.

**Request Body:**
```json
{
  "word": "hund"
}
```

**Response:**
```json
{
  "isValid": true,
  "word": "hund",
  "message": "Giltigt svenskt ord"
}
```

**Error Response:**
```json
{
  "isValid": false,
  "word": "xyz123",
  "message": "Detta ord finns inte i den svenska ordlistan. Försök igen!"
}
```

---

### 4. Calculate Similarity
**POST** `/calculate-similarity`

Calculate semantic similarity between guess and target word.

**Request Body:**
```json
{
  "guess": "katt",
  "targetWord": "hund"
}
```

**Response:**
```json
{
  "similarity": 0.8,
  "similarityText": "Väldigt nära!",
  "isValid": true,
  "isCorrect": false
}
```

**Similarity Ranges:**
- `1.0`: Exact match ("Perfekt!")
- `0.8-0.99`: Very close ("Väldigt nära!")
- `0.6-0.79`: Close ("Nära")
- `0.4-0.59`: Somewhat close ("Ganska nära")
- `0.0-0.39`: Far away ("Långt borta")

---

### 5. Save Game Result
**POST** `/save-game-result`

Save a completed game result to the leaderboard.

**Request Body:**
```json
{
  "targetWord": "hund",
  "guesses": 5,
  "won": true,
  "attempts": ["katt", "djur", "husdjur", "valp", "hund"],
  "playerName": "Alice",
  "playerId": "user123"
}
```

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Only winning games are added to leaderboard
- Player is marked as having played for the day
- Leaderboard limited to top 5 players

---

### 6. Check Player Status
**GET** `/player-status/:playerId`

Check if a player has already played today.

**URL Parameters:**
- `playerId`: Unique player identifier

**Response:**
```json
{
  "playerId": "user123",
  "date": "2025-01-21",
  "hasPlayed": false,
  "message": "Du kan spela för idag"
}
```

---

### 7. Mark Give Up
**POST** `/give-up`

Mark that a player has given up for the day.

**Request Body:**
```json
{
  "playerId": "user123",
  "playerName": "Alice"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Du har gett upp för idag. Kom tillbaka imorgon för ett nytt ord!",
  "date": "2025-01-21"
}
```

---

### 8. Get Daily Leaderboard
**GET** `/daily-leaderboard`

Retrieve today's leaderboard.

**Response:**
```json
{
  "date": "2025-01-21",
  "leaderboard": [
    {
      "playerName": "Alice",
      "guesses": 3,
      "timestamp": "2025-01-21T10:30:00.000Z",
      "attempts": ["djur", "husdjur", "hund"]
    },
    {
      "playerName": "Bob",
      "guesses": 5,
      "timestamp": "2025-01-21T11:15:00.000Z",
      "attempts": ["katt", "djur", "husdjur", "valp", "hund"]
    }
  ],
  "message": "Leaderboard för 2025-01-21"
}
```

---

### 9. Get Historical Leaderboards
**GET** `/historical-leaderboards?days=7`

Retrieve historical leaderboards for the past N days.

**Query Parameters:**
- `days`: Number of days to retrieve (default: 7)

**Response:**
```json
{
  "historicalData": [
    {
      "date": "2025-01-21",
      "leaderboard": [...],
      "winnerCount": 5
    },
    {
      "date": "2025-01-20",
      "leaderboard": [...],
      "winnerCount": 3
    }
  ],
  "message": "Historiska leaderboards för senaste 7 dagarna"
}
```

---

### 10. Get Player Statistics
**GET** `/player-stats/:playerId?days=30`

Retrieve statistics for a specific player.

**URL Parameters:**
- `playerId`: Player identifier

**Query Parameters:**
- `days`: Number of days to analyze (default: 30)

**Response:**
```json
{
  "playerId": "user123",
  "totalWins": 15,
  "totalDaysPlayed": 20,
  "bestScore": 2,
  "averageGuesses": 4.2,
  "winStreak": 3,
  "longestWinStreak": 7,
  "dailyResults": [
    {
      "date": "2025-01-21",
      "guesses": 3,
      "position": 1,
      "timestamp": "2025-01-21T10:30:00.000Z"
    }
  ],
  "message": "Statistik för 15 vinster över 30 dagar"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-21T15:30:00.000Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `WORD_NOT_FOUND`: Word not in Swedish dictionary
- `PLAYER_ALREADY_PLAYED`: Player has already played today
- `SERVER_ERROR`: Internal server error

## Rate Limiting

### Limits
- **Guesses per round**: 500 maximum
- **API calls per 15 minutes**: 100 maximum

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642786200
```

## Security

### CORS
- **Allowed Origins**: `http://localhost:5173` (development)
- **Methods**: GET, POST, OPTIONS
- **Headers**: Content-Type, Authorization

### Input Validation
- **Word length**: 1-50 characters
- **Player ID**: Alphanumeric, 1-100 characters
- **Guesses**: Integer, 1-500

### Data Sanitization
- All inputs are trimmed and normalized
- SQL injection protection (NoSQL database)
- XSS prevention through proper encoding

---

**Last Updated**: 2025-01-21  
**Version**: 1.0.0
