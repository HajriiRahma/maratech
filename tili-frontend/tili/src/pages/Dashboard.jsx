import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import { FileText, Briefcase, Calendar, TrendingUp } from 'lucide-react';
import { storage } from '../utils/storage';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className={styles.statCard}>
        <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: color + '20', color: color }}>
                <Icon size={24} />
            </div>
            {trend && <span className={styles.trend}><TrendingUp size={14} /> {trend}</span>}
        </div>
        <div className={styles.statContent}>
            <h3 className={styles.statValue}>{value}</h3>
            <p className={styles.statTitle}>{title}</p>
        </div>
    </Card>
);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const stats = await storage.getDashboardStats();
                setData(stats);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load dashboard data');
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const columns = [
        { header: 'User', accessor: 'user', width: '20%' },
        { header: 'Action', accessor: 'action', width: '30%' },
        { header: 'Target', accessor: 'target', width: '30%' },
        { header: 'Time', accessor: 'time', width: '20%' },
    ];

    if (isLoading) {
        return <div className={styles.loading}>Loading dashboard...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    const stats = [
        {
            title: 'Total Documents',
            value: data?.totalDocuments || 0,
            icon: FileText,
            color: '#007bff',
            trend: '' // Trends are not in DTO yet, keeping empty to maintain UI structure
        },
        {
            title: 'Active Projects',
            value: data?.activeProjects || 0,
            icon: Briefcase,
            color: '#28a745',
            trend: ''
        },
        {
            title: 'Total Meetings',
            value: data?.totalMeetings || 0,
            icon: Calendar,
            color: '#ffc107',
            trend: ''
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Activity</h2>
                <Card>
                    <Table columns={columns} data={data?.recentActivities || []} />
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
