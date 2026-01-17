import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { User } from '../models';
import { Search, Edit2 } from 'lucide-react';
import UserActionModal from '../components/UserActionModal';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [perPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async (pageToFetch = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/users?page=${pageToFetch}&per=${perPage}`);

            if (res.data && Array.isArray(res.data.users)) {
                setUsers(res.data.users);
                if (res.data.metadata) {
                    setTotalPages(res.data.metadata.pageCount);
                    setPage(res.data.metadata.page);
                }
            } else if (Array.isArray(res.data)) {
                // Fallback for non-paginated array response
                setUsers(res.data);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const filteredUsers = users.filter(user => {
        const email = user.emailAddresses?.[0]?.emailAddress || '';
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const searchLower = searchTerm.toLowerCase();
        return email.toLowerCase().includes(searchLower) || name.toLowerCase().includes(searchLower) || user.id.toLowerCase().includes(searchLower);
    });

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleModalClose = (shouldRefresh?: boolean) => {
        setIsModalOpen(false);
        setSelectedUser(null);
        if (shouldRefresh) {
            fetchUsers();
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title-row">
                    <h1 className="dashboard-title">Users</h1>
                    <div className="dashboard-title-actions">
                        {/* Actions like Export could go here */}
                    </div>
                </div>

                <div className="search-bar">
                    <Search size={18} className="search-bar-icon" />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="card-surface users-table-desktop" style={{ overflowX: 'auto', padding: 0 }}>
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <p>No users found.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-card-hover)' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>User</th>
                                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Requests</th>
                                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Access Keys</th>
                                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {user.imageUrl && <img src={user.imageUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                                {user.firstName} {user.lastName}
                                            </span>
                                            {/* Show ID if name is missing */}
                                            {(!user.firstName && !user.lastName) && <span style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>{user.id}</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ color: 'var(--text-primary)' }}>
                                            {user.currentRequestUsage ?? 0}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                                            / {user.overrideRequestLimit !== undefined && user.overrideRequestLimit !== null ? (
                                                <span style={{ color: 'var(--accent-purple-1)' }}>
                                                    {user.overrideRequestLimit === -1 ? '∞' : user.overrideRequestLimit}
                                                </span>
                                            ) : (
                                                user.requestLimit === -1 ? '∞' : (user.requestLimit ?? 'Default')
                                            )}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ color: 'var(--text-primary)' }}>
                                            {user.accessKeys?.length ?? 0}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                                            / {user.overrideAccessKeyLimit !== undefined && user.overrideAccessKeyLimit !== null ? (
                                                <span style={{ color: 'var(--accent-purple-1)' }}>
                                                    {user.overrideAccessKeyLimit === -1 ? '∞' : user.overrideAccessKeyLimit}
                                                </span>
                                            ) : (
                                                user.accessKeyLimit === -1 ? '∞' : (user.accessKeyLimit ?? 'Default')
                                            )}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button
                                            className="btn-solid"
                                            style={{ padding: '4px 8px', fontSize: '0.85em' }}
                                            onClick={() => handleEdit(user)}
                                        >
                                            <Edit2 size={14} style={{ marginRight: '4px' }} />
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Mobile Cards View */}
            <div className="users-cards-mobile">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <p>No users found.</p>
                    </div>
                ) : (
                    <div className="user-cards-list">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="user-card">
                                <div className="user-card-header">
                                    <div className="user-card-avatar">
                                        {user.imageUrl && <img src={user.imageUrl} alt="" />}
                                    </div>
                                    <div className="user-card-name">
                                        {user.firstName || user.lastName ? (
                                            <span>{user.firstName} {user.lastName}</span>
                                        ) : (
                                            <span className="user-card-id">{user.id}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="user-card-stats">
                                    <div className="user-card-stat">
                                        <span className="stat-label">Requests</span>
                                        <span className={`stat-value ${user.overrideRequestLimit ? 'override' : ''}`}>
                                            {user.currentRequestUsage ?? 0} / {user.overrideRequestLimit !== undefined && user.overrideRequestLimit !== null ? (
                                                <>{user.overrideRequestLimit === -1 ? '∞' : user.overrideRequestLimit} <small>(Override)</small></>
                                            ) : (
                                                user.requestLimit === -1 ? '∞' : (user.requestLimit ?? 'Default')
                                            )}
                                        </span>
                                    </div>
                                    <div className="user-card-stat">
                                        <span className="stat-label">Access Keys</span>
                                        <span className={`stat-value ${user.overrideAccessKeyLimit ? 'override' : ''}`}>
                                            {user.accessKeys?.length ?? 0} / {user.overrideAccessKeyLimit !== undefined && user.overrideAccessKeyLimit !== null ? (
                                                <>{user.overrideAccessKeyLimit === -1 ? '∞' : user.overrideAccessKeyLimit} <small>(Override)</small></>
                                            ) : (
                                                user.accessKeyLimit === -1 ? '∞' : (user.accessKeyLimit ?? 'Default')
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="btn-solid user-card-edit"
                                    onClick={() => handleEdit(user)}
                                >
                                    <Edit2 size={14} />
                                    Edit User
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button
                    className="btn-solid"
                    disabled={loading}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{ visibility: page <= 1 ? 'hidden' : 'visible' }}
                >
                    Previous
                </button>
                <span style={{ color: 'var(--text-secondary)' }}>
                    Page {page}
                </span>
                <button
                    className="btn-solid"
                    disabled={loading}
                    onClick={() => setPage(p => p + 1)}
                    style={{ visibility: (users.length < perPage || page >= totalPages) ? 'hidden' : 'visible' }}
                >
                    Next
                </button>
            </div>

            {selectedUser && (
                <UserActionModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    user={selectedUser}
                />
            )}
        </div>
    );
}
