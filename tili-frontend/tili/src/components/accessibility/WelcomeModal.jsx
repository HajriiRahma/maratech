import React, { useState } from 'react';
import { Volume2, Eye, Zap, Check } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import styles from './WelcomeModal.module.css';

const WelcomeModal = ({ onComplete }) => {
    const { updatePreference, speak } = useAccessibility();
    const [step, setStep] = useState(0);
    const [selectedMode, setSelectedMode] = useState(null);

    const modes = [
        {
            id: 'audio',
            icon: Volume2,
            title: 'Audio-Guided Mode',
            description: 'Hear spoken feedback for navigation and actions',
            settings: {
                audioFeedback: true,
                fontSize: 'large',
                contrast: 'high'
            }
        },
        {
            id: 'visual',
            icon: Eye,
            title: 'Large Text & High Contrast',
            description: 'Enhanced visibility with larger fonts and strong colors',
            settings: {
                fontSize: 'xlarge',
                contrast: 'high',
                audioFeedback: false
            }
        },
        {
            id: 'simple',
            icon: Zap,
            title: 'Simple Step-by-Step',
            description: 'Clear, focused interface with one task at a time',
            settings: {
                focusMode: true,
                fontSize: 'large',
                audioFeedback: false
            }
        }
    ];

    const handleModeSelect = (mode) => {
        setSelectedMode(mode);
        // Apply settings
        Object.entries(mode.settings).forEach(([key, value]) => {
            updatePreference(key, value);
        });
        
        // Speak confirmation
        speak(`${mode.title} selected. You can change this anytime in settings.`);
    };

    const handleComplete = () => {
        updatePreference('showWelcome', false);
        speak('Welcome setup complete. Welcome to TILI.');
        onComplete();
    };

    const handleSkip = () => {
        updatePreference('showWelcome', false);
        onComplete();
    };

    return (
        <div className={styles.overlay} role="dialog" aria-labelledby="welcome-title" aria-modal="true">
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h1 id="welcome-title" className={styles.title}>Welcome to TILI</h1>
                    <p className={styles.subtitle}>
                        Let's set up your experience for comfortable use
                    </p>
                </div>

                <div className={styles.content}>
                    <p className={styles.instruction}>
                        Choose how you'd like to interact with the platform:
                    </p>

                    <div className={styles.modesGrid}>
                        {modes.map((mode) => {
                            const Icon = mode.icon;
                            const isSelected = selectedMode?.id === mode.id;
                            
                            return (
                                <button
                                    key={mode.id}
                                    className={`${styles.modeCard} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => handleModeSelect(mode)}
                                    onFocus={() => speak(mode.title)}
                                    aria-pressed={isSelected}
                                    aria-label={`${mode.title}. ${mode.description}`}
                                >
                                    <div className={styles.iconWrapper}>
                                        <Icon size={32} />
                                        {isSelected && (
                                            <div className={styles.checkmark}>
                                                <Check size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className={styles.modeTitle}>{mode.title}</h3>
                                    <p className={styles.modeDescription}>{mode.description}</p>
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.note}>
                        <p>💡 You can change these settings anytime from the Settings page</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.skipButton}
                        onClick={handleSkip}
                        aria-label="Skip setup and use default settings"
                    >
                        Skip for now
                    </button>
                    <button
                        className={styles.continueButton}
                        onClick={handleComplete}
                        disabled={!selectedMode}
                        aria-label="Continue with selected mode"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;

