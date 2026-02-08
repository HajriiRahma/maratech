import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import { FileText, Briefcase, Calendar, TrendingUp } from 'lucide-react';
import { storage } from '../utils/storage';
import { useAccessibility } from '../context/AccessibilityContext';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, icon: Icon, color, trend, onFocus }) => (
    <Card
        className={styles.statCard}
        tabIndex={0}
        onFocus={onFocus}
        role="article"
        aria-label={`${title}: ${value}${trend ? `, trending ${trend}` : ''}`}
    >
        <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: color + '20', color: color }} aria-hidden="true">
                <Icon size={24} />
            </div>
            {trend && <span className={styles.trend} aria-label={`Trending ${trend}`}><TrendingUp size={14} aria-hidden="true" /> {trend}</span>}
        </div>
        <div className={styles.statContent}>
            <h3 className={styles.statValue}>{value}</h3>
            <p className={styles.statTitle}>{title}</p>
        </div>
    </Card>
);

const Dashboard = () => {
    const {
        announceContext,
        announcePageStructure,
        provideSpatialGuidance,
        speak,
        preferences
    } = useAccessibility();

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

    // Announce page structure and context when data loads
    useEffect(() => {
        if (!isLoading && data && !error) {
            const structure = {
                mainContent: 'Dashboard overview with statistics and recent activity',
                topActions: ['Statistics cards'],
                bottomActions: [],
                sidebarItems: ['Dashboard', 'Projects', 'Documents', 'Meetings', 'Settings'],
                totalElements: 3 + (data.recentActivities?.length || 0)
            };

            announcePageStructure('Dashboard', structure);

            // Announce context with available actions
            setTimeout(() => {
                announceContext('Dashboard', {
                    itemCount: data.recentActivities?.length || 0,
                    itemType: 'recent activities',
                    availableActions: [
                        'view statistics',
                        'navigate to Projects',
                        'navigate to Documents',
                        'navigate to Meetings'
                    ],
                    navigationHint: 'Say "Projects", "Documents", or "Meetings" to navigate to those sections.'
                });
            }, 2000);
        }
    }, [isLoading, data, error]);

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
        <div className={styles.container} role="main" aria-label="Dashboard">
            <div className={styles.statsGrid} role="region" aria-label="Statistics overview">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        {...stat}
                        onFocus={() => provideSpatialGuidance(null, {
                            elementName: `${stat.title} statistic`,
                            position: index === 0 ? 'first card at the top' : index === stats.length - 1 ? 'last card at the top' : 'middle card at the top',
                            purpose: `Shows ${stat.title}: ${stat.value}`,
                            nextAction: index < stats.length - 1 ? 'Press Tab to move to the next statistic' : 'Press Tab to move to Recent Activity section',
                            isFirst: index === 0,
                            isLast: index === stats.length - 1,
                            totalCount: stats.length,
                            currentIndex: index + 1
                        })}
                    />
                ))}
            </div>

            <div className={styles.section} role="region" aria-label="Recent activity">
                <h2
                    className={styles.sectionTitle}
                    tabIndex={0}
                    onFocus={() => speak('Recent Activity section. This shows the latest actions in the system.')}
                >
                    Recent Activity
                </h2>
                <Card>
                    <Table
                        columns={columns}
                        data={data?.recentActivities || []}
                        aria-label={`Recent activities table with ${data?.recentActivities?.length || 0} entries`}
                    />
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
