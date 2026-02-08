import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import styles from './AccessibilityProfileManager.module.css';

const AccessibilityProfileManager = ({ isOpen, onClose }) => {
    const { preferences, accessibilityNeedsOptions, applyAccessibilityNeeds, speak, describeElement, announceLive } = useAccessibility();
    const [selectedNeeds, setSelectedNeeds] = useState(preferences.accessibilityNeeds || []);
    const [hasChanges, setHasChanges] = useState(false);

    if (!isOpen) return null;

    const handleToggleNeed = (needId) => {
        setSelectedNeeds(prev => {
            const newNeeds = prev.includes(needId)
                ? prev.filter(id => id !== needId)
                : [...prev, needId];
            
            setHasChanges(true);
            
            const need = accessibilityNeedsOptions.find(n => n.id === needId);
            if (need) {
                const action = newNeeds.includes(needId) ? 'Added' : 'Removed';
                announceLive(`${action}: ${need.label}`);
            }
            
            return newNeeds;
        });
    };

    const handleSave = () => {
        applyAccessibilityNeeds(selectedNeeds);
        announceLive(`Accessibility profile updated. ${selectedNeeds.length} ${selectedNeeds.length === 1 ? 'need' : 'needs'} selected.`);
        setHasChanges(false);
        onClose();
    };

    const handleCancel = () => {
        if (hasChanges) {
            announceLive('Changes discarded');
        }
        setSelectedNeeds(preferences.accessibilityNeeds || []);
        setHasChanges(false);
        onClose();
    };

    const handleClearAll = () => {
        setSelectedNeeds([]);
        setHasChanges(true);
        announceLive('All accessibility needs cleared');
    };

    const groupedNeeds = accessibilityNeedsOptions.reduce((acc, need) => {
        if (!acc[need.category]) {
            acc[need.category] = [];
        }
        acc[need.category].push(need);
        return acc;
    }, {});

    const categoryLabels = {
        visual: 'Vision',
        hearing: 'Hearing',
        motor: 'Movement and Control',
        cognitive: 'Thinking and Memory',
        situational: 'Temporary or Situational'
    };

    return (
        <div 
            className={styles.overlay} 
            role="dialog" 
            aria-labelledby="profile-title"
            aria-describedby="profile-description"
            aria-modal="true"
            onClick={handleCancel}
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h2 id="profile-title" className={styles.title}>
                            Manage Accessibility Profile
                        </h2>
                        <p id="profile-description" className={styles.subtitle}>
                            Add or remove interaction needs. Changes apply immediately.
                        </p>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={handleCancel}
                        onFocus={() => speak('Close button. Discard changes and close this dialog.')}
                        aria-label="Close accessibility profile manager"
                    >
                        <X size={24} aria-hidden="true" />
                    </button>
                </div>

                <div className={styles.summary} role="status" aria-live="polite">
                    <p>
                        <strong>{selectedNeeds.length}</strong> {selectedNeeds.length === 1 ? 'need' : 'needs'} selected
                        {hasChanges && <span className={styles.unsaved}> (unsaved changes)</span>}
                    </p>
                    {selectedNeeds.length > 0 && (
                        <button
                            className={styles.clearButton}
                            onClick={handleClearAll}
                            onFocus={() => speak('Clear all button. Remove all selected accessibility needs.')}
                            aria-label="Clear all selected needs"
                        >
                            <Trash2 size={16} aria-hidden="true" />
                            Clear all
                        </button>
                    )}
                </div>

                <div className={styles.content}>
                    {Object.entries(groupedNeeds).map(([category, needs]) => (
                        <div key={category} className={styles.category}>
                            <h3 className={styles.categoryTitle}>{categoryLabels[category]}</h3>
                            <div className={styles.needsList} role="group" aria-label={categoryLabels[category]}>
                                {needs.map((need) => {
                                    const isSelected = selectedNeeds.includes(need.id);
                                    
                                    return (
                                        <div
                                            key={need.id}
                                            className={`${styles.needItem} ${isSelected ? styles.selected : ''}`}
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            aria-labelledby={`profile-need-${need.id}-label`}
                                            aria-describedby={`profile-need-${need.id}-desc`}
                                            tabIndex={0}
                                            onClick={() => handleToggleNeed(need.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === ' ' || e.key === 'Spacebar') {
                                                    e.preventDefault();
                                                    handleToggleNeed(need.id);
                                                }
                                            }}
                                            onFocus={() => describeElement(
                                                need.label,
                                                `in the ${categoryLabels[category]} section`,
                                                need.description,
                                                isSelected ? 'this need will be removed from your profile' : 'this need will be added to your profile'
                                            )}
                                        >
                                            <div className={styles.checkbox} aria-hidden="true">
                                                {isSelected && <Check size={18} />}
                                            </div>
                                            <div className={styles.needContent}>
                                                <h4 id={`profile-need-${need.id}-label`} className={styles.needLabel}>
                                                    {need.label}
                                                </h4>
                                                <p id={`profile-need-${need.id}-desc`} className={styles.needDescription}>
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

                <div className={styles.footer}>
                    <button
                        className={styles.cancelButton}
                        onClick={handleCancel}
                        onFocus={() => speak('Cancel button. Discard changes and close.')}
                        aria-label="Cancel and close without saving"
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={!hasChanges}
                        onFocus={() => speak(hasChanges ? 'Save button. Apply your changes.' : 'Save button. No changes to save.')}
                        aria-label={hasChanges ? 'Save changes to accessibility profile' : 'No changes to save'}
                    >
                        <Check size={20} aria-hidden="true" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityProfileManager;

