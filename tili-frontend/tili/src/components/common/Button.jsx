import React from 'react';
import styles from './Button.module.css';
import { Loader2 } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    className = '',
    speakOnFocus = true,
    ...props
}) => {
    const { speak } = useAccessibility();

    const handleFocus = (e) => {
        if (speakOnFocus && !disabled && !isLoading) {
            const text = typeof children === 'string' ? children : props['aria-label'] || 'Button';
            speak(text);
        }
        if (props.onFocus) {
            props.onFocus(e);
        }
    };

    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
            disabled={disabled || isLoading}
            aria-busy={isLoading}
            aria-disabled={disabled || isLoading}
            {...props}
            onFocus={handleFocus}
        >
            {isLoading && <Loader2 className={styles.spinner} size={16} aria-hidden="true" />}
            {isLoading && <span className="sr-only">Loading</span>}
            {children}
        </button>
    );
};

export default Button;
