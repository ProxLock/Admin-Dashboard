import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { User } from '../models';
import { X } from 'lucide-react';

interface UserActionModalProps {
    isOpen: boolean;
    onClose: (shouldRefresh?: boolean) => void;
    user: User;
}

export default function UserActionModal({ isOpen, onClose, user }: UserActionModalProps) {
    // Request Limit Override State
    const [overrideLimit, setOverrideLimit] = useState('');
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Access Key Limit Override State
    const [accessKeyLimit, setAccessKeyLimit] = useState('');
    const [isAccessKeyUnlimited, setIsAccessKeyUnlimited] = useState(false);

    // Initialize state when modal opens or user changes
    useEffect(() => {
        if (isOpen && user) {
            // Request Limit
            const currentLimit = user.overrideRequestLimit ?? user.requestLimit;
            if (currentLimit === -1) {
                setIsUnlimited(true);
                setOverrideLimit('');
            } else {
                setOverrideLimit((currentLimit ?? '').toString());
                setIsUnlimited(false);
            }

            // Access Key Limit
            const currentAccessKeyLimit = user.overrideAccessKeyLimit ?? user.accessKeyLimit;
            if (currentAccessKeyLimit === -1) {
                setIsAccessKeyUnlimited(true);
                setAccessKeyLimit('');
            } else {
                setAccessKeyLimit((currentAccessKeyLimit ?? '').toString());
                setIsAccessKeyUnlimited(false);
            }
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSaveAll = async () => {
        setUpdating(true);
        try {
            // Save Request Limit
            let requestBody: number | null = null;
            if (isUnlimited) {
                requestBody = -1;
            } else {
                requestBody = overrideLimit === '' ? null : parseInt(overrideLimit, 10);
            }

            // Save Access Key Limit
            let accessKeyBody: number | null = null;
            if (isAccessKeyUnlimited) {
                accessKeyBody = -1;
            } else {
                accessKeyBody = accessKeyLimit === '' ? null : parseInt(accessKeyLimit, 10);
            }

            await Promise.all([
                api.post(`/admin/${user.id}/user/override-limit`, requestBody, {
                    headers: { 'Content-Type': 'application/json' }
                }),
                api.post(`/admin/${user.id}/user/api-keys/override-limit`, accessKeyBody, {
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);

            onClose(true); // Close and refresh
        } catch (err) {
            console.error("Failed to update limits", err);
            alert("Failed to update limits");
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveAccessKeyOverride = async () => {
        setUpdating(true);
        try {
            await api.post(`/admin/${user.id}/user/api-keys/override-limit`, null, {
                headers: { 'Content-Type': 'application/json' }
            });
            onClose(true);
        } catch (err) {
            console.error("Failed to remove access key override", err);
            alert("Failed to remove access key override");
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveRequestOverride = async () => {
        setUpdating(true);
        try {
            await api.post(`/admin/${user.id}/user/override-limit`, null, {
                headers: { 'Content-Type': 'application/json' }
            });
            onClose(true);
        } catch (err) {
            console.error("Failed to remove request override", err);
            alert("Failed to remove request override");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card-surface opaque" style={{ width: '100%', maxWidth: '500px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <button
                    onClick={() => onClose()}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                    Edit User
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Details</h3>
                    <p style={{ color: 'var(--text-muted)' }}>ID: {user.id}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Override Request Limit
                        {user.overrideRequestLimit !== undefined && user.overrideRequestLimit !== null && (
                            <button
                                onClick={handleRemoveRequestOverride}
                                disabled={updating}
                                style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                            >
                                Remove Override
                            </button>
                        )}
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={overrideLimit}
                            onChange={(e) => setOverrideLimit(e.target.value)}
                            placeholder={isUnlimited ? "Unlimited" : "Enter limit"}
                            disabled={isUnlimited}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: isUnlimited ? 'var(--bg-card)' : 'var(--bg-input)',
                                border: '1px solid var(--border-default)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                opacity: isUnlimited ? 0.5 : 1
                            }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                                type="checkbox"
                                checked={isUnlimited}
                                onChange={(e) => {
                                    setIsUnlimited(e.target.checked);
                                    if (e.target.checked) setOverrideLimit('');
                                }}
                                style={{ width: '16px', height: '16px' }}
                            />
                            <span style={{ color: 'var(--text-primary)' }}>Unlimited</span>
                        </label>
                    </div>
                </div>

                {/* Access Key Limit Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Override Access Key Limit
                        {user.overrideAccessKeyLimit !== undefined && user.overrideAccessKeyLimit !== null && (
                            <button
                                onClick={handleRemoveAccessKeyOverride}
                                disabled={updating}
                                style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                            >
                                Remove Override
                            </button>
                        )}
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={accessKeyLimit}
                            onChange={(e) => setAccessKeyLimit(e.target.value)}
                            placeholder={isAccessKeyUnlimited ? "Unlimited" : "Enter limit"}
                            disabled={isAccessKeyUnlimited}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: isAccessKeyUnlimited ? 'var(--bg-card)' : 'var(--bg-input)',
                                border: '1px solid var(--border-default)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                opacity: isAccessKeyUnlimited ? 0.5 : 1
                            }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                                type="checkbox"
                                checked={isAccessKeyUnlimited}
                                onChange={(e) => {
                                    setIsAccessKeyUnlimited(e.target.checked);
                                    if (e.target.checked) setAccessKeyLimit('');
                                }}
                                style={{ width: '16px', height: '16px' }}
                            />
                            <span style={{ color: 'var(--text-primary)' }}>Unlimited</span>
                        </label>
                    </div>
                </div>

                <div className="actions-row" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <button
                        className="btn-solid"
                        onClick={() => onClose()}
                        disabled={updating}
                        style={{ backgroundColor: 'transparent', borderColor: 'transparent' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-solid"
                        onClick={handleSaveAll}
                        disabled={updating}
                        style={{ backgroundColor: 'var(--accent-purple-1)', color: '#fff', borderColor: 'var(--accent-purple-1)' }}
                    >
                        {updating ? 'Saving...' : 'Save All'}
                    </button>
                </div>
            </div>
        </div>
    );
}
