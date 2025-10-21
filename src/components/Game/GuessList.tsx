import type { Guess } from '../../types';

interface GuessListProps {
  guesses: Guess[];
}

const GuessList = ({ guesses }: GuessListProps) => {
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'bg-green-100 text-green-800';
    if (similarity >= 0.6) return 'bg-yellow-100 text-yellow-800';
    if (similarity >= 0.4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getSimilarityText = (similarity: number) => {
    if (similarity === 1.0) return 'Perfekt!'; // Bara vid exakt match
    if (similarity >= 0.8) return 'Väldigt nära!';
    if (similarity >= 0.6) return 'Nära';
    if (similarity >= 0.4) return 'Ganska nära';
    return 'Långt borta';
  };

  if (guesses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Inga gissningar än. Börja gissa!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Dina gissningar:</h3>
      {guesses.map((guess, index) => (
        <div
          key={index}
          className={`flex items-center justify-between p-3 rounded-lg ${getSimilarityColor(guess.similarity)}`}
        >
          <div className="flex items-center space-x-3">
            <span className="font-bold text-lg">#{guess.rank}</span>
            <span className="font-medium text-lg">{guess.word}</span>
          </div>
          <div className="text-right">
            <div className="font-semibold">{getSimilarityText(guess.similarity)}</div>
            <div className="text-sm opacity-75">
              {Math.round(guess.similarity * 100)}% likhet
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuessList;
