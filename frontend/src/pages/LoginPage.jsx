// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Eye, EyeOff, Lock, CreditCard } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!cnic || !password) {
      setError('Please enter CNIC and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/users/login', { cnic, password });
      const userData = response.data;

      const loggedInUser = {
        token: userData.token,
        cnic: userData.cnic || cnic,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        profileId: userData.profileId || userData._id,
        editModeEnabled: userData.editModeEnabled,
      };

      // Always keep current session
      sessionStorage.setItem('userInfo', JSON.stringify(loggedInUser));
      // If Remember me is checked, persist to localStorage as well
      if (rememberMe) {
        localStorage.setItem('userInfo', JSON.stringify(loggedInUser));
      } else {
        localStorage.removeItem('userInfo');
      }
      onLogin(loggedInUser);

      if (userData.role === 'admin') navigate('/admin/dashboard');
      if (userData.role === 'teacher') navigate('/teacher/dashboard');
      if (userData.role === 'student') navigate('/student/dashboard');
      if (userData.role === 'accountant') navigate('/accountant/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${currentTheme.mainBg}`}>
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),transparent_60%)]" />

      {/* Main Card */}
      <div
        className={`relative w-full max-w-6xl min-h-[520px]
        flex flex-col md:flex-row overflow-hidden rounded-2xl
        backdrop-blur-xl bg-opacity-80
        ${currentTheme.cardBg} ${currentTheme.shadow} ${currentTheme.border}
        animate-[fadeIn_0.8s_ease-out]`}
      >

        {/* LEFT PANEL */}
        <div
          className={`md:w-3/4 p-10 flex flex-col justify-center items-center text-center
          animate-[slideLeft_1s_ease-out]`}
        >
          <img
            src="/Jamia%20Logo.png"
            alt="Jamia Tul Mastwaar"
            className="w-24 h-24 mb-6 drop-shadow-xl"
          />

          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-green-800">
            Jamia Tul Mastwaar
          </h1>

          <div className="w-16 h-1 bg-green-600 rounded-full mb-6" />

          <p className="italic text-lg max-w-md leading-relaxed text-gray-700">
            “Educating minds, empowering futures through knowledge and wisdom.”
          </p>

          <p className="text-sm mt-6 max-w-md text-gray-500">
            A trusted institution committed to academic excellence and character building.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center animate-[slideUp_1s_ease-out]">

          <h2 className={`text-4xl font-extrabold text-center mb-4 ${currentTheme.title || 'text-green-800'}`}>
            Welcome Back
          </h2>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex-1 h-px ${currentTheme.divider || 'bg-gray-300'}`} />
            <span className={`text-sm font-medium ${currentTheme.mutedText || 'text-gray-500'}`}>Secure Login</span>
            <div className={`flex-1 h-px ${currentTheme.divider || 'bg-gray-300'}`} />
          </div>

          {error && (
            <div className={`mb-6 px-4 py-3 rounded-lg animate-[shake_0.4s] ${currentTheme.alertErrorBg || 'bg-red-100'} ${currentTheme.alertErrorText || 'text-red-700'} ${currentTheme.alertErrorBorder || 'border border-red-400'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* CNIC */}
            <div className="relative">
              <CreditCard className={`absolute left-4 top-4 ${currentTheme.iconText || 'text-gray-400'}`} size={18} />
              <input
                type="text"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                maxLength="13"
                placeholder=" "
                className={`peer w-full pl-11 pr-4 pt-6 pb-2 rounded-xl ${currentTheme.inputBorder || 'border border-gray-300'}
                ${currentTheme.inputBg || 'bg-transparent'} focus:outline-none ${currentTheme.inputRing || 'focus:ring-2 focus:ring-green-500'} transition`}
                required
              />
              <label className={`absolute left-11 top-2 text-sm ${currentTheme.mutedText || 'text-gray-500'}
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                peer-focus:top-2 peer-focus:text-sm ${currentTheme.inputFocus || 'peer-focus:text-green-600'} transition-all`}>
                CNIC
              </label>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className={`absolute left-4 top-4 ${currentTheme.iconText || 'text-gray-400'}`} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className={`peer w-full pl-11 pr-12 pt-6 pb-2 rounded-xl ${currentTheme.inputBorder || 'border border-gray-300'}
                ${currentTheme.inputBg || 'bg-transparent'} focus:outline-none ${currentTheme.inputRing || 'focus:ring-2 focus:ring-green-500'} transition`}
                required
              />
              <label className={`absolute left-11 top-2 text-sm ${currentTheme.mutedText || 'text-gray-500'}
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                peer-focus:top-2 peer-focus:text-sm ${currentTheme.inputFocus || 'peer-focus:text-green-600'} transition-all`}>
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-4 transition ${currentTheme.mutedText || 'text-gray-500'} ${currentTheme.btnGhostHover || 'hover:text-green-600'}`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* REMEMBER ME + BUTTON */}
            <div className="flex items-center justify-between">
              <label className={`inline-flex items-center gap-2 text-sm ${currentTheme.text || 'text-gray-600'}`}>
                <input
                  type="checkbox"
                  className={`rounded ${currentTheme.inputBorder || 'border-gray-300'} ${currentTheme.btnPrimaryBg || 'text-green-600'} ${currentTheme.inputRing || 'focus:ring-green-500'}`}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-lg font-bold
              ${currentTheme.btnPrimaryBg || 'bg-green-600'} ${currentTheme.btnPrimaryHover || 'hover:bg-green-700'}
              ${currentTheme.btnPrimaryText || 'text-white'}
              shadow-lg hover:shadow-xl
              transition-all duration-300
              active:scale-[0.97]`}
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <p className={`mt-10 text-center text-xs ${currentTheme.mutedText || 'text-gray-500'}`}>
            © {new Date().getFullYear()} Jamia Tul Mastwaar · All rights reserved
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0 }
            to { transform: translateY(0); opacity: 1 }
          }
          @keyframes slideLeft {
            from { transform: translateX(-30px); opacity: 0 }
            to { transform: translateX(0); opacity: 1 }
          }
          @keyframes shake {
            0%,100% { transform: translateX(0) }
            25% { transform: translateX(-4px) }
            75% { transform: translateX(4px) }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
