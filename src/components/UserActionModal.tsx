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
    const [overrideLimit, setOverrideLimit] = useState('');
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Initialize state when modal opens or user changes
    useEffect(() => {
        if (isOpen && user) {
            const currentLimit = user.overrideRequestLimit ?? user.requestLimit;
            if (currentLimit === -1) {
                setIsUnlimited(true);
                setOverrideLimit('');
            } else {
                setOverrideLimit((currentLimit ?? '').toString());
                setIsUnlimited(false);
            }
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSaveLimit = async () => {
        setUpdating(true);
        try {
            let body: number | null = null;
            if (isUnlimited) {
                body = -1;
            } else {
                body = overrideLimit === '' ? null : parseInt(overrideLimit, 10);
            }

            await api.post(`/admin/${user.id}/user/override-limit`, body, {
                headers: { 'Content-Type': 'application/json' }
            });
            onClose(true); // Close and refresh
        } catch (err) {
            console.error("Failed to update limit", err);
            alert("Failed to update limit");
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveOverride = async () => {
        setUpdating(true);
        try {
            await api.post(`/admin/${user.id}/user/override-limit`, null, {
                headers: { 'Content-Type': 'application/json' }
            });
            onClose(true);
        } catch (err) {
            console.error("Failed to remove override limit", err);
            alert("Failed to remove override limit");
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

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Override Request Limit
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

                <div className="actions-row" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
                    {(() => {
                        const tier = user.currentSubscription || 'free_user';
                        const defaults: Record<string, number> = {
                            'free_user': 3000,
                            '10k_requests': 10000,
                            'pro': 25000
                        };
                        const defaultLimit = defaults[tier];
                        const currentLimit = user.requestLimit;

                        // Show remove button if override exists (including -1) or if mismatch from default
                        // Note: If user has override -1, user.overrideRequestLimit is -1, which is truthy-ish (non-zero number), so check strictly or existence
                        if (user.overrideRequestLimit !== undefined && user.overrideRequestLimit !== null || (defaultLimit && currentLimit !== defaultLimit)) {
                            return (
                                <button
                                    className="btn-solid"
                                    onClick={handleRemoveOverride}
                                    disabled={updating}
                                    style={{ marginRight: 'auto', backgroundColor: 'var(--btn-secondary-bg)', borderColor: 'var(--btn-secondary-border)', color: 'var(--color-error)' }}
                                >
                                    Remove Override
                                </button>
                            );
                        }
                        return null;
                    })()}

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
                        onClick={handleSaveLimit}
                        disabled={updating}
                        style={{ backgroundColor: 'var(--accent-purple-1)', color: '#fff', borderColor: 'var(--accent-purple-1)' }}
                    >
                        {updating ? 'Saving...' : 'Save Limit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
