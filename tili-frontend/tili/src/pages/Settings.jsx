import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { User, Bell, Lock, Moon, Sun } from 'lucide-react';
import styles from './Settings.module.css';

const Settings = ({ user }) => {
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        updates: true
    });
    const [darkMode, setDarkMode] = useState(false);

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>Account Settings</h2>

            <div className={styles.grid}>
                {/* Profile Section */}
                <Card title="Profile Information" className={styles.card}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatar}>{getInitials(user?.name)}</div>
                        <div className={styles.profileInfo}>
                            <h3>{user?.name || 'User'}</h3>
                            <p>{user?.role || 'Member'}</p>
                        </div>
                        <Button variant="outline" size="sm">Edit Profile</Button>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input type="email" value={user?.email || ''} disabled className={styles.input} />
                    </div>
                </Card>

                {/* Preferences Section */}
                <Card title="Preferences" className={styles.card}>
                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <div className={styles.settingLabel}><Bell size={18} /> Email Notifications</div>
                            <div className={styles.settingDesc}>Receive daily summaries</div>
                        </div>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={() => toggleNotification('email')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>

                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <div className={styles.settingLabel}><Moon size={18} /> Dark Mode</div>
                            <div className={styles.settingDesc}>Switch to dark theme</div>
                        </div>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </Card>

                {/* Security Section */}
                <Card title="Security" className={styles.card}>
                    <div className={styles.formGroup}>
                        <label>Current Password</label>
                        <input type="password" placeholder="••••••••" className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>New Password</label>
                        <input type="password" placeholder="New password" className={styles.input} />
                    </div>
                    <Button className={styles.saveBtn}>Update Password</Button>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
