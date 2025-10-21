import { useState, useEffect } from 'react';
import type { Guess, GameResult } from '../types';
import { getTodayWord, calculateSimilarity, saveGameResult, isValidSwedishWord, checkPlayerStatus, markGiveUp } from '../services/gameService';

export const useGame = (userId: string | null) => {
  const [targetWord, setTargetWord] = useState<string>('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        const word = await getTodayWord();
        setTargetWord(word);
        setGuesses([]);
        setGameWon(false);
        setGameOver(false);
        setGaveUp(false);
        
        // Check if player has already played today
        if (userId) {
          const status = await checkPlayerStatus(userId);
          setHasPlayedToday(status.hasPlayed);
          
          if (status.hasPlayed) {
            setGameOver(true);
          }
        }
      } catch (error) {
        console.error('Error initializing game:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      initializeGame();
    }
  }, [userId]);

  const makeGuess = async (word: string): Promise<Guess | null> => {
    const normalizedWord = word.toLowerCase().trim();
    
    try {
      // Kontrollera om ordet är ett giltigt svenskt ord
      const isValid = await isValidSwedishWord(normalizedWord);
      if (!isValid) {
        return null; // Returnera null för ogiltiga ord
      }
      
      const result = await calculateSimilarity(normalizedWord, targetWord.toLowerCase());
      const totalGuesses = guesses.length + 1;
      
      const guess: Guess = {
        word: normalizedWord,
        similarity: result.similarity,
        rank: totalGuesses, // Behåll rank för leaderboard
        timestamp: new Date()
      };

      // Lägg till nya gissningen och sortera efter similarity (högst längst upp)
      setGuesses(prev => {
        const newGuesses = [...prev, guess];
        return newGuesses.sort((a, b) => b.similarity - a.similarity);
      });

      // Kontrollera om spelet är vunnet - bara vid exakt match
      if (result.isCorrect) {
        setGameWon(true);
        setGameOver(true);
        
        // Spara resultatet
        if (userId) {
          const gameResult: GameResult = {
            userId,
            targetWord,
            guesses: totalGuesses, // Antal gissningar för leaderboard
            won: true,
            timestamp: new Date(),
            attempts: [...guesses.map(g => g.word), normalizedWord],
            playerName: 'Spelare' // Temporärt namn
          };
          saveGameResult(gameResult);
        }
      }

      return guess;
    } catch (error) {
      console.error('Error making guess:', error);
      return null;
    }
  };

  const giveUp = async () => {
    try {
      if (userId) {
        await markGiveUp(userId, 'Spelare');
      }
      setGaveUp(true);
      setGameOver(true);
      setHasPlayedToday(true);
    } catch (error) {
      console.error('Error marking give up:', error);
    }
  };

  const resetGame = async () => {
    setLoading(true);
    try {
      const word = await getTodayWord();
      setTargetWord(word);
      setGuesses([]);
      setGameWon(false);
      setGameOver(false);
      setGaveUp(false);
      
      // Check if player has already played today
      if (userId) {
        const status = await checkPlayerStatus(userId);
        setHasPlayedToday(status.hasPlayed);
        
        if (status.hasPlayed) {
          setGameOver(true);
        }
      }
    } catch (error) {
      console.error('Error resetting game:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    targetWord,
    guesses,
    gameWon,
    gameOver,
    gaveUp,
    loading,
    hasPlayedToday,
    makeGuess,
    giveUp,
    resetGame
  };
};
