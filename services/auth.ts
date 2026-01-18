
// Simulated Authentication Service
// In a real production environment, this would interface with a Node.js/Python backend via REST API.

export type UserRole = 'student' | 'parent' | 'tutor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Mock Database of Users
// In production, never store passwords in frontend code. 
// This simulates a DB response where we verify credentials.
const MOCK_USERS: Record<string, { profile: User, passwordHash: string }> = {
  'student@ryze.edu.au': {
    profile: { id: 'u1', email: 'student@ryze.edu.au', name: 'Alex Student', role: 'student', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    passwordHash: 'password123' 
  },
  'parent@ryze.edu.au': {
    profile: { id: 'u2', email: 'parent@ryze.edu.au', name: 'Sarah Parent', role: 'parent' },
    passwordHash: 'password123'
  },
  'tutor@ryze.edu.au': {
    profile: { id: 'u3', email: 'tutor@ryze.edu.au', name: 'Mike Tutor', role: 'tutor', avatar: 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,w_600/v1764105290/Screenshot_2025-11-20_at_11.13.56_pm_gwdxn2.png' },
    passwordHash: 'password123'
  },
  'admin@ryze.edu.au': {
    profile: { id: 'u4', email: 'admin@ryze.edu.au', name: 'System Admin', role: 'admin' },
    passwordHash: 'ryzeedu0411'
  }
};

const STORAGE_KEY = 'ryze_auth_session';

export const AuthService = {
  /**
   * Simulates a secure backend login attempt.
   */
  async login(email: string, password: string): Promise<User> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const userRecord = MOCK_USERS[email.toLowerCase()];

    // Validate credentials (in real app, use bcrypt.compare)
    if (userRecord && userRecord.passwordHash === password) {
      // Create Session
      const sessionData = JSON.stringify({
        user: userRecord.profile,
        token: 'mock-jwt-token-' + Math.random().toString(36).substr(2),
        expiry: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
      });
      
      localStorage.setItem(STORAGE_KEY, sessionData);
      return userRecord.profile;
    }

    throw new Error('Invalid email or password');
  },

  /**
   * Clears the session.
   */
  logout() {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Retrieves the current authenticated user or null.
   */
  getCurrentUser(): User | null {
    const sessionStr = localStorage.getItem(STORAGE_KEY);
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      // Check expiry
      if (new Date().getTime() > session.expiry) {
        this.logout();
        return null;
      }
      return session.user;
    } catch (e) {
      return null;
    }
  },

  /**
   * Checks if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
};