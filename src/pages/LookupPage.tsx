import { useState } from 'react';
import { Search } from 'lucide-react';
import { lookupUser, api } from '../lib/api';
import type { User } from '../models';

export default function LookupPage() {
    const [userId, setUserId] = useState('');
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null); // Changed to any to store full error info

    // Override State
    const [overrideVal, setOverrideVal] = useState('');
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [updatingLimit, setUpdatingLimit] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e?.preventDefault();
        if (!userId.trim()) return;

        setLoading(true);
        setError(null);
        setUserData(null);
        setOverrideVal(''); // Reset override input
        setIsUnlimited(false);

        const url = `/admin/${userId}/user`;

        try {
            const user = await lookupUser(userId);
            setUserData(user);
            // Initialize override input with current value if exists
            const currentLimit = user.overrideRequestLimit ?? user.requestLimit;

            if (currentLimit === -1) {
                setIsUnlimited(true);
                setOverrideVal('');
            } else if (currentLimit !== undefined && currentLimit !== null) {
                setOverrideVal(currentLimit.toString());
                setIsUnlimited(false);
            }

        } catch (err: any) {
            console.error(err);
            setError({
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                url: url
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLimit = async () => {
        if (!userData) return;
        setUpdatingLimit(true);
        try {
            let body: number | null = null;
            if (isUnlimited) {
                body = -1;
            } else {
                body = overrideVal === '' ? null : parseInt(overrideVal, 10);
            }

            await api.post(`/admin/${userData.id}/user/override-limit`, body, {
                headers: { 'Content-Type': 'application/json' }
            });
            // Refresh user data
            await handleSearch(null as any);
        } catch (err: any) {
            console.error("Failed to update limit", err);
            alert("Failed to update limit: " + (err.message || "Unknown error"));
        } finally {
            setUpdatingLimit(false);
        }
    };

    const handleRemoveOverride = async () => {
        if (!userData) return;
        setUpdatingLimit(true);
        try {
            await api.post(`/admin/${userData.id}/user/override-limit`, null, {
                headers: { 'Content-Type': 'application/json' }
            });

            // Re-initialize logic will run in handleSearch, but we can optimistically reset here or just refresh
            await handleSearch(null as any);
        } catch (err: any) {
            console.error("Failed to remove override", err);
            alert("Failed to remove override: " + (err.message || "Unknown error"));
        } finally {
            setUpdatingLimit(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title-row">
                    <h1 className="dashboard-title">User Lookup</h1>
                </div>
                <p className="hero-subtext" style={{ margin: 0, textAlign: 'left', maxWidth: '600px' }}>
                    Find a specific user by their Clerk ID to view details and debug issues.
                </p>
            </div>

            <div className="card-surface" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Search by User ID
                    </label>
                    <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--text-primary)' }} />
                            <input
                                type="text"
                                placeholder="e.g. user_2..."
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                style={{
                                    width: '100%',
                                    paddingLeft: '40px',
                                    paddingRight: '12px',
                                    paddingTop: '10px',
                                    paddingBottom: '10px',
                                    backgroundColor: 'var(--bg-input)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-solid"
                            disabled={loading}
                            style={{
                                backgroundColor: 'var(--accent-purple-1)',
                                color: 'white',
                                borderColor: 'var(--accent-purple-1)',
                                padding: '0 1.5rem'
                            }}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="error-message" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                            <div style={{ fontWeight: 600 }}>Error: {error.message}</div>
                            {error.status && <div>Status: {error.status}</div>}
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>URL: {error.url}</div>
                            {error.data && (
                                <details style={{ marginTop: '0.5rem' }}>
                                    <summary style={{ cursor: 'pointer', opacity: 0.8 }}>View Server Response</summary>
                                    <pre style={{
                                        marginTop: '0.5rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '1rem',
                                        borderRadius: '6px',
                                        overflow: 'auto',
                                        fontSize: '0.8rem'
                                    }}>
                                        {JSON.stringify(error.data, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                )}

                {userData && (
                    <div>
                        <div style={{
                            marginBottom: '1.5rem',
                            paddingBottom: '1.5rem',
                            borderBottom: '1px solid var(--border-subtle)'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '0.25rem' }}>
                                {userData.firstName} {userData.lastName}
                            </h2>
                            <div style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{userData.id}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</label>
                                <div style={{ color: 'var(--text-primary)' }}>{userData.emailAddresses?.[0]?.emailAddress || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Full Subscription</label>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: 'var(--badge-bg)',
                                    border: '1px solid var(--badge-border)',
                                    color: 'var(--accent-purple-1)',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    textTransform: 'capitalize'
                                }}>
                                    {userData.currentSubscription || 'Free'}
                                </span>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Requests Usage</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {userData.currentRequestUsage ?? 0}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Request Limit</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {userData.overrideRequestLimit ? (
                                        <span style={{ color: 'var(--accent-purple-1)' }}>
                                            {userData.overrideRequestLimit === -1 ? '∞' : userData.overrideRequestLimit} (Override)
                                        </span>
                                    ) : (
                                        userData.requestLimit === -1 ? '∞' : (userData.requestLimit ?? 'Default')
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Override Limit Section */}
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            backgroundColor: 'var(--bg-input)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-default)'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', marginTop: 0 }}>Request Limit Configuration</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        Limit Value {userData.overrideRequestLimit ? '(Currently Overridden)' : '(Default)'}
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            value={overrideVal}
                                            onChange={(e) => setOverrideVal(e.target.value)}
                                            placeholder={isUnlimited ? "Unlimited" : "Enter limit"}
                                            disabled={isUnlimited}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                backgroundColor: isUnlimited ? 'var(--bg-card)' : 'var(--bg-input-focus)',
                                                border: '1px solid var(--border-default)',
                                                borderRadius: '6px',
                                                color: 'var(--text-primary)',
                                                fontSize: '1rem',
                                                opacity: isUnlimited ? 0.5 : 1
                                            }}
                                        />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                                            <input
                                                type="checkbox"
                                                checked={isUnlimited}
                                                onChange={(e) => {
                                                    setIsUnlimited(e.target.checked);
                                                    if (e.target.checked) setOverrideVal('');
                                                }}
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                            <span style={{ color: 'var(--text-primary)' }}>Unlimited</span>
                                        </label>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Tier Default: {(() => {
                                            const tier = userData.currentSubscription || 'free_user';
                                            const defaults: Record<string, number> = {
                                                'free_user': 3000,
                                                '10k_requests': 10000,
                                                'pro': 25000
                                            };
                                            return defaults[tier] ? `${defaults[tier].toLocaleString()}` : 'Unknown';
                                        })()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {(() => {
                                        const tier = userData.currentSubscription || 'free_user';
                                        const defaults: Record<string, number> = {
                                            'free_user': 3000,
                                            '10k_requests': 10000,
                                            'pro': 25000
                                        };
                                        const defaultLimit = defaults[tier];
                                        const currentLimit = userData.requestLimit;

                                        // Show remove button if there is an explicit override OR if the current limit differs from tier default
                                        // (assuming users only have non-default limits via overrides)
                                        if (userData.overrideRequestLimit || (defaultLimit && currentLimit !== defaultLimit)) {
                                            return (
                                                <button
                                                    className="btn-solid"
                                                    onClick={handleRemoveOverride}
                                                    disabled={updatingLimit}
                                                    style={{
                                                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                                        color: 'var(--color-error)',
                                                        borderColor: 'var(--color-error-border)'
                                                    }}
                                                >
                                                    Remove Override
                                                </button>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <button
                                        className="btn-solid"
                                        onClick={handleSaveLimit}
                                        disabled={updatingLimit}
                                        style={{
                                            backgroundColor: 'var(--accent-purple-1)',
                                            color: '#fff',
                                            borderColor: 'var(--accent-purple-1)'
                                        }}
                                    >
                                        {updatingLimit ? 'Saving...' : 'Set Limit'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <details>
                            <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>View Full Raw Data</summary>
                            <pre style={{
                                marginTop: '1rem',
                                backgroundColor: 'var(--bg-code)',
                                padding: '1rem',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)'
                            }}>
                                {JSON.stringify(userData, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}
