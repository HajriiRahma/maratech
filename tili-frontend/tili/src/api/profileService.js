import apiClient from './apiClient';

/**
 * Profile Service
 * Handles fetching user profile data and user-related resources from backend
 */
export const profileService = {
    /**
     * Get current user profile information
     * @param {string} userId - The authenticated user's ID
     * @returns {Promise<Object>} User profile data
     */
    getUserProfile: async (userId) => {
        try {
            const response = await apiClient.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    /**
     * Get documents related to the user
     * Backend filters based on user role and permissions
     * @param {string} userId - The authenticated user's ID
     * @returns {Promise<Array>} List of documents
     */
    getUserDocuments: async (userId) => {
        try {
            const response = await apiClient.get(`/documents/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user documents:', error);
            // Fallback: get all documents and filter on frontend
            try {
                const allDocs = await apiClient.get('/documents');
                return allDocs.data;
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw fallbackError;
            }
        }
    },

    /**
     * Get meetings related to the user
     * Backend filters based on user role and permissions
     * @param {string} userId - The authenticated user's ID
     * @returns {Promise<Array>} List of meetings
     */
    getUserMeetings: async (userId) => {
        try {
            const response = await apiClient.get(`/meetings/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user meetings:', error);
            // Fallback: get all meetings
            try {
                const allMeetings = await apiClient.get('/meetings');
                return allMeetings.data;
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw fallbackError;
            }
        }
    },

    /**
     * Get projects related to the user
     * Backend filters based on user role and permissions
     * @param {string} userId - The authenticated user's ID
     * @returns {Promise<Array>} List of projects
     */
    getUserProjects: async (userId) => {
        try {
            const response = await apiClient.get(`/projects/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user projects:', error);
            // Fallback: get all projects
            try {
                const allProjects = await apiClient.get('/projects');
                return allProjects.data;
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw fallbackError;
            }
        }
    },

    /**
     * Get all user-related data in one call
     * @param {string} userId - The authenticated user's ID
     * @returns {Promise<Object>} Object containing profile, documents, meetings, and projects
     */
    getUserData: async (userId) => {
        try {
            const [profile, documents, meetings, projects] = await Promise.all([
                profileService.getUserProfile(userId),
                profileService.getUserDocuments(userId),
                profileService.getUserMeetings(userId),
                profileService.getUserProjects(userId)
            ]);

            return {
                profile,
                documents,
                meetings,
                projects
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }
};

