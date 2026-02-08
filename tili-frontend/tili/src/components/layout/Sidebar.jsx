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
import { useAccessibility } from '../../context/AccessibilityContext';
import styles from './Layout.module.css';

const Sidebar = ({ activePage, onNavigate, userRole = 'admin', onLogout }) => {
    const { announceNavigation, speak } = useAccessibility();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'View your dashboard and statistics' },
        { id: 'documents', label: 'Documents', icon: FileText, description: 'Manage and view documents' },
        { id: 'meetings', label: 'Meetings', icon: Calendar, description: 'Schedule and view meetings' },
        { id: 'projects', label: 'Projects', icon: Briefcase, description: 'Manage your projects' },
    ];

    const handleNavigate = (pageId, label) => {
        onNavigate(pageId);
        announceNavigation(label);
    };

    return (
        <aside className={styles.sidebar} role="navigation" aria-label="Main navigation">
            <div className={styles.logoContainer}>
                <div className={styles.logo} aria-label="TILI Logo">TILI</div>
                <div className={styles.appName}>Internal Platform</div>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => {
                    if (item.role && item.role !== userRole) return null;

                    const Icon = item.icon;
                    const isActive = activePage === item.id;

                    return (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={() => handleNavigate(item.id, item.label)}
                            onFocus={() => speak(item.label)}
                            aria-label={`${item.label}. ${item.description}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon size={20} aria-hidden="true" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className={styles.sidebarFooter}>
                <button
                    className={`${styles.navItem} ${activePage === 'settings' ? styles.active : ''}`}
                    onClick={() => handleNavigate('settings', 'Settings')}
                    onFocus={() => speak('Settings')}
                    aria-label="Settings. Manage your preferences and account"
                    aria-current={activePage === 'settings' ? 'page' : undefined}
                >
                    <Settings size={20} aria-hidden="true" />
                    <span>Settings</span>
                </button>
                <button
                    className={`${styles.navItem} ${styles.logout}`}
                    onClick={() => {
                        speak('Logging out');
                        onLogout();
                    }}
                    onFocus={() => speak('Logout')}
                    aria-label="Logout. Sign out of your account"
                >
                    <LogOut size={20} aria-hidden="true" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
