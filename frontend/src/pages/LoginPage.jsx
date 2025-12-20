// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const LoginPage = ({ onLogin }) => {
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
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
      const response = await api.post('/users/login', {
        cnic,
        password,
      });

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

      localStorage.setItem('userInfo', JSON.stringify(loggedInUser));

      onLogin(loggedInUser);
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      }
      if (userData.role === 'teacher') {
        navigate('/teacher/dashboard');
      }
      if (userData.role === 'student') {
        navigate('/student/dashboard');
      }
      if (userData.role === 'accountant') {
        navigate('/accountant/dashboard');
      }
      // else {
      //   navigate('/dashboard');
      // }
console.log(userData.role);
    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter ${currentTheme.mainBg}`}>
      {/* <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row items-stretch overflow-hidden"> */}
  <div className={`p-6 sm:p-8 rounded-xl w-full max-w-6xl min-h-[500px] flex flex-col md:flex-row items-stretch overflow-hidden ${currentTheme.cardBg} ${currentTheme.shadow} ${currentTheme.border}`}>
        {/* Left Section: Institute Name and Description */}
  <div className={`md:w-3/4 p-6 md:p-10 flex flex-col justify-center items-center text-center md:text-left rounded-lg md:rounded-r-none mb-6 md:mb-0 ${currentTheme.panelBg || 'bg-gradient-to-br from-green-50 to-green-100'}`}>
          {/* Institute Logo */}
          <img
            src="/Jamia%20Logo.png"
            alt="Jamia Tul Mastwaar logo"
            className="w-20 h-20 sm:w-24 sm:h-24 mb-4 object-contain"
          />
          <h1 className={`text-4xl sm:text-5xl font-extrabold mb-4 leading-tight ${currentTheme.linkText} text-green-800`}>
            Jamia Tul Mastwaar
          </h1>
          <p className={`italic text-md sm:text-lg px-4 md:px-0 leading-relaxed max-w-md ${currentTheme.text || 'text-gray-700'}`}>
            "Educating minds, empowering futures through knowledge and wisdom."
          </p>
          <p className={`text-sm mt-4 max-w-md ${currentTheme.mutedText || 'text-gray-500'}`}>
            Committed to fostering academic excellence, personal growth, and community engagement. Join us on a journey of discovery.
          </p>
        </div>

        {/* Right Section: Login Form */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <h2 className={`text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight text-center ${currentTheme.title || 'text-green-800'}`}>
            Welcome Back!
          </h2>
          {error && (
            <div className={`px-4 py-3 rounded-lg relative mb-6 text-sm ${currentTheme.errorBg || 'bg-red-100'} ${currentTheme.errorText || 'text-red-700'} ${currentTheme.errorBorder || 'border border-red-400'}`} role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cnic" className={`block text-sm font-semibold mb-2 ${currentTheme.label || 'text-gray-700'}`}>CNIC</label>
              <input
                type="text"
                id="cnic"
                className={`mt-1 block w-full px-5 py-3 rounded-lg shadow-sm focus:outline-none transition duration-200 text-base ${currentTheme.inputBg || 'border border-gray-300'} ${currentTheme.inputText || ''}`}
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="Enter your CNIC (e.g., 1234567890123)"
                maxLength="13"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${currentTheme.label || 'text-gray-700'}`}>Password</label>
              <input
                type="password"
                id="password"
                className={`mt-1 block w-full px-5 py-3 rounded-lg shadow-sm focus:outline-none transition duration-200 text-base ${currentTheme.inputBg || 'border border-gray-300'} ${currentTheme.inputText || ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white ${currentTheme.buttonBg || 'bg-green-600'} hover:${currentTheme.buttonHover || 'bg-green-700'} focus:outline-none transition duration-300 transform hover:-translate-y-1 active:scale-95`}
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>
          {/* <p className="mt-8 text-center text-gray-600 text-sm">
            Forgot your password? <a href="#" className="text-green-600 hover:text-green-800 font-medium transition duration-200">Reset it here</a>.
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
