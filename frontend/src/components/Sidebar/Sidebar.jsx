import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { getAllUsers, searchUsers } from '../../api/users';
import Avatar from '../Common/Avatar';
import UserItem from './UserItem';
import toast from 'react-hot-toast';

export default function Sidebar({ isConnected }) {
  const { user, logout } = useAuth();
  const { activeContact, setActiveContact, onlineUsers, unreadCounts, lastMessages, initOnlineStatus } = useChat();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const searchTimer = useRef(null);
  const menuRef = useRef(null);

  // Initial load + initialize online status from DB
  useEffect(() => {
    getAllUsers()
      .then((data) => {
        setUsers(data);
        initOnlineStatus(data); // seed online/offline from DB status
      })
      .catch(() => toast.error('Failed to load users. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) {
      getAllUsers().then((data) => { setUsers(data); initOnlineStatus(data); }).catch(() => {});
      return;
    }
    searchTimer.current = setTimeout(() => {
      searchUsers(searchQuery).then(setUsers).catch(() => {});
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const onlineList = users.filter((u) => onlineUsers.has(u.id));
  const offlineList = users.filter((u) => !onlineUsers.has(u.id));
  const renderList = searchQuery.trim() ? users : [...onlineList, ...offlineList];

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    toast.success('You have been logged out');
  };

  return (
    <aside className="sidebar">
      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>💬</span>
            <span className="sidebar-brand-name">ChatSphere</span>
          </div>
          {/* Connection status pill */}
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: isConnected ? 'var(--online)' : '#f59e0b',
            background: isConnected ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
            border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
            padding: '3px 10px', borderRadius: 'var(--radius-full)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Search */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            id="user-search"
            className="input"
            type="text"
            placeholder="Search people…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
      </div>

      {/* ── User list ── */}
      <div className="sidebar-users">
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ margin: '0 auto 12px', display: 'block', width: 28, height: 28 }} />
            <p style={{ fontSize: 12 }}>Loading users…</p>
          </div>
        ) : renderList.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{searchQuery ? '🔍' : '👥'}</div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {searchQuery ? 'No users found' : 'No other users yet'}
            </p>
            {!searchQuery && (
              <p style={{ fontSize: 12 }}>Register another account to start chatting!</p>
            )}
          </div>
        ) : (
          <>
            {!searchQuery && onlineList.length > 0 && (
              <p className="sidebar-section-title">
                Online — {onlineList.length}
              </p>
            )}
            {!searchQuery && offlineList.length > 0 && onlineList.length > 0 && (
              <></>
            )}
            {renderList.map((u, i) => {
              const showOfflineLabel = !searchQuery && onlineList.length > 0 && i === onlineList.length;
              return (
                <div key={u.id}>
                  {showOfflineLabel && (
                    <p className="sidebar-section-title" style={{ marginTop: 8 }}>Others</p>
                  )}
                  <UserItem
                    user={u}
                    isActive={activeContact?.id === u.id}
                    isOnline={onlineUsers.has(u.id)}
                    unread={unreadCounts[u.id] || 0}
                    lastMessage={lastMessages[u.id]}
                    onClick={() => setActiveContact(u)}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── Footer: current user + logout ── */}
      <div className="sidebar-footer">
        <Avatar name={user?.name} size={38} />
        <div className="sidebar-footer-info">
          <p className="sidebar-footer-name">{user?.name}</p>
          <p className="sidebar-footer-status">● Online</p>
        </div>

        {/* Profile menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            id="profile-menu-btn"
            onClick={() => setShowMenu((p) => !p)}
            title="Account options"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 10px',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            ⋯
          </button>

          {showMenu && (
            <div style={{
              position: 'absolute',
              bottom: '110%',
              right: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: 160,
              overflow: 'hidden',
              zIndex: 100,
              animation: 'msg-in 0.15s ease',
            }}>
              <div style={{
                padding: '10px 14px 8px',
                borderBottom: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Signed in as</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
