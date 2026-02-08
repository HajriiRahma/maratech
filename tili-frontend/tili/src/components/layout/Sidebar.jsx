import React from 'react';
import {
    LayoutDashboard,
    FileText,
    Users,
    Calendar,
    Briefcase,
    Settings,
    LogOut
} from 'lucide-react';
import styles from './Layout.module.css';

const Sidebar = ({ activePage, onNavigate, userRole = 'admin', onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'meetings', label: 'Meetings', icon: Calendar },
        { id: 'projects', label: 'Projects', icon: Briefcase },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <div className={styles.logo}>TILI</div>
                <div className={styles.appName}>Internal Platform</div>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => {
                    if (item.role && item.role !== userRole) return null;

                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className={styles.sidebarFooter}>
                <button
                    className={`${styles.navItem} ${activePage === 'settings' ? styles.active : ''}`}
                    onClick={() => onNavigate('settings')}
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
                <button
                    className={`${styles.navItem} ${styles.logout}`}
                    onClick={onLogout}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
