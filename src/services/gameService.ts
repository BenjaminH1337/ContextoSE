import type { GameResult } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const saveGameResult = async (result: GameResult) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-game-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetWord: result.targetWord,
        guesses: result.guesses,
        won: result.won,
        attempts: result.attempts,
        playerName: result.playerName || 'Anonym',
        playerId: result.userId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save game result');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving game result:', error);
    throw error;
  }
};

export const getTodayWord = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/daily-word`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get daily word');
    }

    const data = await response.json();
    return data.word;
  } catch (error) {
    console.error('Error getting daily word:', error);
    throw error;
  }
};

// Kontrollera om ett ord finns i den svenska ordlistan
export const isValidSwedishWord = async (word: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/validate-word`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        word: word
      })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error('Error validating word:', error);
    return false;
  }
};

// Huvudfunktion för att beräkna similarity
export const calculateSimilarity = async (word1: string, word2: string): Promise<{similarity: number, similarityText: string, isCorrect: boolean}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculate-similarity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guess: word1,
        targetWord: word2
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to calculate similarity');
    }

    const data = await response.json();
    return {
      similarity: data.similarity,
      similarityText: data.similarityText,
      isCorrect: data.isCorrect
    };
  } catch (error) {
    console.error('Error calculating similarity:', error);
    throw error;
  }
};

// Kontrollera om spelaren redan har spelat idag
export const checkPlayerStatus = async (playerId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/player-status/${playerId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check player status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking player status:', error);
    throw error;
  }
};

// Markera att spelaren har gett upp
export const markGiveUp = async (playerId: string, playerName?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/give-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playerId,
        playerName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark give up');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking give up:', error);
    throw error;
  }
};

// Hämta daglig leaderboard
export const getDailyLeaderboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/daily-leaderboard`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch daily leaderboard');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching daily leaderboard:', error);
    throw error;
  }
};

// Hämta historiska leaderboards
export const getHistoricalLeaderboards = async (days: number = 7) => {
  try {
    const response = await fetch(`${API_BASE_URL}/historical-leaderboards?days=${days}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch historical leaderboards');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching historical leaderboards:', error);
    throw error;
  }
};

// Hämta spelarstatistik
export const getPlayerStats = async (playerId: string, days: number = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/player-stats/${playerId}?days=${days}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch player stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching player stats:', error);
    throw error;
  }
};

// All semantic logic moved to server-side for security

