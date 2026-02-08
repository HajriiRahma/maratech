import apiClient from '../api/apiClient';

// LocalStorage keys
const PROJECTS_KEY = 'tili_projects';
const DOCUMENTS_KEY = 'tili_documents';
const MEETINGS_KEY = 'tili_meetings';
const SEED_INITIALIZED_KEY = 'tili_seed_initialized';

// Helper functions
const getFromStorage = (key) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initialize seed data (only once)
const initializeSeedData = () => {
    // Check if already initialized
    if (localStorage.getItem(SEED_INITIALIZED_KEY)) {
        return;
    }

    // Sample Projects
    const sampleProjects = [
        {
            id: 1001,
            title: 'Community Health Initiative',
            description: 'A comprehensive health program targeting rural communities with focus on maternal and child health services.',
            status: 'ACTIVE',
            progress: 65,
            team: ['Dr. Sarah Johnson', 'Ahmed Hassan', 'Maria Garcia'],
            deadline: '2026-06-30',
            startDate: '2025-01-15',
            endDate: '2026-06-30',
            createdAt: '2025-01-15T10:00:00'
        },
        {
            id: 1002,
            title: 'Education Access Program',
            description: 'Providing educational resources and infrastructure to underserved schools in remote areas.',
            status: 'Planning',
            progress: 25,
            team: ['John Smith', 'Fatima Al-Rashid'],
            deadline: '2026-12-31',
            startDate: '2026-03-01',
            endDate: '2026-12-31',
            createdAt: '2026-01-20T14:30:00'
        }
    ];

    // Sample Documents
    const sampleDocuments = [
        {
            id: 2001,
            name: 'Q1 2026 Progress Report',
            type: 'RAPPORT',
            date: '2026-02-05',
            size: '2.4 MB',
            userId: 1,
            projectId: 1001,
            filePath: null,
            uploadedAt: '2026-02-05T09:15:00'
        },
        {
            id: 2002,
            name: 'Budget Planning Meeting Notes',
            type: 'COMPTE_RENDU',
            date: '2026-01-28',
            size: '856 KB',
            userId: 1,
            projectId: null,
            filePath: null,
            uploadedAt: '2026-01-28T16:45:00'
        }
    ];

    // Sample Meetings
    const sampleMeetings = [
        {
            id: 3001,
            title: 'Monthly Project Review',
            date: '2026-02-15T10:00:00',
            location: 'Conference Room A',
            participants: ['Team Lead', 'Project Manager', 'Stakeholders'],
            projectId: 1001,
            createdAt: '2026-02-01T11:00:00'
        },
        {
            id: 3002,
            title: 'Stakeholder Consultation',
            date: '2026-02-20T14:30:00',
            location: 'https://zoom.us/meeting',
            participants: ['Community Leaders', 'NGO Representatives', 'Government Officials'],
            projectId: 1002,
            createdAt: '2026-02-03T13:20:00'
        }
    ];

    // Save seed data
    saveToStorage(PROJECTS_KEY, sampleProjects);
    saveToStorage(DOCUMENTS_KEY, sampleDocuments);
    saveToStorage(MEETINGS_KEY, sampleMeetings);

    // Mark as initialized
    localStorage.setItem(SEED_INITIALIZED_KEY, 'true');
};

// Initialize seed data when module loads
initializeSeedData();

export const storage = {
    getDocuments: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            return getFromStorage(DOCUMENTS_KEY);
        } catch (error) {
            console.error('Error fetching documents:', error);
            throw error;
        }
    },

    uploadDocument: async (formData) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const file = formData.get('file');
            const title = formData.get('title');
            const type = formData.get('type');
            const userId = formData.get('userId');
            const projectId = formData.get('projectId');

            const newDoc = {
                id: Date.now(),
                name: title || file?.name || 'Untitled Document',
                type: type || 'RAPPORT',
                date: new Date().toISOString().split('T')[0],
                size: file?.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A',
                userId: userId,
                projectId: projectId || null,
                filePath: file ? URL.createObjectURL(file) : null,
                uploadedAt: new Date().toISOString()
            };

            const documents = getFromStorage(DOCUMENTS_KEY);
            documents.unshift(newDoc);
            saveToStorage(DOCUMENTS_KEY, documents);

            return newDoc;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    },

    getMeetings: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const meetings = getFromStorage(MEETINGS_KEY);

            // Format meetings for display
            return meetings.map(meeting => {
                const date = new Date(meeting.date);
                return {
                    ...meeting,
                    month: date.toLocaleString('default', { month: 'short' }),
                    day: date.getDate(),
                    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    online: meeting.location?.includes('http') || meeting.location?.toLowerCase().includes('zoom') || meeting.location?.toLowerCase().includes('meet')
                };
            });
        } catch (error) {
            console.error('Error fetching meetings:', error);
            throw error;
        }
    },

    saveMeeting: async (meeting) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const newMeeting = {
                id: Date.now(),
                ...meeting,
                createdAt: new Date().toISOString()
            };

            const meetings = getFromStorage(MEETINGS_KEY);
            meetings.push(newMeeting);
            saveToStorage(MEETINGS_KEY, meetings);

            // Format for display
            const date = new Date(newMeeting.date);
            return {
                ...newMeeting,
                month: date.toLocaleString('default', { month: 'short' }),
                day: date.getDate(),
                time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                online: newMeeting.location?.includes('http') || newMeeting.location?.toLowerCase().includes('zoom') || newMeeting.location?.toLowerCase().includes('meet')
            };
        } catch (error) {
            console.error('Error saving meeting:', error);
            throw error;
        }
    },

    getProjects: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            return getFromStorage(PROJECTS_KEY);
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    saveProject: async (project) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const newProject = {
                id: Date.now(),
                ...project,
                createdAt: new Date().toISOString()
            };

            const projects = getFromStorage(PROJECTS_KEY);
            projects.push(newProject);
            saveToStorage(PROJECTS_KEY, projects);

            return newProject;
        } catch (error) {
            console.error('Error saving project:', error);
            throw error;
        }
    },

    // Dashboard stats
    getDashboardStats: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const projects = getFromStorage(PROJECTS_KEY);
            const documents = getFromStorage(DOCUMENTS_KEY);
            const meetings = getFromStorage(MEETINGS_KEY);

            // Get active projects (status is ACTIVE or not CLOTURE)
            const activeProjects = projects.filter(p =>
                p.status === 'ACTIVE' || p.status === 'Active' || p.status === 'Planning' || p.status === 'On Hold'
            ).length;

            // Create recent activities from all data
            const recentActivities = [];

            // Add recent documents
            documents.slice(0, 3).forEach(doc => {
                recentActivities.push({
                    user: 'User',
                    action: 'Uploaded document',
                    target: doc.name,
                    time: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'Recently'
                });
            });

            // Add recent projects
            projects.slice(0, 2).forEach(proj => {
                recentActivities.push({
                    user: 'User',
                    action: 'Created project',
                    target: proj.title,
                    time: proj.createdAt ? new Date(proj.createdAt).toLocaleString() : 'Recently'
                });
            });

            // Add recent meetings
            meetings.slice(0, 2).forEach(meet => {
                recentActivities.push({
                    user: 'User',
                    action: 'Scheduled meeting',
                    target: meet.title,
                    time: meet.createdAt ? new Date(meet.createdAt).toLocaleString() : 'Recently'
                });
            });

            // Sort by time (most recent first)
            recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

            return {
                totalDocuments: documents.length,
                activeProjects: activeProjects,
                totalMeetings: meetings.length,
                recentActivities: recentActivities.slice(0, 5)
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }
};
