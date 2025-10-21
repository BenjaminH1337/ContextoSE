import { describe, it, expect, vi } from 'vitest';

// Mock Firebase Auth
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockGetAuth = vi.fn();

vi.mock('firebase/auth', () => ({
  signInWithPopup: mockSignInWithPopup,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  getAuth: mockGetAuth,
  GoogleAuthProvider: vi.fn(),
}));

// Mock Firestore
const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: mockSetDoc,
  getDoc: mockGetDoc,
}));

// Mock Firebase config
vi.mock('../../firebase/config', () => ({
  auth: {},
  googleProvider: {},
  db: {},
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful Google sign-in', async () => {
    const mockUser = {
      uid: 'test-uid',
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: 'https://example.com/photo.jpg',
    };

    mockSignInWithPopup.mockResolvedValue({ user: mockUser });
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockSetDoc.mockResolvedValue(undefined);

    const { signInWithGoogle } = await import('../authService');
    
    const result = await signInWithGoogle();
    expect(result).toEqual(mockUser);
    expect(mockSignInWithPopup).toHaveBeenCalled();
    expect(mockSetDoc).toHaveBeenCalled();
  });

  it('should handle existing user sign-in', async () => {
    const mockUser = {
      uid: 'test-uid',
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: 'https://example.com/photo.jpg',
    };

    mockSignInWithPopup.mockResolvedValue({ user: mockUser });
    mockGetDoc.mockResolvedValue({ exists: () => true });

    const { signInWithGoogle } = await import('../authService');
    
    const result = await signInWithGoogle();
    expect(result).toEqual(mockUser);
    expect(mockSignInWithPopup).toHaveBeenCalled();
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('should handle sign-out', async () => {
    mockSignOut.mockResolvedValue(undefined);

    const { signOut } = await import('../authService');
    
    await signOut();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should handle auth state changes', async () => {
    const mockCallback = vi.fn();
    mockOnAuthStateChanged.mockReturnValue(() => {});

    const { onAuthChanged } = await import('../authService');
    
    onAuthChanged(mockCallback);
    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(expect.any(Object), mockCallback);
  });
});
