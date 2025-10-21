import { useState, useEffect } from 'react';
import { getHistoricalLeaderboards, getPlayerStats } from '../../services/gameService';

interface HistoricalData {
  date: string;
  leaderboard: Array<{
    playerName: string;
    guesses: number;
    timestamp: string;
    attempts: string[];
  }>;
  winnerCount: number;
}

interface PlayerStats {
  playerId: string;
  totalWins: number;
  totalDaysPlayed: number;
  bestScore: number | null;
  averageGuesses: number;
  winStreak: number;
  longestWinStreak: number;
  dailyResults: Array<{
    date: string;
    guesses: number;
    position: number;
    timestamp: string;
  }>;
  message: string;
}

const HistoricalStats = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHistoricalLeaderboards(days);
        setHistoricalData(data.historicalData);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days]);

  const handlePlayerSearch = async () => {
    if (!selectedPlayer.trim()) return;
    
    try {
      const stats = await getPlayerStats(selectedPlayer, 30);
      setPlayerStats(stats);
    } catch (error) {
      console.error('Error fetching player stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Historisk Statistik</h3>
        <div className="text-center py-4">
          <div className="text-gray-600">Laddar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Historisk Statistik</h3>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antal dagar att visa:
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 dagar</option>
              <option value={14}>14 dagar</option>
              <option value={30}>30 dagar</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sök spelare:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                placeholder="Ange spelarnamn..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handlePlayerSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Sök
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Player Stats */}
      {playerStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            🏆 Statistik för {playerStats.playerId}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{playerStats.totalWins}</div>
              <div className="text-sm text-gray-600">Totala vinster</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {playerStats.bestScore || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Bästa resultat</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{playerStats.averageGuesses}</div>
              <div className="text-sm text-gray-600">Genomsnitt</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{playerStats.longestWinStreak}</div>
              <div className="text-sm text-gray-600">Längsta streak</div>
            </div>
          </div>

          {playerStats.dailyResults.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Senaste resultat:</h5>
              <div className="space-y-2">
                {playerStats.dailyResults.slice(0, 10).map((result, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{formatDate(result.date)}</span>
                    <span className="text-sm font-medium">{result.guesses} gissningar</span>
                    <span className="text-sm text-gray-500">#{result.position}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Leaderboards */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          📅 Leaderboards senaste {days} dagarna
        </h4>
        
        {historicalData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">📊</div>
            <div>Ingen historisk data tillgänglig</div>
          </div>
        ) : (
          <div className="space-y-4">
            {historicalData.map((day, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-800">
                    {formatDate(day.date)}
                  </h5>
                  <span className="text-sm text-gray-500">
                    {day.winnerCount} vinnare
                  </span>
                </div>
                
                {day.leaderboard.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-sm">Inga vinnare denna dag</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {day.leaderboard.map((entry, entryIndex) => (
                      <div
                        key={entryIndex}
                        className={`flex items-center justify-between p-2 rounded ${
                          entryIndex === 0 ? 'bg-yellow-50 border border-yellow-200' :
                          entryIndex === 1 ? 'bg-gray-50 border border-gray-200' :
                          entryIndex === 2 ? 'bg-orange-50 border border-orange-200' :
                          'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            entryIndex === 0 ? 'bg-yellow-500' :
                            entryIndex === 1 ? 'bg-gray-500' :
                            entryIndex === 2 ? 'bg-orange-500' :
                            'bg-gray-400'
                          }`}>
                            {entryIndex + 1}
                          </div>
                          <span className="text-sm font-medium">{entry.playerName}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {entry.guesses} gissningar
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalStats;
