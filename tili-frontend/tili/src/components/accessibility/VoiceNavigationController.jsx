import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import styles from './VoiceNavigationController.module.css';

const VoiceNavigationController = ({ onNavigate }) => {
    const { preferences, handleVoiceCommand, speak, announceLive } = useAccessibility();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!preferences.voiceNavigation && !preferences.voiceInput) {
            return;
        }

        // Initialize Web Speech Recognition API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            // Continuous listening for no-click-required mode
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = preferences.language === 'fr' ? 'fr-FR' : 'en-US';
            recognitionRef.current.maxAlternatives = 1;

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);

                // Process final results
                if (event.results[current].isFinal) {
                    // Get current page from URL or data attribute
                    const currentPage = window.location.pathname.split('/').pop() || 'dashboard';
                    const command = handleVoiceCommand(transcriptText, currentPage);

                    if (command && command.valid) {
                        if (command.action === 'navigate' && command.target) {
                            // Find the navigation button and validate it exists
                            const navButton = document.querySelector(`[data-voice-command="${command.target}"]`);
                            if (navButton) {
                                onNavigate(command.target);
                            } else {
                                speak(`${command.target} is not available. Please say "help" to hear available sections.`);
                            }
                        } else if (command.action === 'activate') {
                            // Trigger click on focused element
                            const focused = document.activeElement;
                            if (focused && focused.click) {
                                focused.click();
                            }
                        } else if (command.action === 'next') {
                            // Move focus to next focusable element
                            const focusable = Array.from(document.querySelectorAll(
                                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                            ));
                            const currentIndex = focusable.indexOf(document.activeElement);
                            if (currentIndex < focusable.length - 1) {
                                focusable[currentIndex + 1].focus();
                            } else {
                                speak('You are at the last element on this page.');
                            }
                        } else if (command.action === 'previous') {
                            // Move focus to previous focusable element
                            const focusable = Array.from(document.querySelectorAll(
                                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                            ));
                            const currentIndex = focusable.indexOf(document.activeElement);
                            if (currentIndex > 0) {
                                focusable[currentIndex - 1].focus();
                            } else {
                                speak('You are at the first element on this page.');
                            }
                        } else if (command.action === 'read') {
                            const mainContent = document.querySelector('main') || document.body;
                            speak(mainContent.innerText.substring(0, 500));
                        } else if (command.action === 'announce-location') {
                            const pageTitle = document.querySelector('h1, h2')?.textContent || currentPage;
                            speak(`You are on the ${pageTitle} page.`);
                        } else if (command.action === 'logout') {
                            const logoutButton = document.querySelector('[data-voice-command="logout"]');
                            if (logoutButton) {
                                logoutButton.click();
                            }
                        }
                    }
                    // If command is invalid, handleVoiceCommand already provided feedback

                    setTranscript('');
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    announceLive('No speech detected. Please try again.');
                } else if (event.error === 'not-allowed') {
                    announceLive('Microphone access denied. Please enable microphone permissions.');
                }
            };

            recognitionRef.current.onend = () => {
                // Auto-restart for continuous listening (no-click-required mode)
                if (isListening && preferences.voiceNavigation) {
                    try {
                        setTimeout(() => {
                            if (recognitionRef.current && isListening) {
                                recognitionRef.current.start();
                            }
                        }, 100);
                    } catch (error) {
                        console.error('Failed to restart voice recognition:', error);
                    }
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (error) {
                    // Ignore errors on cleanup
                }
            }
        };
    }, [preferences.voiceNavigation, preferences.voiceInput, preferences.language]);

    useEffect(() => {
        // Auto-start voice navigation when enabled (continuous listening)
        if (preferences.voiceNavigation && recognitionRef.current) {
            startListening();
        } else {
            stopListening();
        }
    }, [preferences.voiceNavigation]);

    // Announce context on page changes
    useEffect(() => {
        if (preferences.voiceNavigation && isListening) {
            // Small delay to allow page to render
            setTimeout(() => {
                const pageTitle = document.querySelector('h1, h2')?.textContent || 'page';
                speak(`You are now on the ${pageTitle} page. Say "help" to hear available commands.`);
            }, 500);
        }
    }, [window.location.pathname]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);

                // Announce continuous listening mode
                const message = preferences.voiceInput
                    ? 'Voice navigation activated. The app is listening continuously. Say section names like "Dashboard" or "Projects" to navigate. Say "help" for all commands.'
                    : 'Voice navigation activated. Say commands like "go to dashboard" or "click" to interact.';

                announceLive(message);
            } catch (error) {
                console.error('Failed to start voice recognition:', error);
                announceLive('Failed to start voice navigation. Please check microphone permissions.');
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            announceLive('Voice navigation deactivated');
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!preferences.voiceNavigation && !preferences.voiceInput) {
        return null;
    }

    return (
        <div className={styles.voiceController} role="status" aria-live="polite">
            <button
                className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
                onClick={toggleListening}
                onFocus={() => speak(isListening ? 'Voice navigation is active. Click to deactivate.' : 'Voice navigation is inactive. Click to activate.')}
                aria-label={isListening ? 'Voice navigation active. Click to deactivate' : 'Voice navigation inactive. Click to activate'}
                aria-pressed={isListening}
            >
                {isListening ? <Mic size={20} aria-hidden="true" /> : <MicOff size={20} aria-hidden="true" />}
                <span className={styles.status}>
                    {isListening ? 'Listening...' : 'Voice Off'}
                </span>
            </button>
            
            {transcript && (
                <div className={styles.transcript} aria-live="polite">
                    {transcript}
                </div>
            )}
        </div>
    );
};

export default VoiceNavigationController;

