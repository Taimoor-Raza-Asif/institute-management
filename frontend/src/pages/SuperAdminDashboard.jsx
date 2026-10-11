// src/pages/SuperAdminDashboard.jsx
import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// ─── Countdown Timer Component ────────────────────────────────────────────────
const CountdownTimer = ({ scheduledAt, onExpired, theme }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => {
      const elapsed = Date.now() - new Date(scheduledAt).getTime();
      const rem = Math.max(0, COOLDOWN_MS - elapsed);
      setRemaining(rem);
      if (rem === 0 && onExpired) onExpired();
    };
    calc();
    const id = setInterval(calc, 500);
    return () => clearInterval(id);
  }, [scheduledAt, onExpired]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const pct = (remaining / COOLDOWN_MS) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
          <circle
            cx="24" cy="24" r="20" fill="none"
            stroke={pct > 40 ? '#f59e0b' : '#ef4444'} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${theme?.text || 'text-gray-900'}`}>
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
      <div>
        <p className="text-amber-600 font-bold text-sm">Deletion Pending</p>
        <p className={`${theme?.mutedText || 'text-gray-500'} text-xs`}>Permanent in {mins}m {secs}s</p>
      </div>
    </div>
  );
};

// ─── Confirmation Modal ────────────────────────────────────────────────────────
const ConfirmDeleteModal = ({ admin, onConfirm, onCancel, theme }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className={`${theme?.modalBg || 'bg-white'} ${theme?.modalBorder || 'border border-gray-200'} ${theme?.modalShadow || 'shadow-2xl'} rounded-2xl p-8 max-w-md w-full animate-rise`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h3 className={`text-xl font-bold ${theme?.title || 'text-gray-900'}`}>Delete Admin Account?</h3>
          <p className={`${theme?.mutedText || 'text-gray-500'} text-sm mt-0.5`}>CNIC: <span className="font-mono font-semibold">{admin?.cnic}</span></p>
        </div>
      </div>
      <div className={`${theme?.alertWarningBg || 'bg-amber-50'} ${theme?.alertWarningBorder || 'border border-amber-200'} rounded-xl p-4 mb-6`}>
        <p className={`${theme?.alertWarningText || 'text-amber-800'} text-sm font-semibold`}>⏱ 5-Minute Undo Window</p>
        <p className={`${theme?.mutedText || 'text-gray-600'} text-xs mt-1`}>
          The account will be immediately deactivated and scheduled for permanent deletion in 5 minutes.
          You can undo this at any time during that window.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className={`flex-1 py-3 rounded-xl border ${theme?.btnSecondaryBorder || 'border-gray-300'} ${theme?.btnSecondaryBg || 'bg-white'} ${theme?.btnSecondaryText || 'text-gray-700'} hover:${theme?.btnSecondaryHover || 'bg-gray-100'} transition font-semibold text-sm shadow-sm`}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 py-3 rounded-xl ${theme?.btnDangerBg || 'bg-red-600'} ${theme?.btnDangerText || 'text-white'} hover:${theme?.btnDangerHover || 'hover:bg-red-700'} font-bold text-sm transition shadow-lg shadow-red-500/20`}
        >
          Initiate Deletion
        </button>
      </div>
    </div>
  </div>
);

