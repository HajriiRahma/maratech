import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './Layout.module.css';

const Layout = ({ children, activePage, onNavigate, user, onLogout }) => {
    // Title mapping
    const titles = {
        dashboard: 'Dashboard',
        documents: 'Documents',
        meetings: 'Meetings',
        projects: 'Projects',
        users: 'User Management',
        settings: 'Settings'
    };

    return (
        <div className={styles.layout}>
            <Sidebar
                activePage={activePage}
                onNavigate={onNavigate}
                userRole={user?.role}
                onLogout={onLogout}
            />

            <div className={styles.mainWrapper}>
                <Topbar
                    title={titles[activePage] || 'TILI'}
                    user={user}
                />
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
