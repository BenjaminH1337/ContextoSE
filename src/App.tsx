import { useAuth } from './hooks/useAuth';
import LoginButton from './components/Auth/LoginButton';
import GameBoard from './components/Game/GameBoard';
import Leaderboard from './components/Leaderboard/Leaderboard';
import HistoricalStats from './components/Stats/HistoricalStats';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">Contexto Svenska</h1>
          <LoginButton user={user} />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {user ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <GameBoard user={user} />
              </div>
              <div>
                <Leaderboard />
              </div>
            </div>
            <HistoricalStats />
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">
              Välkommen till Contexto Svenska!
            </h2>
            <p className="text-gray-600 mb-8">
              Logga in för att spela och spara dina resultat
            </p>
            <LoginButton user={null} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App
