import React, { useState } from 'react';
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
    const { announceNavigation, speak, guideToButton, preferences, announceLive } = useAccessibility();
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'View your dashboard and statistics', position: 'first item in the sidebar' },
        { id: 'documents', label: 'Documents', icon: FileText, description: 'Manage and view documents', position: 'second item, below Dashboard' },
        { id: 'meetings', label: 'Meetings', icon: Calendar, description: 'Schedule and view meetings', position: 'third item, below Documents' },
        { id: 'projects', label: 'Projects', icon: Briefcase, description: 'Manage your projects', position: 'fourth item, below Meetings' },
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
                {menuItems.map((item, index) => {
                    if (item.role && item.role !== userRole) return null;

                    const Icon = item.icon;
                    const isActive = activePage === item.id;

                    return (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={() => handleNavigate(item.id, item.label)}
                            onFocus={() => {
                                if (preferences.spatialGuidance) {
                                    guideToButton(item.label, {
                                        position: item.position,
                                        action: `navigate to ${item.label} page`,
                                        direction: isActive ? 'You are currently on this page' : `Press Enter or Space to navigate to ${item.label}`
                                    });
                                } else {
                                    speak(item.label);
                                }
                            }}
                            onMouseEnter={() => {
                                if (preferences.descriptiveAudio || preferences.spatialGuidance) {
                                    speak(`${item.label}. ${item.description}. Located at ${item.position}.${isActive ? ' You are currently on this page.' : ''}`);
                                }
                            }}
                            aria-label={`${item.label}. ${item.description}${isActive ? '. Current page' : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                            data-voice-command={item.label.toLowerCase()}
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
                    onFocus={() => {
                        if (preferences.spatialGuidance) {
                            guideToButton('Settings', {
                                position: 'at the bottom of the sidebar, above Logout',
                                action: 'navigate to Settings page where you can manage your preferences and account',
                                direction: 'Press Enter or Space to activate'
                            });
                        } else {
                            speak('Settings');
                        }
                    }}
                    onMouseEnter={() => {
                        if (preferences.descriptiveAudio || preferences.spatialGuidance) {
                            speak('Settings. Manage your preferences and account. Located at the bottom of the sidebar, above Logout.');
                        }
                    }}
                    aria-label="Settings. Manage your preferences and account"
                    aria-current={activePage === 'settings' ? 'page' : undefined}
                    data-voice-command="settings"
                >
                    <Settings size={20} aria-hidden="true" />
                    <span>Settings</span>
                </button>
                <button
                    className={`${styles.navItem} ${styles.logout}`}
                    onClick={() => {
                        if (!showLogoutConfirmation) {
                            setShowLogoutConfirmation(true);
                            speak('Are you sure you want to logout? This will end your session and you will need to sign in again. Say "confirm" or click again to logout, or say "cancel" to stay signed in.');
                        } else {
                            speak('Logging out. Your session will end. Goodbye.');
                            onLogout();
                        }
                    }}
                    onFocus={() => {
                        if (preferences.spatialGuidance) {
                            guideToButton('Logout', {
                                position: 'at the bottom left of the sidebar, last item',
                                action: 'end your session and return to the login page',
                                warning: 'You will need to sign in again to access the platform',
                                direction: showLogoutConfirmation
                                    ? 'Press Enter or Space again to confirm logout, or press Escape to cancel'
                                    : 'Press Enter or Space to logout'
                            });
                        } else {
                            speak(showLogoutConfirmation ? 'Logout - Click again to confirm' : 'Logout');
                        }
                    }}
                    onMouseEnter={() => {
                        if (preferences.descriptiveAudio || preferences.spatialGuidance) {
                            speak(showLogoutConfirmation
                                ? 'Logout confirmation. Click again to confirm logout and end your session.'
                                : 'Logout. Sign out of your account. Located at the bottom left of the sidebar, last item.');
                        }
                    }}
                    onBlur={() => {
                        // Reset confirmation if user navigates away
                        if (showLogoutConfirmation) {
                            setTimeout(() => setShowLogoutConfirmation(false), 200);
                        }
                    }}
                    aria-label={showLogoutConfirmation
                        ? "Logout confirmation. Click again to confirm logout, or press Escape to cancel"
                        : "Logout. Sign out of your account"}
                    data-voice-command="logout"
                    className={`${styles.navItem} ${styles.logout} ${showLogoutConfirmation ? styles.confirmLogout : ''}`}
                >
                    <LogOut size={20} aria-hidden="true" />
                    <span>{showLogoutConfirmation ? 'Confirm Logout?' : 'Logout'}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