// ─── Admin Card ───────────────────────────────────────────────────────────────
const AdminCard = ({ admin, onInitiateDelete, onUndo, onToggleActive, onExpired, theme }) => {
  const isPending = admin.pendingDeletion && admin.deletionScheduledAt;

  return (
    <div className={`${theme?.cardBg || 'bg-white'} ${theme?.cardBorder || 'border border-gray-200'} rounded-2xl p-5 ${theme?.cardShadow || 'shadow-md'} transition-all duration-300 ${isPending ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-lg' : !admin.isActive ? 'opacity-90 border-red-200' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full ${theme?.btnPrimaryBg || 'bg-emerald-600'} ${theme?.btnPrimaryText || 'text-white'} flex items-center justify-center font-bold text-lg shadow-md`}>
            {admin.profileId?.name?.[0]?.toUpperCase() || admin.cnic[0]}
          </div>
          <div>
            <p className={`font-bold ${theme?.text || 'text-gray-900'} text-base`}>{admin.profileId?.name || 'Admin'}</p>
            <p className={`${theme?.mutedText || 'text-gray-500'} text-xs font-mono`}>{admin.cnic}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isPending ? (
            <span className={`px-2.5 py-1 rounded-full ${theme?.badgeWarningBg || 'bg-amber-100'} ${theme?.badgeWarningText || 'text-amber-800'} text-xs font-bold`}>⏳ Pending</span>
          ) : admin.isActive ? (
            <span className={`px-2.5 py-1 rounded-full ${theme?.badgeSuccessBg || 'bg-emerald-100'} ${theme?.badgeSuccessText || 'text-emerald-800'} text-xs font-bold`}>✓ Active</span>
          ) : (
            <span className={`px-2.5 py-1 rounded-full ${theme?.badgeDangerBg || 'bg-red-100'} ${theme?.badgeDangerText || 'text-red-800'} text-xs font-bold`}>✗ Deactivated</span>
          )}
        </div>
      </div>

      {isPending && (
        <div className={`${theme?.alertWarningBg || 'bg-amber-50'} ${theme?.alertWarningBorder || 'border border-amber-200'} rounded-xl p-3 mb-4 flex items-center justify-between gap-3`}>
          <CountdownTimer scheduledAt={admin.deletionScheduledAt} onExpired={() => onExpired(admin._id)} theme={theme} />
          <button
            onClick={() => onUndo(admin._id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl ${theme?.btnPrimaryBg || 'bg-emerald-600'} ${theme?.btnPrimaryText || 'text-white'} hover:${theme?.btnPrimaryHover || 'hover:bg-emerald-700'} text-xs font-bold transition shadow-md`}
          >
            ↩ Undo
          </button>
        </div>
      )}

      {!isPending && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onToggleActive(admin._id, admin.isActive)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition border ${
              admin.isActive
                ? `${theme?.btnSecondaryBorder || 'border-gray-300'} ${theme?.btnSecondaryText || 'text-gray-700'} hover:${theme?.btnSecondaryHover || 'bg-gray-100'}`
                : `${theme?.btnPrimaryBg || 'bg-emerald-600'} ${theme?.btnPrimaryText || 'text-white'} hover:${theme?.btnPrimaryHover || 'hover:bg-emerald-700'}`
            }`}
          >
            {admin.isActive ? '⏸ Deactivate' : '▶ Reactivate'}
          </button>
          <button
            onClick={() => onInitiateDelete(admin)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600/40 dark:text-red-400 dark:hover:bg-red-900/30 transition"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDeleteAdmin, setToDeleteAdmin] = useState(null);
  const pollRef = useRef(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const { data } = await api.get('/super-admin/admins');
      setAdmins(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    // Poll every 15s to keep countdown and status fresh
    pollRef.current = setInterval(fetchAdmins, 15000);
    return () => clearInterval(pollRef.current);
  }, [fetchAdmins]);

  const handleInitiateDelete = async (admin) => {
    setToDeleteAdmin(admin);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.post(`/super-admin/admins/${toDeleteAdmin._id}/initiate-delete`);
      setToDeleteAdmin(null);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate deletion.');
      setToDeleteAdmin(null);
    }
  };

  const handleUndo = async (id) => {
    try {
      await api.post(`/super-admin/admins/${id}/undo-delete`);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to undo deletion.');
    }
  };

  const handleToggleActive = async (id, currentlyActive) => {
    try {
      await api.put(`/super-admin/admins/${id}/toggle-active`);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle active status.');
    }
  };

  const handleExpired = (id) => {
    setTimeout(() => setAdmins(prev => prev.filter(a => a._id !== id)), 1000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userInfo');
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
    navigate('/login');
  };

  const activeAdmins = admins.filter(a => a.isActive && !a.pendingDeletion);
  const pendingAdmins = admins.filter(a => a.pendingDeletion);
  const deactivatedAdmins = admins.filter(a => !a.isActive && !a.pendingDeletion);

  return (
    <div className={`min-h-screen ${currentTheme?.pageBg || 'bg-gray-50'} font-sans transition-colors duration-200`}>
      {/* Header */}
      <header className={`${currentTheme?.cardBg || 'bg-white'} border-b ${currentTheme?.panelBorder || 'border-gray-200'} ${currentTheme?.shadow || 'shadow-sm'} px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${currentTheme?.btnPrimaryBg || 'bg-emerald-600'} ${currentTheme?.btnPrimaryText || 'text-white'} flex items-center justify-center shadow-md`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${currentTheme?.title || 'text-gray-900'}`}>Super Admin Console</h1>
            <p className={`text-xs ${currentTheme?.mutedText || 'text-gray-500'}`}>Jamia Tul Mastwaar — Highest Privilege Access</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-sm hidden md:block ${currentTheme?.mutedText || 'text-gray-600'}`}>
            Logged in as <span className={`font-mono font-bold ${currentTheme?.title || 'text-gray-900'}`}>{currentUser?.cnic}</span>
          </span>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold border ${currentTheme?.btnSecondaryBorder || 'border-gray-300'} ${currentTheme?.btnSecondaryBg || 'bg-white'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} hover:${currentTheme?.btnSecondaryHover || 'bg-gray-100'} transition shadow-sm`}
          >
            Admin Dashboard
          </button>
          <button
            onClick={handleLogout}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${currentTheme?.btnDangerBg || 'bg-red-600'} ${currentTheme?.btnDangerText || 'text-white'} hover:${currentTheme?.btnDangerHover || 'bg-red-700'} transition shadow-sm`}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className={`mb-6 px-4 py-3 rounded-xl ${currentTheme?.alertErrorBg || 'bg-red-50'} ${currentTheme?.alertErrorBorder || 'border border-red-200'} ${currentTheme?.alertErrorText || 'text-red-700'} text-sm flex items-center justify-between`}>
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-3 font-bold hover:opacity-75">✕</button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`${currentTheme?.cardBg || 'bg-white'} border ${currentTheme?.cardBorder || 'border-gray-200'} rounded-2xl p-5 ${currentTheme?.cardShadow || 'shadow-md'} border-l-4 border-l-emerald-500`}>
            <p className={`text-3xl font-black ${currentTheme?.title || 'text-gray-900'}`}>{activeAdmins.length}</p>
            <p className={`${currentTheme?.mutedText || 'text-gray-500'} text-xs font-semibold mt-1`}>Active Admins</p>
          </div>
          <div className={`${currentTheme?.cardBg || 'bg-white'} border ${currentTheme?.cardBorder || 'border-gray-200'} rounded-2xl p-5 ${currentTheme?.cardShadow || 'shadow-md'} border-l-4 border-l-amber-500`}>
            <p className={`text-3xl font-black ${currentTheme?.title || 'text-gray-900'}`}>{pendingAdmins.length}</p>
            <p className={`${currentTheme?.mutedText || 'text-gray-500'} text-xs font-semibold mt-1`}>Pending Deletion</p>
          </div>
          <div className={`${currentTheme?.cardBg || 'bg-white'} border ${currentTheme?.cardBorder || 'border-gray-200'} rounded-2xl p-5 ${currentTheme?.cardShadow || 'shadow-md'} border-l-4 border-l-gray-400`}>
            <p className={`text-3xl font-black ${currentTheme?.title || 'text-gray-900'}`}>{deactivatedAdmins.length}</p>
            <p className={`${currentTheme?.mutedText || 'text-gray-500'} text-xs font-semibold mt-1`}>Deactivated</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className={`inline-block w-8 h-8 border-2 ${currentTheme?.iconText || 'border-emerald-500'} border-t-transparent rounded-full animate-spin`} />
            <p className={`${currentTheme?.mutedText || 'text-gray-500'} mt-3 text-sm`}>Loading admin accounts...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className={`text-center py-16 border border-dashed ${currentTheme?.cardBorder || 'border-gray-300'} rounded-2xl ${currentTheme?.cardBg || 'bg-white'}`}>
            <p className={`text-lg font-semibold ${currentTheme?.title || 'text-gray-700'}`}>No admin accounts found.</p>
            <p className={`${currentTheme?.mutedText || 'text-gray-500'} text-sm mt-1`}>Admin accounts created in User Management will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Deletion — top priority */}
            {pendingAdmins.length > 0 && (
              <section>
                <h2 className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Pending Deletion ({pendingAdmins.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {pendingAdmins.map(admin => (
                    <AdminCard key={admin._id} admin={admin}
                      onInitiateDelete={handleInitiateDelete}
                      onUndo={handleUndo}
                      onToggleActive={handleToggleActive}
                      onExpired={handleExpired}
                      theme={currentTheme}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Active Admins */}
            {activeAdmins.length > 0 && (
              <section>
                <h2 className={`font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2 ${currentTheme?.title || 'text-gray-800'}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Admins ({activeAdmins.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeAdmins.map(admin => (
                    <AdminCard key={admin._id} admin={admin}
                      onInitiateDelete={handleInitiateDelete}
                      onUndo={handleUndo}
                      onToggleActive={handleToggleActive}
                      onExpired={handleExpired}
                      theme={currentTheme}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Deactivated Admins */}
            {deactivatedAdmins.length > 0 && (
              <section>
                <h2 className={`font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2 ${currentTheme?.mutedText || 'text-gray-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  Deactivated ({deactivatedAdmins.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {deactivatedAdmins.map(admin => (
                    <AdminCard key={admin._id} admin={admin}
                      onInitiateDelete={handleInitiateDelete}
                      onUndo={handleUndo}
                      onToggleActive={handleToggleActive}
                      onExpired={handleExpired}
                      theme={currentTheme}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {toDeleteAdmin && (
        <ConfirmDeleteModal
          admin={toDeleteAdmin}
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDeleteAdmin(null)}
          theme={currentTheme}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
