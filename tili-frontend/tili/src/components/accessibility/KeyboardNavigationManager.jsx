import { useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';

const KeyboardNavigationManager = ({ onNavigate }) => {
    const { preferences, speak, describeElement, announceLive } = useAccessibility();

    useEffect(() => {
        if (!preferences.keyboardNavigation && !preferences.keyboardShortcuts) {
            return;
        }

        const handleKeyDown = (e) => {
            // Skip if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            // Global keyboard shortcuts (Alt + key)
            if (preferences.keyboardShortcuts && e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'd':
                        e.preventDefault();
                        onNavigate('dashboard');
                        announceLive('Navigating to Dashboard');
                        break;
                    case 'p':
                        e.preventDefault();
                        onNavigate('projects');
                        announceLive('Navigating to Projects');
                        break;
                    case 'o':
                        e.preventDefault();
                        onNavigate('documents');
                        announceLive('Navigating to Documents');
                        break;
                    case 'm':
                        e.preventDefault();
                        onNavigate('meetings');
                        announceLive('Navigating to Meetings');
                        break;
                    case 's':
                        e.preventDefault();
                        onNavigate('settings');
                        announceLive('Navigating to Settings');
                        break;
                    case 'h':
                        e.preventDefault();
                        showKeyboardHelp();
                        break;
                    default:
                        break;
                }
            }

            // Question mark for help
            if (e.key === '?' && !e.shiftKey) {
                e.preventDefault();
                showKeyboardHelp();
            }

            // Escape to close modals/dialogs
            if (e.key === 'Escape') {
                const openDialog = document.querySelector('[role="dialog"][aria-modal="true"]');
                if (openDialog) {
                    const closeButton = openDialog.querySelector('[aria-label*="Close"], [aria-label*="close"]');
                    if (closeButton) {
                        closeButton.click();
                        announceLive('Dialog closed');
                    }
                }
            }

            // Tab navigation enhancement
            if (e.key === 'Tab') {
                // Announce focused element after a short delay
                setTimeout(() => {
                    const focused = document.activeElement;
                    if (focused && preferences.descriptiveAudio) {
                        const label = focused.getAttribute('aria-label') || 
                                    focused.textContent?.trim() || 
                                    focused.getAttribute('title') || 
                                    focused.tagName.toLowerCase();
                        
                        const role = focused.getAttribute('role') || focused.tagName.toLowerCase();
                        const description = focused.getAttribute('aria-describedby');
                        
                        if (description) {
                            const descElement = document.getElementById(description);
                            if (descElement) {
                                speak(`${label}. ${descElement.textContent}`);
                                return;
                            }
                        }
                        
                        speak(`${label}, ${role}`);
                    }
                }, 100);
            }
        };

        const showKeyboardHelp = () => {
            const helpText = `
                Keyboard shortcuts:
                Alt + D for Dashboard,
                Alt + P for Projects,
                Alt + O for Documents,
                Alt + M for Meetings,
                Alt + S for Settings,
                Alt + H for Help,
                Tab to navigate,
                Enter to activate,
                Escape to close dialogs,
                Question mark for this help.
            `;
            speak(helpText);
            announceLive('Keyboard shortcuts help displayed');
        };

        // Focus visible indicator enhancement
        const handleFocusIn = (e) => {
            if (preferences.keyboardNavigation) {
                // Add visual focus indicator
                e.target.setAttribute('data-keyboard-focus', 'true');
            }
        };

        const handleFocusOut = (e) => {
            e.target.removeAttribute('data-keyboard-focus');
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);

        // Announce keyboard navigation is active
        if (preferences.keyboardShortcuts) {
            setTimeout(() => {
                announceLive('Keyboard shortcuts are enabled. Press Alt + H for help.');
            }, 1000);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, [preferences.keyboardNavigation, preferences.keyboardShortcuts, preferences.descriptiveAudio, onNavigate]);

    // Skip to main content link
    useEffect(() => {
        const skipLink = document.getElementById('skip-to-main');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const main = document.querySelector('main');
                if (main) {
                    main.setAttribute('tabindex', '-1');
                    main.focus();
                    announceLive('Skipped to main content');
                }
            });
        }
    }, []);

    return null; // This is a logic-only component
};

export default KeyboardNavigationManager;

