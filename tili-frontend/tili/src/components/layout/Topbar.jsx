import React from 'react';
import { Menu } from 'lucide-react';
import styles from './Layout.module.css';

const Topbar = ({ title, onMenuClick, user }) => {
    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
                {/* Mobile menu trigger could go here */}
                <h2 className={styles.pageTitle}>{title}</h2>
            </div>

            <div className={styles.userProfile}>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{user?.name || 'User'}</span>
                    <span className={styles.userRole}>{user?.role || 'Guest'}</span>
                </div>
                <div className={styles.avatar}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
