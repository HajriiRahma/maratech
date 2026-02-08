import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
};

export const AccessibilityProvider = ({ children }) => {
    const [preferences, setPreferences] = useState(() => {
        const stored = localStorage.getItem('tili_accessibility_preferences');
        return stored ? JSON.parse(stored) : {
            // Legacy settings
            fontSize: 'medium',
            contrast: 'normal',
            audioFeedback: false,
            focusMode: false,
            reducedMotion: false,
            keyboardNavigation: true,
            screenReaderOptimized: false,
            language: 'en',
            showWelcome: true,

            // New comprehensive accessibility profile
            accessibilityNeeds: [], // Array of selected needs
            hasConfigured: false, // Whether user has configured accessibility

            // Interaction modes (derived from needs)
            voiceNavigation: false,
            voiceInput: false,
            descriptiveAudio: false,
            visualConfirmations: true,
            stepByStepMode: false,
            simplifiedLanguage: false,
            extendedTimeouts: false,
            autoReadContent: false,
            spatialAudioCues: false,
            spatialGuidance: false, // Directional guidance (up, down, left, right)
            hapticFeedback: false,

            // Advanced settings
            speechRate: 1.0,
            speechPitch: 1.0,
            speechVolume: 1.0,
            audioDescriptionLevel: 'detailed', // brief, detailed, verbose
            keyboardShortcuts: true,
            autoSave: true
        };
    });

    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    // Save preferences to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('tili_accessibility_preferences', JSON.stringify(preferences));
        applyAccessibilitySettings(preferences);
    }, [preferences]);

    // Apply CSS classes and attributes based on preferences
    const applyAccessibilitySettings = (prefs) => {
        const root = document.documentElement;

        // Font size
        root.setAttribute('data-font-size', prefs.fontSize);
        
        // Contrast
        root.setAttribute('data-contrast', prefs.contrast);
        
        // Reduced motion
        if (prefs.reducedMotion) {
            root.style.setProperty('--transition-speed', '0s');
        } else {
            root.style.setProperty('--transition-speed', '0.2s');
        }

        // Focus mode
        root.setAttribute('data-focus-mode', prefs.focusMode ? 'true' : 'false');
    };

    const updatePreference = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Accessibility needs definitions - Ultra-simple language (WCAG-compliant)
    const accessibilityNeedsOptions = [
        {
            id: 'normal',
            label: "I can see, hear, and use my hands normally",
            category: 'none',
            description: 'Standard interaction mode.',
            enables: [],
            sets: { audioFeedback: false, spatialGuidance: false, voiceNavigation: false, voiceInput: false }
        },
        {
            id: 'cant-see',
            label: "I can't see",
            category: 'visual',
            description: 'The app will speak continuously and guide you with voice. You will hear where everything is and what it does.',
            enables: ['descriptiveAudio', 'autoReadContent', 'spatialAudioCues', 'screenReaderOptimized', 'spatialGuidance', 'voiceNavigation'],
            sets: {
                audioFeedback: true,
                fontSize: 'large',
                spatialGuidance: true,
                voiceNavigation: true,
                descriptiveAudio: true,
                autoReadContent: true,
                keyboardNavigation: true,
                keyboardShortcuts: true
            }
        },
        {
            id: 'cant-hear',
            label: "I can't hear",
            category: 'hearing',
            description: 'All feedback will be visual and text-based. No audio dependency.',
            enables: ['visualConfirmations'],
            sets: { audioFeedback: false, visualConfirmations: true, descriptiveAudio: false }
        },
        {
            id: 'cant-speak',
            label: "I can't speak",
            category: 'communication',
            description: 'You can use buttons and keyboard. Voice input is disabled.',
            enables: ['keyboardNavigation', 'visualConfirmations'],
            sets: { voiceInput: false, keyboardNavigation: true, keyboardShortcuts: true, visualConfirmations: true }
        },
        {
            id: 'cant-use-hands',
            label: "I can't use my hands",
            category: 'motor',
            description: 'Voice commands replace all clicks. You can control everything by speaking.',
            enables: ['voiceNavigation', 'voiceInput', 'descriptiveAudio', 'spatialGuidance', 'autoReadContent'],
            sets: {
                audioFeedback: true,
                voiceNavigation: true,
                voiceInput: true,
                spatialGuidance: true,
                descriptiveAudio: true,
                keyboardNavigation: false
            }
        },
        {
            id: 'voice-only',
            label: "I need voice-only interaction",
            category: 'motor',
            description: 'Complete voice control. The app listens continuously and responds to all voice commands.',
            enables: ['voiceNavigation', 'voiceInput', 'descriptiveAudio', 'spatialGuidance', 'autoReadContent'],
            sets: {
                audioFeedback: true,
                voiceNavigation: true,
                voiceInput: true,
                spatialGuidance: true,
                descriptiveAudio: true,
                autoReadContent: true,
                keyboardNavigation: false
            }
        }
    ];

    // Apply accessibility needs to preferences
    const applyAccessibilityNeeds = (needs) => {
        const newPrefs = { ...preferences, accessibilityNeeds: needs };

        // Reset all derived settings
        const resetSettings = {
            voiceNavigation: false,
            voiceInput: false,
            descriptiveAudio: false,
            visualConfirmations: true,
            stepByStepMode: false,
            simplifiedLanguage: false,
            extendedTimeouts: false,
            autoReadContent: false,
            spatialAudioCues: false,
            spatialGuidance: false,
            screenReaderOptimized: false,
            keyboardNavigation: true,
            keyboardShortcuts: false,
            autoSave: false
        };

        Object.assign(newPrefs, resetSettings);

        // Apply settings from each selected need
        needs.forEach(needId => {
            const need = accessibilityNeedsOptions.find(n => n.id === needId);
            if (need) {
                // Enable features
                need.enables.forEach(feature => {
                    newPrefs[feature] = true;
                });

                // Set specific values
                Object.assign(newPrefs, need.sets);
            }
        });

        // Handle conflicts and combinations
        if (needs.includes('cant-hear') && needs.includes('cant-see')) {
            // Deaf-blind: haptic feedback, voice input, visual confirmations
            newPrefs.hapticFeedback = true;
            newPrefs.voiceInput = true;
            newPrefs.visualConfirmations = true;
            newPrefs.descriptiveAudio = true; // For braille display users
            newPrefs.spatialGuidance = true;
        }

        if (needs.includes('cant-hear') && needs.includes('cant-use-hands')) {
            // Deaf + can't use hands: voice input + visual confirmations
            newPrefs.voiceInput = true;
            newPrefs.visualConfirmations = true;
            newPrefs.audioFeedback = false;
            newPrefs.spatialGuidance = true;
        }

        if (needs.includes('cant-see') && needs.includes('cant-speak')) {
            // Blind + can't speak: keyboard navigation + audio guidance
            newPrefs.keyboardNavigation = true;
            newPrefs.keyboardShortcuts = true;
            newPrefs.descriptiveAudio = true;
            newPrefs.spatialGuidance = true;
        }

        setPreferences(newPrefs);
    };

    const speak = (text, options = {}) => {
        const shouldSpeak = preferences.audioFeedback || preferences.descriptiveAudio;
        if (!shouldSpeak) return;

        // Use Web Speech API
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate || preferences.speechRate || 1.0;
            utterance.pitch = options.pitch || preferences.speechPitch || 1.0;
            utterance.volume = options.volume || preferences.speechVolume || 1.0;
            utterance.lang = preferences.language === 'fr' ? 'fr-FR' : 'en-US';

            if (options.onEnd) {
                utterance.onend = options.onEnd;
            }

            window.speechSynthesis.speak(utterance);
        }
    };

    const announceNavigation = (pageName) => {
        if (preferences.descriptiveAudio) {
            speak(`You are now on the ${pageName} page. This page contains your ${pageName.toLowerCase()} information and actions.`);
        } else {
            speak(`Navigating to ${pageName}`);
        }
    };

    const announceAction = (action, context = '') => {
        if (preferences.descriptiveAudio && context) {
            speak(`${action}. ${context}`);
        } else {
            speak(action);
        }
    };

    const describeElement = (element, position = '', purpose = '', result = '') => {
        if (!preferences.descriptiveAudio) {
            speak(element);
            return;
        }

        let description = element;

        if (position) {
            description += `. Located ${position}`;
        }

        if (purpose) {
            description += `. ${purpose}`;
        }

        if (result) {
            description += `. When activated, ${result}`;
        }

        speak(description);
    };

    const announceLocation = (location, context = '') => {
        if (preferences.descriptiveAudio) {
            speak(`You are ${location}. ${context}`);
        }
    };

    // Spatial guidance - describes position and direction
    const provideSpatialGuidance = (element, options = {}) => {
        if (!preferences.spatialGuidance) {
            return;
        }

        const {
            elementName = 'element',
            position = '',
            direction = '',
            purpose = '',
            nextAction = '',
            isFirst = false,
            isLast = false,
            totalCount = 0,
            currentIndex = 0
        } = options;

        let guidance = elementName;

        // Add position information
        if (isFirst) {
            guidance += ', first item';
        } else if (isLast) {
            guidance += ', last item';
        } else if (totalCount > 0 && currentIndex > 0) {
            guidance += `, item ${currentIndex} of ${totalCount}`;
        }

        // Add spatial position
        if (position) {
            guidance += `, located ${position}`;
        }

        // Add direction to reach it
        if (direction) {
            guidance += `. ${direction}`;
        }

        // Add purpose
        if (purpose) {
            guidance += `. ${purpose}`;
        }

        // Add next action
        if (nextAction) {
            guidance += `. ${nextAction}`;
        }

        speak(guidance);
    };

    // Guide user through form fields
    const guideFormField = (fieldName, fieldType, options = {}) => {
        if (!preferences.spatialGuidance) {
            return;
        }

        const {
            isRequired = false,
            currentValue = '',
            placeholder = '',
            nextField = '',
            previousField = '',
            position = ''
        } = options;

        let guidance = `${fieldName} ${fieldType}`;

        if (isRequired) {
            guidance += ', required';
        }

        if (position) {
            guidance += `, ${position}`;
        }

        if (currentValue) {
            guidance += `. Current value: ${currentValue}`;
        } else if (placeholder) {
            guidance += `. ${placeholder}`;
        }

        if (nextField) {
            guidance += `. Press Tab to move down to ${nextField}`;
        }

        if (previousField) {
            guidance += `. Press Shift Tab to move up to ${previousField}`;
        }

        speak(guidance);
    };

    // Guide user to buttons with spatial directions
    const guideToButton = (buttonName, options = {}) => {
        if (!preferences.spatialGuidance) {
            return;
        }

        const {
            direction = '',
            position = '',
            action = '',
            warning = ''
        } = options;

        let guidance = `${buttonName} button`;

        if (position) {
            guidance += `, ${position}`;
        }

        if (direction) {
            guidance += `. ${direction}`;
        }

        if (action) {
            guidance += `. Pressing this will ${action}`;
        }

        if (warning) {
            guidance += `. Warning: ${warning}`;
        }

        speak(guidance);
    };

    // Announce page structure on load
    const announcePageStructure = (pageName, structure = {}) => {
        if (!preferences.spatialGuidance) {
            return;
        }

        const {
            mainContent = '',
            topActions = [],
            bottomActions = [],
            sidebarItems = [],
            totalElements = 0
        } = structure;

        let announcement = `${pageName} page loaded. `;

        if (mainContent) {
            announcement += `Main content: ${mainContent}. `;
        }

        if (topActions.length > 0) {
            announcement += `At the top: ${topActions.join(', ')}. `;
        }

        if (sidebarItems.length > 0) {
            announcement += `On the left sidebar: ${sidebarItems.join(', ')}. `;
        }

        if (bottomActions.length > 0) {
            announcement += `At the bottom: ${bottomActions.join(', ')}. `;
        }

        if (totalElements > 0) {
            announcement += `Total interactive elements: ${totalElements}. `;
        }

        announcement += 'Press Tab to navigate through elements.';

        speak(announcement, { rate: 0.9 });
    };

    // Continuous context awareness - announces current location and available actions
    const announceContext = (pageName, options = {}) => {
        if (!preferences.spatialGuidance && !preferences.descriptiveAudio) {
            return;
        }

        const {
            itemCount = 0,
            itemType = 'items',
            availableActions = [],
            currentItem = '',
            navigationHint = ''
        } = options;

        let contextMessage = `You are in ${pageName}. `;

        if (currentItem) {
            contextMessage += `Currently viewing: ${currentItem}. `;
        }

        if (itemCount > 0) {
            contextMessage += `There ${itemCount === 1 ? 'is' : 'are'} ${itemCount} ${itemType}. `;
        } else {
            contextMessage += `No ${itemType} yet. `;
        }

        if (availableActions.length > 0) {
            contextMessage += `You can: ${availableActions.join(', ')}. `;
        }

        if (navigationHint) {
            contextMessage += navigationHint;
        } else {
            contextMessage += 'Say a section name to navigate, or say "help" for commands.';
        }

        speak(contextMessage, { rate: 0.9 });
    };

    const toggleAssistant = () => {
        setIsAssistantOpen(prev => !prev);
    };

    // Live region announcements for screen readers
    const [liveRegionMessage, setLiveRegionMessage] = useState('');
    const liveRegionRef = useRef(null);

    const announceLive = (message, priority = 'polite') => {
        setLiveRegionMessage(message);

        // Also speak if audio is enabled
        if (preferences.audioFeedback || preferences.descriptiveAudio) {
            speak(message);
        }

        // Clear after announcement
        setTimeout(() => setLiveRegionMessage(''), 100);
    };

    // Enhanced voice command handling with validation and corrective feedback
    const handleVoiceCommand = (command, currentLocation = '') => {
        const lowerCommand = command.toLowerCase().trim();

        // Define valid navigation targets with their positions
        const navigationTargets = {
            'dashboard': { position: 'at the top of the sidebar', direction: 'first item' },
            'projects': { position: 'in the sidebar', direction: 'second item, below Dashboard' },
            'documents': { position: 'in the sidebar', direction: 'third item, below Projects' },
            'meetings': { position: 'in the sidebar', direction: 'fourth item, below Documents' },
            'settings': { position: 'at the bottom of the sidebar', direction: 'last item' },
            'logout': { position: 'at the bottom left', direction: 'below Settings' }
        };

        // Navigation commands
        if (lowerCommand.includes('go to') || lowerCommand.includes('navigate to') || lowerCommand.includes('open')) {
            const targetPage = Object.keys(navigationTargets).find(p => lowerCommand.includes(p));

            if (targetPage) {
                announceLive(`Navigating to ${targetPage}`);
                return { action: 'navigate', target: targetPage, valid: true };
            } else {
                // Invalid navigation target - provide corrective feedback
                const attemptedTarget = lowerCommand.replace(/go to|navigate to|open/g, '').trim();
                speak(`I didn't understand "${attemptedTarget}". Available sections are: Dashboard, Projects, Documents, Meetings, and Settings. Please say "go to" followed by one of these names.`);
                return { action: 'error', message: 'Invalid navigation target', valid: false };
            }
        }

        // Direct section names (shortcut commands)
        const directTarget = Object.keys(navigationTargets).find(p => lowerCommand === p);
        if (directTarget) {
            announceLive(`Navigating to ${directTarget}`);
            return { action: 'navigate', target: directTarget, valid: true };
        }

        // Action commands
        if (lowerCommand.includes('click') || lowerCommand.includes('activate') || lowerCommand.includes('press')) {
            const focused = document.activeElement;
            if (focused && focused.tagName !== 'BODY') {
                const elementName = focused.getAttribute('aria-label') || focused.textContent || 'element';
                announceLive(`Activating ${elementName}`);
                return { action: 'activate', valid: true };
            } else {
                speak('No element is currently focused. Say "next" to move to the next element, or say a section name to navigate.');
                return { action: 'error', message: 'No focused element', valid: false };
            }
        }

        if (lowerCommand.includes('next') || lowerCommand.includes('forward')) {
            announceLive('Moving to next element');
            return { action: 'next', valid: true };
        }

        if (lowerCommand.includes('previous') || lowerCommand.includes('back')) {
            announceLive('Moving to previous element');
            return { action: 'previous', valid: true };
        }

        // Context awareness commands
        if (lowerCommand.includes('where am i') || lowerCommand.includes('where') || lowerCommand.includes('location')) {
            return { action: 'announce-location', valid: true };
        }

        if (lowerCommand.includes('what can i do') || lowerCommand.includes('help') || lowerCommand.includes('commands')) {
            const helpMessage = `You can say: "Dashboard", "Projects", "Documents", "Meetings", or "Settings" to navigate. Say "next" or "previous" to move between elements. Say "click" to activate the focused element. Say "where am I" to hear your current location. Say "logout" to end your session.`;
            speak(helpMessage);
            return { action: 'help', valid: true };
        }

        if (lowerCommand.includes('read') || lowerCommand.includes('describe')) {
            return { action: 'read', valid: true };
        }

        if (lowerCommand.includes('logout') || lowerCommand.includes('sign out') || lowerCommand.includes('exit')) {
            speak('Logout button is at the bottom left of the sidebar. Activating it will end your session. Say "confirm logout" to proceed.');
            return { action: 'logout-confirm', valid: true };
        }

        if (lowerCommand.includes('confirm logout')) {
            announceLive('Logging out. Your session will end.');
            return { action: 'logout', valid: true };
        }

        // Command not recognized - provide helpful feedback
        speak(`I didn't understand "${command}". Say "help" to hear available commands, or say a section name like "Dashboard" or "Projects" to navigate.`);
        return { action: 'error', message: 'Command not recognized', valid: false };
    };

    const value = {
        preferences,
        updatePreference,
        speak,
        announceNavigation,
        announceAction,
        describeElement,
        announceLocation,
        announceLive,
        announceContext,
        provideSpatialGuidance,
        guideFormField,
        guideToButton,
        announcePageStructure,
        isAssistantOpen,
        toggleAssistant,
        accessibilityNeedsOptions,
        applyAccessibilityNeeds,
        handleVoiceCommand,
        liveRegionMessage
    };

    return (
        <AccessibilityContext.Provider value={value}>
            {/* Live region for screen reader announcements */}
            <div
                ref={liveRegionRef}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {liveRegionMessage}
            </div>

            {/* Assertive live region for urgent announcements */}
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
            />

            {children}
        </AccessibilityContext.Provider>
    );
};

