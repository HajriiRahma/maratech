import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, className = '', title, actions, ...props }) => {
    return (
        <div className={`${styles.card} ${className}`} {...props}>
            {(title || actions) && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {actions && <div className={styles.actions}>{actions}</div>}
                </div>
            )}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};

export default Card;
