import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Calendar, Plus, Clock, MapPin, Users, FileText, Video } from 'lucide-react';
import { storage } from '../utils/storage';
import { useAccessibility } from '../context/AccessibilityContext';
import styles from './Meetings.module.css';

const MeetingCard = ({ meeting }) => (
    <Card className={styles.meetingCard}>
        <div className={styles.dateBox}>
            <span className={styles.month}>{meeting.month}</span>
            <span className={styles.day}>{meeting.day}</span>
        </div>

        <div className={styles.meetingInfo}>
            <h3 className={styles.meetingTitle}>{meeting.title}</h3>
            <div className={styles.meta}>
                <span className={styles.metaItem}><Clock size={14} /> {meeting.time}</span>
                <span className={styles.metaItem}><MapPin size={14} /> {meeting.location}</span>
            </div>
            {meeting.projectName && (
                <div className={styles.projectLink}>
                    <FileText size={12} /> Linked Project: {meeting.projectName}
                </div>
            )}
            <div className={styles.participants}>
                <Users size={14} className={styles.icon} />
                {meeting.participants?.join(', ') || 'Team'}
            </div>
        </div>

        <div className={styles.actions}>
            {meeting.online && <Button size="sm" variant="outline"><Video size={14} /> Join</Button>}
            <Button size="sm" variant="ghost"><FileText size={14} /> Notes</Button>
        </div>
    </Card>
);

const Meetings = () => {
    const { announceContext, speak, preferences } = useAccessibility();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [meetings, setMeetings] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State
    const [newMeeting, setNewMeeting] = useState({
        title: '',
        date: '',
        timeOffset: '10:00', // Default time
        location: '',
        participants: '',
        projectId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [meetingsData, projectsData] = await Promise.all([
                    storage.getMeetings(),
                    storage.getProjects()
                ]);
                setMeetings(meetingsData);
                setProjects(projectsData);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load meetings');
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Continuous context awareness - announce page context when data loads
    useEffect(() => {
        if (!isLoading && !error && (preferences.spatialGuidance || preferences.descriptiveAudio)) {
            setTimeout(() => {
                announceContext('Meetings', {
                    itemCount: meetings.length,
                    itemType: 'meetings',
                    availableActions: [
                        'schedule new meeting',
                        'view meeting details',
                        'join online meeting',
                        'view meeting notes',
                        'navigate to Dashboard',
                        'navigate to Projects',
                        'navigate to Documents'
                    ],
                    navigationHint: meetings.length > 0
                        ? `There are ${meetings.length} meetings. Say "schedule meeting" to add a new one, or "join meeting" to join an online meeting.`
                        : 'No meetings scheduled yet. Say "schedule meeting" to add your first meeting.'
                });
            }, 1000);
        }
    }, [isLoading, error, meetings.length]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMeeting(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSchedule = async () => {
        if (!newMeeting.title || !newMeeting.date) return;

        // Combine date and time into LocalDateTime string
        // Assuming timeOffset is HH:mm
        const dateTime = `${newMeeting.date}T${newMeeting.timeOffset || '00:00'}:00`;

        const meetingToAdd = {
            title: newMeeting.title,
            date: dateTime,
            location: newMeeting.location || 'Remote',
            participants: newMeeting.participants ? newMeeting.participants.split(',').map(p => p.trim()) : [],
            projectId: newMeeting.projectId || null
        };

        try {
            const savedMeeting = await storage.saveMeeting(meetingToAdd);
            setMeetings(prev => [...prev, savedMeeting]);
            setIsAddModalOpen(false);
            setNewMeeting({ title: '', date: '', timeOffset: '10:00', location: '', participants: '', projectId: '' });
        } catch (err) {
            console.error('Failed to schedule meeting:', err);
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading meetings...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Upcoming Meetings</h2>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} /> Schedule Meeting
                </Button>
            </div>

            <div className={styles.grid}>
                {meetings.length > 0 ? (
                    meetings.map(meeting => (
                        <MeetingCard key={meeting.id} meeting={meeting} />
                    ))
                ) : (
                    <div className={styles.emptyState}>No meetings scheduled.</div>
                )}
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Schedule New Meeting"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSchedule}>Schedule</Button>
                    </>
                }
            >
                <div className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input
                            name="title"
                            value={newMeeting.title}
                            onChange={handleInputChange}
                            type="text"
                            className={styles.input}
                            placeholder="Meeting Title"
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Date</label>
                            <input
                                name="date"
                                value={newMeeting.date}
                                onChange={handleInputChange}
                                type="date"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Time</label>
                            <input
                                name="timeOffset"
                                value={newMeeting.timeOffset}
                                onChange={handleInputChange}
                                type="time"
                                className={styles.input}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Linked Project (Optional)</label>
                        <select
                            name="projectId"
                            value={newMeeting.projectId}
                            onChange={handleInputChange}
                            className={styles.input}
                        >
                            <option value="">None</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Location / Link</label>
                        <input
                            name="location"
                            value={newMeeting.location}
                            onChange={handleInputChange}
                            type="text"
                            className={styles.input}
                            placeholder="Room or URL"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Participants</label>
                        <input
                            name="participants"
                            value={newMeeting.participants}
                            onChange={handleInputChange}
                            type="text"
                            className={styles.input}
                            placeholder="Add names or emails (comma separated)..."
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Meetings;
