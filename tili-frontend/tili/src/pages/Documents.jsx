import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { FileText, Download, Eye, Plus, Search } from 'lucide-react';
import { storage } from '../utils/storage';
import { authService } from '../utils/auth';
import styles from './Documents.module.css';

const typeMapping = {
    'Report': 'RAPPORT',
    'Meeting': 'COMPTE_RENDU',
    'Project': 'PROJET',
    'Admin': 'ADMINISTRATIF',
    'Other': 'RAPPORT' // Fallback
};

const Documents = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentUser] = useState(authService.getCurrentUser());
    const [documents, setDocuments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State
    const [newDoc, setNewDoc] = useState({
        name: '',
        type: 'Report',
        projectId: '',
        file: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsData, projectsData] = await Promise.all([
                    storage.getDocuments(),
                    storage.getProjects()
                ]);
                setDocuments(docsData);
                setProjects(projectsData);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load documents');
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter Logic
    const filteredDocs = documents.filter(doc => {
        // Role-based filtering: Chef/Consultant cannot see 'ADMINISTRATIF' type
        if (currentUser?.role !== 'responsable' && doc.type === 'ADMINISTRATIF') {
            return false;
        }

        const matchesFilter = filter === 'all' || doc.type.toLowerCase() === typeMapping[filter]?.toLowerCase() || doc.type.toLowerCase() === filter.toLowerCase();
        const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleUpload = async () => {
        if (!newDoc.name || !newDoc.file) return;

        const formData = new FormData();
        formData.append('file', newDoc.file);
        formData.append('title', newDoc.name);
        formData.append('type', typeMapping[newDoc.type] || 'RAPPORT');
        formData.append('userId', currentUser.id);
        if (newDoc.projectId) {
            formData.append('projectId', newDoc.projectId);
        }

        try {
            const savedDoc = await storage.uploadDocument(formData);
            setDocuments(prev => [savedDoc, ...prev]);
            setIsUploadModalOpen(false);
            setNewDoc({ name: '', type: 'Report', projectId: '', file: null });
        } catch (err) {
            console.error('Failed to upload document:', err);
        }
    };

    const columns = [
        {
            header: 'Name', accessor: 'name', width: '40%', render: (row) => (
                <div className={styles.docName}>
                    <FileText size={16} />
                    <span>{row.name}</span>
                </div>
            )
        },
        {
            header: 'Type', accessor: 'type', width: '15%', render: (row) => (
                <span className={styles.typeTag}>{row.type}</span>
            )
        },
        { header: 'Date', accessor: 'date', width: '15%' },
        { header: 'Size', accessor: 'size', width: '10%' },
        {
            header: 'Actions', accessor: 'actions', width: '20%', render: (row) => (
                <div className={styles.actions}>
                    <button className={styles.actionBtn} title="View"><Eye size={16} /></button>
                    {row.filePath && (
                        <a href={row.filePath} className={styles.actionBtn} title="Download" download>
                            <Download size={16} />
                        </a>
                    )}
                </div>
            )
        },
    ];

    if (isLoading) {
        return <div className={styles.loading}>Loading documents...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <Card>
                <div className={styles.controls}>
                    <div className={styles.filters}>
                        <div className={styles.searchWrapper}>
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                className={styles.searchInput}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className={styles.select}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="Report">Reports</option>
                            <option value="Meeting">Meetings</option>
                            <option value="Project">Projects</option>
                            {currentUser?.role === 'responsable' && <option value="Admin">Admin</option>}
                        </select>
                    </div>
                    <Button onClick={() => setIsUploadModalOpen(true)}>
                        <Plus size={16} /> Upload Document
                    </Button>
                </div>

                <Table columns={columns} data={filteredDocs} />
            </Card>

            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                title="Upload Document"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsAddModalOpen ? setIsAddModalOpen(false) : setIsUploadModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpload}>Upload</Button>
                    </>
                }
            >
                <div className={styles.uploadForm}>
                    <div className={styles.formGroup}>
                        <label>Document Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Q4 Report"
                            value={newDoc.name}
                            onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Type</label>
                        <select
                            className={styles.select}
                            value={newDoc.type}
                            onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                        >
                            <option value="Report">Report</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Project">Project</option>
                            {currentUser?.role === 'responsable' && <option value="Admin">Admin</option>}
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Link to Project (Optional)</label>
                        <select
                            className={styles.select}
                            value={newDoc.projectId}
                            onChange={(e) => setNewDoc({ ...newDoc, projectId: e.target.value })}
                        >
                            <option value="">None</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.dropzone}>
                        <input
                            type="file"
                            id="fileUpload"
                            style={{ display: 'none' }}
                            onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files[0], name: newDoc.name || e.target.files[0]?.name })}
                        />
                        <label htmlFor="fileUpload" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p>{newDoc.file ? newDoc.file.name : 'Drag and drop file here or click to browse'}</p>
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Documents;
