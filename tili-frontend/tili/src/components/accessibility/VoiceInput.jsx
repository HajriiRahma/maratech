import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import styles from './VoiceInput.module.css';

/**
 * VoiceInput Component
 * Provides speech-to-text input for form fields with confirmation read-back
 * Used for users who cannot type (motor disabilities)
 */
const VoiceInput = ({ 
    value, 
    onChange, 
    placeholder = '', 
    label = '',
    type = 'text',
    disabled = false,
    required = false,
    ariaLabel = ''
}) => {
    const { preferences, speak, announceLive } = useAccessibility();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [pendingValue, setPendingValue] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const recognitionRef = useRef(null);

    // Only show voice input if voiceInput is enabled
    const shouldShowVoiceInput = preferences.voiceInput && !disabled;

    useEffect(() => {
        if (!shouldShowVoiceInput) return;

        // Initialize Web Speech Recognition API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = preferences.language === 'fr' ? 'fr-FR' : 'en-US';

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);

                // Process final results
                if (event.results[current].isFinal) {
                    setPendingValue(transcriptText);
                    setShowConfirmation(true);
                    setIsListening(false);
                    
                    // Read back what was heard
                    speak(`You said: ${transcriptText}. Say "confirm" to accept, or "repeat" to try again.`);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                if (event.error === 'no-speech') {
                    announceLive('No speech detected. Please try again.');
                } else if (event.error === 'not-allowed') {
                    announceLive('Microphone access denied. Please enable microphone permissions.');
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [shouldShowVoiceInput, preferences.language]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                setTranscript('');
                setPendingValue('');
                setShowConfirmation(false);
                recognitionRef.current.start();
                setIsListening(true);
                speak(`Listening for ${label || placeholder}. Speak now.`);
            } catch (error) {
                console.error('Failed to start voice recognition:', error);
                announceLive('Failed to start voice input. Please try again.');
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const handleConfirm = () => {
        onChange({ target: { value: pendingValue } });
        setShowConfirmation(false);
        setTranscript('');
        setPendingValue('');
        speak(`${label || placeholder} set to: ${pendingValue}`);
    };

    const handleRepeat = () => {
        setShowConfirmation(false);
        setTranscript('');
        setPendingValue('');
        startListening();
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setTranscript('');
        setPendingValue('');
        speak('Input cancelled');
    };

    if (!shouldShowVoiceInput) {
        // Fallback to regular input
        return (
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                aria-label={ariaLabel || label}
                className={styles.regularInput}
            />
        );
    }

    return (
        <div className={styles.voiceInputContainer}>
            <div className={styles.inputWrapper}>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    aria-label={ariaLabel || label}
                    className={styles.input}
                />
                <button
                    type="button"
                    className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
                    onClick={isListening ? stopListening : startListening}
                    onFocus={() => speak(`Voice input button for ${label || placeholder}. ${isListening ? 'Currently listening. Click to stop.' : 'Click to start voice input.'}`)}
                    aria-label={`Voice input for ${label || placeholder}. ${isListening ? 'Stop listening' : 'Start listening'}`}
                    aria-pressed={isListening}
                >
                    {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
            </div>

            {isListening && transcript && (
                <div className={styles.transcript} aria-live="polite">
                    {transcript}
                </div>
            )}

            {showConfirmation && (
                <div className={styles.confirmation} role="alert" aria-live="assertive">
                    <p className={styles.confirmText}>You said: "{pendingValue}"</p>
                    <div className={styles.confirmButtons}>
                        <button
                            type="button"
                            className={styles.confirmButton}
                            onClick={handleConfirm}
                            onFocus={() => speak('Confirm button. Accept this input.')}
                            aria-label="Confirm input"
                        >
                            <Check size={16} /> Confirm
                        </button>
                        <button
                            type="button"
                            className={styles.repeatButton}
                            onClick={handleRepeat}
                            onFocus={() => speak('Repeat button. Try voice input again.')}
                            aria-label="Repeat voice input"
                        >
                            <Mic size={16} /> Repeat
                        </button>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={handleCancel}
                            onFocus={() => speak('Cancel button. Discard this input.')}
                            aria-label="Cancel input"
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceInput;

