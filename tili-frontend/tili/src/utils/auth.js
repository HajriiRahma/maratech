import apiClient from '../api/apiClient';

const CURRENT_USER_KEY = 'tili_user';
const USERS_STORAGE_KEY = 'tili_users';

// Helper to get all registered users
const getStoredUsers = () => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

// Helper to save users
const saveUsers = (users) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const authService = {
    // Login function - now returns a Promise
    login: async (email, password) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const users = getStoredUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Don't store password in session
                const { password: _, ...userWithoutPassword } = user;
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
                return userWithoutPassword;
            }

            throw new Error('Invalid email or password');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Register function - now returns a Promise
    register: async (name, email, password, role) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const users = getStoredUsers();

            // Check if email already exists
            if (users.find(u => u.email === email)) {
                throw new Error('Email already registered');
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                name,
                email,
                password, // Store password for login simulation
                role,
                active: true,
                createdAt: new Date().toISOString()
            };

            // Save to users list
            users.push(newUser);
            saveUsers(users);

            // Auto-login after register (without password)
            const { password: _, ...userWithoutPassword } = newUser;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
            return userWithoutPassword;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Get current user session (synchronous as it reads from localStorage)
    getCurrentUser: () => {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    // Logout
    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
};
