'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Mail, Lock, ShieldCheck, ArrowLeft, TrendingUp
} from 'lucide-react';
import s from './admin-login.module.css';

import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Debug tool for owner to test mailer
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isDebug = searchParams?.get('debug') === '1';
    const [testResult, setTestResult] = useState('');

    const runMailTest = async () => {
        setTestResult('Sending...');
        try {
            const res = await fetch('/api/debug/test-mail?secret=jaswanth-secret-123');
            const data = await res.json();
            setTestResult(data.success ? 'Success! Check your inbox.' : `Failed: ${data.error}`);
        } catch (e) {
            setTestResult('Error: API not responding');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: email.toLowerCase().trim(),
                password,
                role: 'admin'
            });

            if (result?.error) {
                setError('Invalid admin credentials.');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError('An error occurred during sign in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.loginContainer}>
            <div className={s.loginWrapper}>
                {/* Left Section: Branding & Graphics (Consistent with User Login) */}
                <div className={s.brandSection}>
                    <div className={s.dotsGrid}>
                        {[...Array(25)].map((_, i) => <div key={i} className={s.dot} />)}
                    </div>
                    <div className={s.pillShape} />
                    <div className={s.circleLarge} />
                    <div className={s.circleSmall}>
                        <div className={s.circleSmallInner} />
                    </div>

                    <div className={s.floatingDot} style={{ top: '20%', left: '10%', background: '#ff6b6b' }} />
                    <div className={s.floatingDot} style={{ bottom: '15%', right: '15%', background: '#ff9f43' }} />

                    <div className={s.contentBox}>
                        <h1 className={s.brandTitle}>
                            ADMIN <br /> PORTAL
                        </h1>
                        <p className={s.brandSubtitle}>
                            Secure access to the StockTrack engine. authorized personnel only.
                        </p>
                    </div>
                </div>

                {/* Right Section: Auth Form (Matches Image) */}
                <div className={s.formSection}>
                    <button
                        onClick={() => router.push('/login')}
                        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className={s.logoWrapper}>
                        <div className={s.appLogo}>
                            <TrendingUp size={32} color="#d93025" strokeWidth={3} />
                        </div>
                        <h2 className={s.welcomeText}>Admin Login</h2>
                    </div>

                    <form onSubmit={handleLogin} className={s.form}>
                        <div className={s.inputGroup}>
                            <label className={s.label}>Admin Email</label>
                            <div className={s.inputWrapper}>
                                <Mail size={18} className={s.inputIcon} />
                                <input
                                    type="email"
                                    className={s.input}
                                    placeholder="admin@stocktrack.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={s.inputGroup}>
                            <label className={s.label}>Password</label>
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

                        <div className={s.formOptions}>
                            <label className={s.checkboxLabel}>
                                <input type="checkbox" style={{ accentColor: '#d93025' }} />
                                Remember me
                            </label>
                            <a href="#" className={s.forgotLink}>Reset Password!</a>
                        </div>

                        {error && <p className={s.error}>{error}</p>}

                        <button type="submit" className={s.primaryButton} disabled={loading}>
                            {loading ? 'Processing...' : 'Verify Credentials'}
                        </button>
                    </form>

                        {/* Debug tool */}
                        {isDebug && (
                            <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 10px 10px 0' }}>Mailer Diagnostic Tool</p>
                                <button
                                    onClick={runMailTest}
                                    style={{ width: '100%', padding: '8px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                >
                                    {testResult || 'Send Test Email to Owner'}
                                </button>
                            </div>
                        )}

                        <div className={s.adminSection}>
                            <button
                                type="button"
                                className={s.adminButton}
                                onClick={() => router.push('/register')}
                            >
                                Create Account
                            </button>
                        </div>
                </div>
            </div>
        </div>
    );
}
