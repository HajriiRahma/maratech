import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import VoiceInput from '../components/accessibility/VoiceInput';
import { authService } from '../utils/auth';
import { useAccessibility } from '../context/AccessibilityContext';
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
    const {
        preferences,
        speak,
        announcePageStructure,
        guideFormField,
        guideToButton,
        announceLive
    } = useAccessibility();

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('CONSULTANT');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Announce page structure and context on load
    useEffect(() => {
        const structure = {
            mainContent: isRegistering ? 'Sign up form' : 'Sign in form',
            topActions: ['TILI logo'],
            bottomActions: [isRegistering ? 'Switch to Sign In' : 'Switch to Sign Up'],
            totalElements: isRegistering ? 6 : 4
        };

        announcePageStructure(isRegistering ? 'Sign Up' : 'Sign In', structure);

        // Continuous context awareness - announce what to do
        setTimeout(() => {
            if (preferences.spatialGuidance || preferences.descriptiveAudio) {
                if (isRegistering) {
                    speak('You are on the Sign Up page. To create an account, you need to enter your name, email, password, and select your role. The first field is Name, at the top of the form. Say "help" for voice commands.');
                } else {
                    speak('You are on the Sign In page. To sign in, you need to enter your email and password. The first field is Email, at the top of the form. Say "help" for voice commands.');
                }
            }
        }, 1500);
    }, [isRegistering]);

    const toggleMode = () => {
        const newMode = !isRegistering;
        setIsRegistering(newMode);
        setError('');
        setEmail('');
        setPassword('');
        setName('');

        // Announce mode change
        if (preferences.spatialGuidance) {
            speak(newMode ?
                'Switched to Sign Up mode. You will need to enter your name, email, password, and role.' :
                'Switched to Sign In mode. You will need to enter your email and password.'
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let user;
            if (isRegistering) {
                if (!email || !password || !name) {
                    throw new Error('All fields are required');
                }
                user = await authService.register(name, email, password, role);
            } else {
                user = await authService.login(email, password);
                if (!user) {
                    throw new Error('Invalid email or password');
                }
            }

            // Announce success
            if (preferences.spatialGuidance) {
                speak(isRegistering ?
                    'Account created successfully. Signing you in now.' :
                    'Signed in successfully. Loading your dashboard.'
                );
            }

            onLogin(user);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);

            // Announce error with spatial context
            if (preferences.spatialGuidance) {
                speak(`Error: ${err.message}. The error message is displayed at the top of the form. Please check your information and try again.`);
            }
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                <div className={styles.header}>
                    <h1 className={styles.logo}>TILI</h1>
                    <p className={styles.subtitle}>Internal Management Platform</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form} aria-label={isRegistering ? 'Sign up form' : 'Sign in form'}>
                    {error && (
                        <div
                            className={styles.error}
                            role="alert"
                            aria-live="assertive"
                            aria-atomic="true"
                        >
                            {error}
                        </div>
                    )}

                    {isRegistering && (
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <VoiceInput
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                label="Full Name"
                                type="text"
                                required
                                ariaLabel="Full Name. First field. Enter your full name. Press Tab to move to Email Address."
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <VoiceInput
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            label="Email Address"
                            type="email"
                            required
                            ariaLabel={`Email Address. ${isRegistering ? 'Second field.' : 'First field.'} Enter your email address. Press Tab to move to Password.`}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <VoiceInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            label="Password"
                            type="password"
                            required
                            ariaLabel={`Password. ${isRegistering ? 'Third field.' : 'Second field.'} Enter your password. Press Tab to move to ${isRegistering ? 'Role' : 'Sign In button'}.`}
                        />
                    </div>

                    {isRegistering && (
                        <div className={styles.formGroup}>
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                onFocus={() => guideFormField('Role', 'dropdown menu', {
                                    isRequired: false,
                                    currentValue: role,
                                    position: 'fourth field',
                                    previousField: 'Password',
                                    nextField: 'Sign Up button'
                                })}
                                className={styles.select}
                                aria-describedby="role-help"
                            >
                                <option value="CONSULTANT">Consultant</option>
                                <option value="CHEF_PROJET">Chef (Project Leader)</option>
                                <option value="RESPONSABLE">Responsable (Manager)</option>
                            </select>
                            <span id="role-help" className="sr-only">
                                Fourth field. Select your role. Use arrow keys to choose. Press Tab to move to Sign Up button.
                            </span>
                        </div>
                    )}



                    <Button
                        type="submit"
                        className={styles.submitButton}
                        isLoading={isLoading}
                        size="lg"
                        onFocus={() => guideToButton(
                            isRegistering ? 'Sign Up' : 'Sign In',
                            {
                                position: 'at the bottom of the form',
                                direction: 'Press Enter or Space to activate',
                                action: isRegistering ? 'create your account and sign you in' : 'sign you into the platform',
                                warning: isLoading ? 'Please wait, processing your request' : ''
                            }
                        )}
                        aria-describedby="submit-help"
                    >
                        {isRegistering ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <span id="submit-help" className="sr-only">
                        {isRegistering ? 'Sign Up' : 'Sign In'} button at the bottom of the form. Press Enter or Space to {isRegistering ? 'create your account' : 'sign in'}.
                    </span>
                </form>

                <div className={styles.footer}>
                    <p className={styles.toggleText}>
                        {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}
                        <button
                            type="button"
                            onClick={toggleMode}
                            onFocus={() => guideToButton(
                                isRegistering ? 'Switch to Sign In' : 'Switch to Sign Up',
                                {
                                    position: 'at the bottom of the page',
                                    direction: 'Press Enter or Space to activate',
                                    action: isRegistering ? 'switch to sign in mode' : 'switch to sign up mode'
                                }
                            )}
                            className={styles.toggleBtn}
                            aria-describedby="toggle-help"
                        >
                            {isRegistering ? 'Sign In' : 'Sign Up'}
                        </button>
                        <span id="toggle-help" className="sr-only">
                            Switch to {isRegistering ? 'Sign In' : 'Sign Up'} mode. Located at the bottom of the page.
                        </span>
                    </p>
                </div>
            </Card >
        </div >
    );
};

export default Login;
