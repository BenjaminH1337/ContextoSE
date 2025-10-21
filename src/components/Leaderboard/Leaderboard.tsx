import { useState, useEffect } from 'react';
import { getDailyLeaderboard } from '../../services/gameService';
import type { DailyLeaderboard, DailyLeaderboardEntry } from '../../types';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<DailyLeaderboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getDailyLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching daily leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dagens Topplista</h3>
        <div className="text-center py-4">
          <div className="text-gray-600">Laddar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">🏆 Dagens Topplista</h3>
      <p className="text-sm text-gray-600 mb-4">{leaderboard?.message}</p>
      
      {!leaderboard || leaderboard.leaderboard.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">🎯</div>
          <div>Inga vinnare än för {leaderboard?.date}</div>
          <div className="text-sm mt-2">Bli den första att lösa dagens ord!</div>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.leaderboard.map((entry: DailyLeaderboardEntry, index: number) => (
            <div
              key={`${entry.playerName}-${entry.timestamp}`}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                index === 1 ? 'bg-gray-50 border border-gray-200' :
                index === 2 ? 'bg-orange-50 border border-orange-200' :
                'bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0">
                {index < 3 ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-500' :
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
                    {index + 1}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {entry.playerName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString('sv-SE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {entry.guesses}
                </div>
                <div className="text-xs text-gray-500">gissningar</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Topp 5 vinnare för {leaderboard?.date} (färre gissningar = bättre)
      </div>
    </div>
  );
};

export default Leaderboard;
