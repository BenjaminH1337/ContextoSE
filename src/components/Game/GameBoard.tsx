import { useState } from 'react';
import type { User } from 'firebase/auth';
import { useGame } from '../../hooks/useGame';
import GuessInput from './GuessInput.tsx';
import GuessList from './GuessList.tsx';
import ProgressIndicator from './ProgressIndicator.tsx';

interface GameBoardProps {
  user: User;
}

const GameBoard = ({ user }: GameBoardProps) => {
  const { targetWord, guesses, gameWon, gameOver, gaveUp, loading, hasPlayedToday, makeGuess, giveUp, resetGame } = useGame(user.uid);
  const [currentGuess, setCurrentGuess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGuess = async () => {
    if (currentGuess.trim() && !gameWon) {
      try {
        const result = await makeGuess(currentGuess.trim());
        
        if (result === null) {
          // Ogiltigt ord
          setErrorMessage('Detta ord finns inte i den svenska ordlistan. Försök igen!');
          setTimeout(() => setErrorMessage(''), 3000); // Ta bort felmeddelandet efter 3 sekunder
        } else {
          // Giltigt ord
          setErrorMessage('');
          setCurrentGuess('');
        }
      } catch (error) {
        console.error('Error handling guess:', error);
        setErrorMessage('Ett fel uppstod. Försök igen!');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Laddar spel...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Contexto Svenska
        </h2>
        <p className="text-gray-600">
          Gissa det svenska ordet! Du får ledtrådar om hur nära du är. Gissa så många gånger du vill!<br/>
          <span className="text-sm text-gray-500">Endast svenska ord är tillåtna.</span>
        </p>
      </div>

      <ProgressIndicator guesses={guesses} gameWon={gameWon} />

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

          {gameOver ? (
            <div className="text-center py-8">
              {hasPlayedToday && !gameWon && !gaveUp ? (
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">
                    ⏰ Du har redan spelat för idag
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    Kom tillbaka imorgon för ett nytt ord!
                  </p>
                  <p className="text-gray-600 mb-6">
                    Dagens ord var: <span className="font-bold">{targetWord}</span>
                  </p>
                </div>
              ) : gameWon ? (
                <div>
                  <h3 className="text-2xl font-bold text-green-600 mb-4">
                    🎉 Grattis! Du gissade rätt!
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    Ordet var: <span className="font-bold">{targetWord}</span>
                  </p>
                  <p className="text-gray-600 mb-6">
                    Du behövde {guesses.length} gissningar.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Kom tillbaka imorgon för ett nytt ord!
                  </p>
                </div>
              ) : gaveUp ? (
                <div>
                  <h3 className="text-2xl font-bold text-orange-600 mb-4">
                    😔 Du gav upp
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    Ordet var: <span className="font-bold">{targetWord}</span>
                  </p>
                  <p className="text-gray-600 mb-6">
                    Du gjorde {guesses.length} gissningar innan du gav upp.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Kom tillbaka imorgon för ett nytt ord!
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-red-600 mb-4">
                    😔 Spelet är slut
                  </h3>
                  <p className="text-lg text-gray-700 mb-4">
                    Ordet var: <span className="font-bold">{targetWord}</span>
                  </p>
                </div>
              )}

              {!hasPlayedToday && (
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Spela igen
                </button>
              )}
            </div>
          ) : (
        <div>
          <GuessInput
            value={currentGuess}
            onChange={setCurrentGuess}
            onGuess={handleGuess}
            onKeyPress={handleKeyPress}
            disabled={gameWon}
          />
          
          <div className="mt-4 text-center">
            <button
              onClick={giveUp}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Ge upp
            </button>
          </div>
          
          <GuessList guesses={guesses} />
        </div>
      )}
    </div>
  );
};

export default GameBoard;
