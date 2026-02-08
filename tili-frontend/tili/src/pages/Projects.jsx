import React, { useState, useEffect } from 'react';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Briefcase, MoreHorizontal, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import styles from './Projects.module.css';

const ProjectCard = ({ project }) => {
    const getStatusColor = (status) => {
        // Handle both backend enum and frontend display names
        const s = status?.toUpperCase();
        if (s === 'ACTIVE' || status === 'Active' || status === 'Planning' || status === 'On Hold') return 'var(--success)';
        if (s === 'CLOTURE' || status === 'Completed') return 'var(--secondary)';
        return 'var(--primary)';
    };

    return (
        <Card className={styles.projectCard}>
            <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                    <Briefcase size={20} />
                </div>
                <div className={styles.statusBadge} style={{ borderColor: getStatusColor(project.status), color: getStatusColor(project.status) }}>
                    {project.status || 'Active'}
                </div>
                <button className={styles.moreBtn}>
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <h3 className={styles.title}>{project.title}</h3>
            <p className={styles.description}>{project.description}</p>

            <div className={styles.team}>
                {(project.team || []).map((member, i) => (
                    <div key={i} className={styles.avatar} title={member}>
                        {member.charAt(0)}
                    </div>
                ))}
                {project.team?.length > 3 && <div className={styles.moreAvatar}>+{project.team.length - 3}</div>}
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${project.progress || 0}%` }}></div>
                </div>
                <span className={styles.progressText}>{project.progress || 0}% Complete</span>
            </div>

            <div className={styles.footer}>
                <span className={styles.deadline}>Due: {project.deadline || 'TBD'}</span>
                <Button size="sm" variant="outline">View Details</Button>
            </div>
        </Card>
    );
};

const Projects = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        status: 'Planning',
        deadline: '',
        team: ''
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await storage.getProjects();
                setProjects(data);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to fetch projects:', err);
                setError('Failed to load projects');
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateProject = async () => {
        if (!newProject.title) return;

        // Map frontend status to backend Enum
        let backendStatus = 'ACTIVE';
        if (newProject.status === 'Completed') backendStatus = 'CLOTURE';

        const projectToAdd = {
            title: newProject.title,
            description: newProject.description,
            status: backendStatus,
            progress: 0,
            team: newProject.team ? newProject.team.split(',').map(m => m.trim()) : [],
            deadline: newProject.deadline || 'TBD',
            startDate: new Date().toISOString().split('T')[0], // Backend expects LocalDate
            endDate: newProject.deadline || null
        };

        try {
            const savedProject = await storage.saveProject(projectToAdd);
            setProjects(prev => [savedProject, ...prev]);
            setIsModalOpen(false);
            setNewProject({ title: '', description: '', status: 'Planning', deadline: '', team: '' });
        } catch (err) {
            console.error('Failed to create project:', err);
            // Optionally show an error message in the modal
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading projects...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Projects</h2>
                <Button onClick={() => setIsModalOpen(true)}>New Project</Button>
            </div>

            <div className={styles.grid}>
                {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Project"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateProject}>Create Project</Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Project Title</label>
                        <input
                            name="title"
                            value={newProject.title}
                            onChange={handleInputChange}
                            type="text"
                            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="Enter title"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Description</label>
                        <textarea
                            name="description"
                            value={newProject.description}
                            onChange={handleInputChange}
                            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                            rows="3"
                            placeholder="Describe the project..."
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Status</label>
                            <select
                                name="status"
                                value={newProject.status}
                                onChange={handleInputChange}
                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            >
                                <option value="Planning">Planning</option>
                                <option value="Active">Active</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Deadline</label>
                            <input
                                name="deadline"
                                value={newProject.deadline}
                                onChange={handleInputChange}
                                type="date"
                                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Team Members</label>
                        <input
                            name="team"
                            value={newProject.team}
                            onChange={handleInputChange}
                            type="text"
                            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            placeholder="Comma separated names (e.g. Alice, Bob)"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Projects;
