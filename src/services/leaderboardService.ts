const API_BASE_URL = 'http://localhost:3001/api';

export const getLeaderboard = async (limitCount = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard?limit=${limitCount}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch leaderboard');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};
