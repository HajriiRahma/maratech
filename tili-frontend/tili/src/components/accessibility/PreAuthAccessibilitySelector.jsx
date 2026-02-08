import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import styles from './PreAuthAccessibilitySelector.module.css';

const PreAuthAccessibilitySelector = ({ onComplete }) => {
    const { accessibilityNeedsOptions, applyAccessibilityNeeds, speak, describeElement } = useAccessibility();
    const [selectedNeeds, setSelectedNeeds] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Announce the selector on mount - MANDATORY accessibility configuration
        speak('Welcome to TILI. Before you begin, please tell us how you prefer to interact. This helps us adapt the application to your needs. You can select multiple options, and you can change these settings anytime.', {
            onEnd: () => {
                setTimeout(() => {
                    speak('Use Tab to navigate between options, Space to select, and Enter to continue. You must select at least one option to proceed.');
                }, 500);
            }
        });
    }, []);

    const handleToggleNeed = (needId) => {
        setSelectedNeeds(prev => {
            const newNeeds = prev.includes(needId)
                ? prev.filter(id => id !== needId)
                : [...prev, needId];
            
            const need = accessibilityNeedsOptions.find(n => n.id === needId);
            if (need) {
                const action = newNeeds.includes(needId) ? 'Selected' : 'Unselected';
                speak(`${action}: ${need.label}`);
            }
            
            return newNeeds;
        });
    };

    const handleContinue = () => {
        // MANDATORY: User must select at least one option
        if (selectedNeeds.length === 0) {
            speak('Please select at least one option before continuing. If none of these apply to you, select "I can see, hear, and use my hands normally".');
            return;
        }

        applyAccessibilityNeeds(selectedNeeds);

        // Announce what was configured
        const selectedLabels = selectedNeeds.map(id => {
            const need = accessibilityNeedsOptions.find(n => n.id === id);
            return need ? need.label : '';
        }).filter(Boolean);

        speak(`Your accessibility profile has been configured. The application will now adapt to your needs. You can change these settings anytime in Settings. Proceeding to login.`);

        onComplete();
    };

    const handleKeyDown = (e, needId) => {
        if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            handleToggleNeed(needId);
        }
    };

    const groupedNeeds = accessibilityNeedsOptions.reduce((acc, need) => {
        if (!acc[need.category]) {
            acc[need.category] = [];
        }
        acc[need.category].push(need);
        return acc;
    }, {});

    const categoryLabels = {
        none: 'Standard',
        visual: 'Vision',
        hearing: 'Hearing',
        motor: 'Movement and Control',
        communication: 'Communication',
        cognitive: 'Thinking and Memory',
        situational: 'Temporary or Situational'
    };

    return (
        <div 
            className={styles.overlay} 
            role="dialog" 
            aria-labelledby="accessibility-title"
            aria-describedby="accessibility-description"
            aria-modal="true"
        >
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h1 id="accessibility-title" className={styles.title}>
                        How would you like to interact with TILI?
                    </h1>
                    <p id="accessibility-description" className={styles.subtitle}>
                        Select all that apply. You must choose at least one option. You can change these settings anytime.
                    </p>
                </div>

                <div className={styles.content} role="group" aria-label="Accessibility preferences">
                    {Object.entries(groupedNeeds).map(([category, needs]) => (
                        <div key={category} className={styles.category}>
                            <h2 className={styles.categoryTitle}>{categoryLabels[category]}</h2>
                            <div className={styles.needsGrid} role="group" aria-label={categoryLabels[category]}>
                                {needs.map((need) => {
                                    const isSelected = selectedNeeds.includes(need.id);
                                    
                                    return (
                                        <div
                                            key={need.id}
                                            className={`${styles.needCard} ${isSelected ? styles.selected : ''}`}
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            aria-labelledby={`need-${need.id}-label`}
                                            aria-describedby={`need-${need.id}-desc`}
                                            tabIndex={0}
                                            onClick={() => handleToggleNeed(need.id)}
                                            onKeyDown={(e) => handleKeyDown(e, need.id)}
                                            onFocus={() => describeElement(
                                                need.label,
                                                `in the ${categoryLabels[category]} section`,
                                                need.description,
                                                isSelected ? 'this option will be unselected' : 'this option will be selected'
                                            )}
                                        >
                                            <div className={styles.checkbox} aria-hidden="true">
                                                {isSelected && <span className={styles.checkmark}>✓</span>}
                                            </div>
                                            <div className={styles.needContent}>
                                                <h3 id={`need-${need.id}-label`} className={styles.needLabel}>
                                                    {need.label}
                                                </h3>
                                                <p id={`need-${need.id}-desc`} className={styles.needDescription}>
                                                    {need.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footer} role="group" aria-label="Actions">
                    <button
                        className={styles.continueButton}
                        onClick={handleContinue}
                        onFocus={() => speak(`Continue button. ${selectedNeeds.length === 0 ? 'You must select at least one option before continuing.' : `Save your ${selectedNeeds.length} selected ${selectedNeeds.length === 1 ? 'preference' : 'preferences'} and proceed to login.`}`)}
                        aria-label={selectedNeeds.length === 0 ? 'Continue (you must select at least one option)' : `Continue with ${selectedNeeds.length} selected ${selectedNeeds.length === 1 ? 'preference' : 'preferences'}`}
                        disabled={selectedNeeds.length === 0}
                    >
                        Continue {selectedNeeds.length > 0 && `(${selectedNeeds.length} selected)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreAuthAccessibilitySelector;

