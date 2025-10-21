import type { Guess } from '../../types';

interface ProgressIndicatorProps {
  guesses: Guess[];
  gameWon: boolean;
}

const ProgressIndicator = ({ guesses, gameWon }: ProgressIndicatorProps) => {
  const currentGuesses = guesses.length;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Gissningar: {currentGuesses}
        </span>
        {gameWon && (
          <span className="text-sm font-bold text-green-600">
            🎉 Vunnen!
          </span>
        )}
      </div>
      
      {/* Visa bara progress bar om spelet är vunnet */}
      {gameWon && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300 bg-green-500"
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
