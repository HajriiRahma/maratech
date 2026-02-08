import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { authService } from '../utils/auth';
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('CONSULTANT');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setEmail('');
        setPassword('');
        setName('');
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

            onLogin(user);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                <div className={styles.header}>
                    <h1 className={styles.logo}>TILI</h1>
                    <p className={styles.subtitle}>Internal Management Platform</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    {isRegistering && (
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                                className={styles.input}
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className={styles.input}
                        />
                    </div>

                    {isRegistering && (
                        <div className={styles.formGroup}>
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className={styles.select}
                            >
                                <option value="CONSULTANT">Consultant</option>
                                <option value="CHEF_PROJET">Chef (Project Leader)</option>
                                <option value="RESPONSABLE">Responsable (Manager)</option>
                            </select>
                        </div>
                    )}



                    <Button
                        type="submit"
                        className={styles.submitButton}
                        isLoading={isLoading}
                        size="lg"
                    >
                        {isRegistering ? 'Sign Up' : 'Sign In'}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p className={styles.toggleText}>
                        {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}
                        <button type="button" onClick={toggleMode} className={styles.toggleBtn}>
                            {isRegistering ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </Card >
        </div >
    );
};

export default Login;
