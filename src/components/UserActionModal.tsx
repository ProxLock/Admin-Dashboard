import { useState } from 'react';
import { api } from '../lib/api';
import type { User } from '../models';
import { X } from 'lucide-react';

interface UserActionModalProps {
    isOpen: boolean;
    onClose: (shouldRefresh?: boolean) => void;
    user: User;
}

export default function UserActionModal({ isOpen, onClose, user }: UserActionModalProps) {
    const [overrideLimit, setOverrideLimit] = useState((user.overrideRequestLimit ?? user.requestLimit)?.toString() || '');
    const [updating, setUpdating] = useState(false);

    if (!isOpen) return null;

    const handleSaveLimit = async () => {
        setUpdating(true);
        try {
            const body = overrideLimit === '' ? null : parseInt(overrideLimit, 10);
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
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="number"
                            value={overrideLimit}
                            onChange={(e) => setOverrideLimit(e.target.value)}
                            placeholder="Enter limit"
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: 'var(--bg-input)',
                                border: '1px solid var(--border-default)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>

                <div className="actions-row" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <button
                        className="btn-solid"
                        onClick={handleRemoveOverride}
                        disabled={updating}
                        style={{ marginRight: 'auto', backgroundColor: 'var(--btn-secondary-bg)', borderColor: 'var(--btn-secondary-border)', color: 'var(--color-error)' }}
                    >
                        Remove Override
                    </button>

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
