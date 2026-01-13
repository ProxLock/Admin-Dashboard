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
                <p className="lookup-subtext">
                    Find a specific user by their Clerk ID to view details and debug issues.
                </p>
            </div>

            <div className="lookup-card card-surface">
                <form onSubmit={handleSearch} className="lookup-form">
                    <label className="lookup-label">Search by User ID</label>
                    <div className="lookup-search-wrapper">
                        <div className="lookup-search-row">
                            <Search size={18} className="lookup-search-icon" />
                            <input
                                type="text"
                                className="lookup-search-input"
                                placeholder="e.g. user_2..."
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary lookup-search-btn"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="lookup-error">
                        <div className="lookup-error-title">Error: {error.message}</div>
                        {error.status && <div>Status: {error.status}</div>}
                        <div className="lookup-error-url">URL: {error.url}</div>
                        {error.data && (
                            <details className="lookup-error-details">
                                <summary>View Server Response</summary>
                                <pre className="lookup-error-pre">
                                    {JSON.stringify(error.data, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                )}

                {userData && (
                    <div className="lookup-result">
                        <div className="lookup-user-header">
                            <h2 className="lookup-user-name">
                                {userData.firstName} {userData.lastName}
                            </h2>
                            <div className="lookup-user-id">{userData.id}</div>
                        </div>

                        <div className="lookup-stats-grid">
                            <div className="lookup-stat">
                                <label className="lookup-stat-label">Email</label>
                                <div className="lookup-stat-value">{userData.emailAddresses?.[0]?.emailAddress || 'N/A'}</div>
                            </div>
                            <div className="lookup-stat">
                                <label className="lookup-stat-label">Full Subscription</label>
                                <span className="lookup-badge">
                                    {userData.currentSubscription || 'Free'}
                                </span>
                            </div>
                            <div className="lookup-stat">
                                <label className="lookup-stat-label">Requests Usage</label>
                                <div className="lookup-stat-value-lg">{userData.currentRequestUsage ?? 0}</div>
                            </div>
                            <div className="lookup-stat">
                                <label className="lookup-stat-label">Request Limit</label>
                                <div className="lookup-stat-value-lg">
                                    {userData.overrideRequestLimit ? (
                                        <span className="lookup-override">
                                            {userData.overrideRequestLimit === -1 ? '∞' : userData.overrideRequestLimit} (Override)
                                        </span>
                                    ) : (
                                        userData.requestLimit === -1 ? '∞' : (userData.requestLimit ?? 'Default')
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Override Limit Section */}
                        <div className="lookup-config-section">
                            <h3 className="lookup-config-title">Request Limit Configuration</h3>

                            <div className="lookup-config-grid">
                                <div>
                                    <label className="lookup-config-label">
                                        Limit Value {userData.overrideRequestLimit ? '(Currently Overridden)' : '(Default)'}
                                    </label>
                                    <div className="lookup-config-input-row">
                                        <input
                                            type="number"
                                            className={`lookup-config-input ${isUnlimited ? 'disabled' : ''}`}
                                            value={overrideVal}
                                            onChange={(e) => setOverrideVal(e.target.value)}
                                            placeholder={isUnlimited ? "Unlimited" : "Enter limit"}
                                            disabled={isUnlimited}
                                        />
                                        <label className="lookup-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={isUnlimited}
                                                onChange={(e) => {
                                                    setIsUnlimited(e.target.checked);
                                                    if (e.target.checked) setOverrideVal('');
                                                }}
                                            />
                                            <span>Unlimited</span>
                                        </label>
                                    </div>
                                    <div className="lookup-tier-hint">
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
                                <div className="lookup-config-actions">
                                    {userData.overrideRequestLimit && (
                                        <button
                                            className="btn-solid btn-danger"
                                            onClick={handleRemoveOverride}
                                            disabled={updatingLimit}
                                        >
                                            Remove Override
                                        </button>
                                    )}
                                    <button
                                        className="btn-primary"
                                        onClick={handleSaveLimit}
                                        disabled={updatingLimit}
                                    >
                                        {updatingLimit ? 'Saving...' : 'Set Limit'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <details className="lookup-raw-data">
                            <summary>View Full Raw Data</summary>
                            <pre>{JSON.stringify(userData, null, 2)}</pre>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}
