import React, { useState } from 'react';
import { Volume2, ZoomIn, ZoomOut, BookOpen, HelpCircle, X, Maximize2 } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import styles from './AccessibilityAssistant.module.css';

const AccessibilityAssistant = () => {
    const { preferences, updatePreference, speak, isAssistantOpen, toggleAssistant } = useAccessibility();
    const [isExpanded, setIsExpanded] = useState(false);

    const actions = [
        {
            id: 'read-page',
            icon: Volume2,
            label: 'Read this page',
            action: () => {
                const mainContent = document.querySelector('main') || document.body;
                const text = mainContent.innerText;
                speak(text.substring(0, 500)); // Read first 500 characters
            }
        },
        {
            id: 'explain-page',
            icon: BookOpen,
            label: 'Explain this page',
            action: () => {
                const pageName = document.title || 'current page';
                speak(`You are on the ${pageName}. This page shows your main content and navigation options.`);
            }
        },
        {
            id: 'increase-text',
            icon: ZoomIn,
            label: 'Increase text size',
            action: () => {
                const sizes = ['small', 'medium', 'large', 'xlarge'];
                const currentIndex = sizes.indexOf(preferences.fontSize);
                if (currentIndex < sizes.length - 1) {
                    updatePreference('fontSize', sizes[currentIndex + 1]);
                    speak('Text size increased');
                }
            }
        },
        {
            id: 'decrease-text',
            icon: ZoomOut,
            label: 'Decrease text size',
            action: () => {
                const sizes = ['small', 'medium', 'large', 'xlarge'];
                const currentIndex = sizes.indexOf(preferences.fontSize);
                if (currentIndex > 0) {
                    updatePreference('fontSize', sizes[currentIndex - 1]);
                    speak('Text size decreased');
                }
            }
        },
        {
            id: 'toggle-contrast',
            icon: Maximize2,
            label: 'Toggle high contrast',
            action: () => {
                const newContrast = preferences.contrast === 'normal' ? 'high' : 'normal';
                updatePreference('contrast', newContrast);
                speak(`${newContrast === 'high' ? 'High' : 'Normal'} contrast mode activated`);
            }
        },
        {
            id: 'help',
            icon: HelpCircle,
            label: 'Get help',
            action: () => {
                speak('Press Tab to navigate between elements. Press Enter to activate buttons. Press Escape to close dialogs.');
            }
        }
    ];

    if (!isAssistantOpen) {
        return (
            <button
                className={styles.floatingButton}
                onClick={toggleAssistant}
                onFocus={() => speak('Accessibility assistant')}
                aria-label="Open accessibility assistant"
                title="Accessibility Assistant"
            >
                <HelpCircle size={24} />
            </button>
        );
    }

    return (
        <div className={styles.assistant} role="complementary" aria-label="Accessibility assistant">
            <div className={styles.header}>
                <h3 className={styles.title}>Accessibility Assistant</h3>
                <button
                    className={styles.closeButton}
                    onClick={toggleAssistant}
                    aria-label="Close assistant"
                >
                    <X size={20} />
                </button>
            </div>

            <div className={styles.content}>
                <p className={styles.description}>
                    Quick actions to help you navigate and customize your experience
                </p>

                <div className={styles.actions}>
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.id}
                                className={styles.actionButton}
                                onClick={action.action}
                                onFocus={() => speak(action.label)}
                                aria-label={action.label}
                            >
                                <Icon size={20} />
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className={styles.settings}>
                    <label className={styles.settingItem}>
                        <input
                            type="checkbox"
                            checked={preferences.audioFeedback}
                            onChange={(e) => {
                                updatePreference('audioFeedback', e.target.checked);
                                speak(e.target.checked ? 'Audio feedback enabled' : 'Audio feedback disabled');
                            }}
                            aria-label="Enable audio feedback"
                        />
                        <span>Audio feedback</span>
                    </label>

                    <label className={styles.settingItem}>
                        <input
                            type="checkbox"
                            checked={preferences.focusMode}
                            onChange={(e) => {
                                updatePreference('focusMode', e.target.checked);
                                speak(e.target.checked ? 'Focus mode enabled' : 'Focus mode disabled');
                            }}
                            aria-label="Enable focus mode"
                        />
                        <span>Focus mode</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityAssistant;

