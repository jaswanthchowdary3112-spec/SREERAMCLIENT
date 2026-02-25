'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
    Mail, Lock, User, TrendingUp, ArrowLeft
} from 'lucide-react';
import s from './register.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim() || email.split('@')[0],
                    email: email.toLowerCase().trim(),
                    password
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Registration failed');
                setLoading(false);
                return;
            }

            // Successful registration, perform auto-login
            const loginRes = await signIn('credentials', {
                email: email.toLowerCase().trim(),
                password,
                redirect: false,
            });

            if (loginRes?.error) {
                setError('Account created, but login failed. Please login manually.');
                router.push('/admin-login');
            } else {
                router.push('/portfolio');
                router.refresh();
            }
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.loginContainer}>
            <div className={s.loginWrapper}>
                {/* Registration Form */}
                <div className={s.formSection}>
                    <button
                        onClick={() => router.push('/admin-login')}
                        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className={s.logoWrapper}>
                        <div className={s.appLogo}>
                            <TrendingUp size={32} color="#d93025" strokeWidth={3} />
                        </div>
                        <h2 className={s.welcomeText}>Create Account</h2>
                    </div>

                    <form onSubmit={handleRegister}>
                        <div className={s.inputGroup}>
                            <label className={s.label}>Full Name</label>
                            <div className={s.inputWrapper}>
                                <User size={18} className={s.inputIcon} />
                                <input
                                    type="text"
                                    className={s.input}
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={s.inputGroup}>
                            <label className={s.label}>User Email</label>
                            <div className={s.inputWrapper}>
                                <Mail size={18} className={s.inputIcon} />
                                <input
                                    type="email"
                                    className={s.input}
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={s.inputGroup}>
                            <label className={s.label}>New Password</label>
                            <div className={s.inputWrapper}>
                                <Lock size={18} className={s.inputIcon} />
                                <input
                                    type="password"
                                    className={s.input}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={s.inputGroup}>
                            <label className={s.label}>Confirm Password</label>
                            <div className={s.inputWrapper}>
                                <Lock size={18} className={s.inputIcon} />
                                <input
                                    type="password"
                                    className={s.input}
                                    placeholder="Repeat password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className={s.error}>{error}</p>}

                        <button type="submit" className={s.primaryButton} disabled={loading}>
                            {loading ? 'Processing...' : 'Create Account'}
                        </button>
                    </form>

                    <div className={s.loginSection}>
                        <button
                            type="button"
                            className={s.loginButton}
                            onClick={() => router.push('/admin-login')}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
