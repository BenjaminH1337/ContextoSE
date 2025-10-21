export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export interface Guess {
  word: string;
  similarity: number;
  rank: number;
  timestamp: Date;
}

export interface GameResult {
  userId: string;
  targetWord: string;
  guesses: number;
  won: boolean;
  timestamp: Date;
  attempts: string[];
  playerName?: string;
}

export interface DailyLeaderboardEntry {
  playerName: string;
  guesses: number;
  timestamp: string;
  attempts: string[];
}

export interface DailyLeaderboard {
  date: string;
  leaderboard: DailyLeaderboardEntry[];
  message: string;
}

export interface DailyWord {
  date: string;
  word: string;
  createdAt: Date;
}
