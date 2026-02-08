import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import { User, FileText, Calendar, Briefcase, Loader } from 'lucide-react';
import { profileService } from '../api/profileService';
import { useAccessibility } from '../context/AccessibilityContext';
import styles from './Settings.module.css';

const Settings = ({ user }) => {
    const { announceContext, speak, preferences } = useAccessibility();
    const [profileData, setProfileData] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('documents');
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const fileInputRef = React.useRef(null);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                speak('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                speak('Image file is too large. Maximum size is 5 megabytes');
                return;
            }

            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                // Save to localStorage for now (until backend is ready)
                localStorage.setItem(`tili_user_photo_${user.id}`, reader.result);
                speak('Profile photo uploaded successfully');
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
            speak('Select a photo from your computer');
        }
    };

    // Load saved photo from localStorage on mount
    useEffect(() => {
        if (user && user.id) {
            const savedPhoto = localStorage.getItem(`tili_user_photo_${user.id}`);
            if (savedPhoto) {
                setPhotoPreview(savedPhoto);
            }
        }
    }, [user]);

    // Fetch user profile and related data from backend
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user || !user.id) {
                setError('No user session found');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Fetch all user-related data from backend
                const data = await profileService.getUserData(user.id);

                setProfileData(data.profile);
                setDocuments(data.documents || []);
                setMeetings(data.meetings || []);
                setProjects(data.projects || []);
            } catch (err) {
                console.error('Error loading profile data:', err);

                // Fallback: Use user data from localStorage if backend is unavailable
                if (user) {
                    setProfileData({
                        id: user.id,
                        name: user.name || user.full_name,
                        email: user.email,
                        role: user.role
                    });

                    // Try to get data from localStorage simulation
                    try {
                        const storedDocuments = JSON.parse(localStorage.getItem('tili_documents') || '[]');
                        const storedMeetings = JSON.parse(localStorage.getItem('tili_meetings') || '[]');
                        const storedProjects = JSON.parse(localStorage.getItem('tili_projects') || '[]');

                        setDocuments(storedDocuments.filter(doc => doc.createdBy === user.id || doc.userId === user.id));
                        setMeetings(storedMeetings.filter(meeting => meeting.createdBy === user.id || meeting.userId === user.id));
                        setProjects(storedProjects.filter(project => project.createdBy === user.id || project.userId === user.id));

                        setError('Using cached data. Backend server is not available.');
                    } catch (storageErr) {
                        console.error('Error reading from localStorage:', storageErr);
                        setError('Failed to load profile data. Please try again.');
                    }
                } else {
                    setError('Failed to load profile data. Please try again.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    // Continuous context awareness - announce page context when data loads
    useEffect(() => {
        if (!isLoading && !error && profileData && (preferences.spatialGuidance || preferences.descriptiveAudio)) {
            setTimeout(() => {
                announceContext('Profile', {
                    itemCount: documents.length + meetings.length + projects.length,
                    itemType: 'items in your profile',
                    availableActions: [
                        'view account information',
                        'switch between Documents, Meetings, and Projects tabs',
                        'change accessibility settings',
                        'navigate to Dashboard',
                        'navigate to Projects',
                        'navigate to Documents',
                        'navigate to Meetings'
                    ],
                    navigationHint: `You are viewing your profile. Your account shows ${documents.length} documents, ${meetings.length} meetings, and ${projects.length} projects. Use the tabs to switch between them.`
                });
            }, 1000);
        }
    }, [isLoading, error, profileData, documents.length, meetings.length, projects.length]);

    // Table columns for documents
    const documentColumns = [
        { header: 'Document Name', accessor: 'name', width: '40%' },
        { header: 'Type', accessor: 'type', width: '20%' },
        { header: 'Date', accessor: 'date', width: '20%' },
        { header: 'Size', accessor: 'size', width: '20%' }
    ];

    // Table columns for meetings
    const meetingColumns = [
        { header: 'Meeting Title', accessor: 'title', width: '40%' },
        { header: 'Date', accessor: 'date', width: '30%' },
        { header: 'Location', accessor: 'location', width: '30%' }
    ];

    // Table columns for projects
    const projectColumns = [
        { header: 'Project Name', accessor: 'title', width: '40%' },
        { header: 'Status', accessor: 'status', width: '20%' },
        { header: 'Progress', accessor: 'progress', width: '20%' },
        { header: 'Deadline', accessor: 'deadline', width: '20%' }
    ];

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Loader size={40} className={styles.spinner} />
                    <p>Loading profile data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>My Profile</h2>

            {/* Account Information Section */}
            <Card title="Account Information" className={styles.card}>
                <div className={styles.profileHeader}>
                    <div
                        className={styles.avatarContainer}
                        onClick={handlePhotoClick}
                        onMouseEnter={() => {
                            if (preferences.descriptiveAudio || preferences.spatialGuidance) {
                                speak('Profile photo. Click to upload a new photo from your computer.');
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Profile photo. Click to upload a new photo"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handlePhotoClick();
                            }
                        }}
                    >
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className={styles.avatarImage} />
                        ) : (
                            <div className={styles.avatar}>{getInitials(profileData?.name || user?.name)}</div>
                        )}
                        <div className={styles.avatarOverlay}>
                            <User size={24} />
                            <span>Change Photo</span>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                        aria-label="Upload profile photo"
                    />
                    <div className={styles.profileInfo}>
                        <h3>{profileData?.name || user?.name || 'User'}</h3>
                        <p className={styles.roleTag}>{profileData?.role || user?.role || 'Member'}</p>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={profileData?.name || user?.name || ''}
                        disabled
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={profileData?.email || user?.email || ''}
                        disabled
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Role</label>
                    <input
                        type="text"
                        value={profileData?.role || user?.role || ''}
                        disabled
                        className={styles.input}
                    />
                </div>
            </Card>

            {/* User-Related Data Section */}
            <Card title="My Activity" className={styles.card}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'documents' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('documents')}
                    >
                        <FileText size={18} />
                        Documents ({documents.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'meetings' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('meetings')}
                    >
                        <Calendar size={18} />
                        Meetings ({meetings.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'projects' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        <Briefcase size={18} />
                        Projects ({projects.length})
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'documents' && (
                        <div>
                            {documents.length > 0 ? (
                                <Table columns={documentColumns} data={documents} />
                            ) : (
                                <p className={styles.emptyState}>No documents found</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'meetings' && (
                        <div>
                            {meetings.length > 0 ? (
                                <Table columns={meetingColumns} data={meetings} />
                            ) : (
                                <p className={styles.emptyState}>No meetings found</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div>
                            {projects.length > 0 ? (
                                <Table columns={projectColumns} data={projects} />
                            ) : (
                                <p className={styles.emptyState}>No projects found</p>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Settings;
