import { describe, it, expect, vi } from 'vitest';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Game Service API Calls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate Swedish words correctly', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ isValid: true }),
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);

    // Import here to avoid module loading issues
    const { isValidSwedishWord } = await import('../gameService');
    
    const result = await isValidSwedishWord('hund');
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/validate-word',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: 'hund' }),
      })
    );
  });

  it('should handle invalid Swedish words', async () => {
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid word' }),
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { isValidSwedishWord } = await import('../gameService');
    
    const result = await isValidSwedishWord('xyz123');
    expect(result).toBe(false);
  });

  it('should calculate similarity correctly', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        similarity: 0.8,
        similarityText: 'Väldigt nära!',
        isCorrect: false,
      }),
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { calculateSimilarity } = await import('../gameService');
    
    const result = await calculateSimilarity('hund', 'katt');
    expect(result).toEqual({
      similarity: 0.8,
      similarityText: 'Väldigt nära!',
      isCorrect: false,
    });
  });

  it('should handle exact word matches', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        similarity: 1.0,
        similarityText: 'Perfekt!',
        isCorrect: true,
      }),
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);

    const { calculateSimilarity } = await import('../gameService');
    
    const result = await calculateSimilarity('hund', 'hund');
    expect(result.isCorrect).toBe(true);
    expect(result.similarity).toBe(1.0);
  });
});
