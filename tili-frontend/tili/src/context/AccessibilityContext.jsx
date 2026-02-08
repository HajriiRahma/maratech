import React, { createContext, useContext, useState, useEffect } from 'react';

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
            fontSize: 'medium', // small, medium, large, xlarge
            contrast: 'normal', // normal, high
            audioFeedback: false,
            focusMode: false,
            reducedMotion: false,
            keyboardNavigation: true,
            screenReaderOptimized: false,
            language: 'en',
            showWelcome: true
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

    const speak = (text) => {
        if (!preferences.audioFeedback) return;
        
        // Use Web Speech API
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utterance.lang = preferences.language === 'fr' ? 'fr-FR' : 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    const announceNavigation = (pageName) => {
        speak(`Navigating to ${pageName}`);
    };

    const announceAction = (action) => {
        speak(action);
    };

    const toggleAssistant = () => {
        setIsAssistantOpen(prev => !prev);
    };

    const value = {
        preferences,
        updatePreference,
        speak,
        announceNavigation,
        announceAction,
        isAssistantOpen,
        toggleAssistant
    };

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
};

