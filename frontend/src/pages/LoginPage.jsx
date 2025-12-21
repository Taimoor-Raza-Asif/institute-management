// // src/pages/LoginPage.jsx
// import React, { useState } from 'react';
// import { useTheme } from '../context/ThemeContext';
// import { useNavigate } from 'react-router-dom';
// import api from '../api';

// const LoginPage = ({ onLogin }) => {
//   const [cnic, setCnic] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const { currentTheme } = useTheme();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     if (!cnic || !password) {
//       setError('Please enter CNIC and password.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await api.post('/users/login', {
//         cnic,
//         password,
//       });

//       const userData = response.data;

//       const loggedInUser = {
//         token: userData.token,
//         cnic: userData.cnic || cnic,
//         email: userData.email,
//         role: userData.role,
//         name: userData.name,
//         profileId: userData.profileId || userData._id,
//         editModeEnabled: userData.editModeEnabled,
//       };

//       localStorage.setItem('userInfo', JSON.stringify(loggedInUser));

//       onLogin(loggedInUser);
//       if (userData.role === 'admin') {
//         navigate('/admin/dashboard');
//       }
//       if (userData.role === 'teacher') {
//         navigate('/teacher/dashboard');
//       }
//       if (userData.role === 'student') {
//         navigate('/student/dashboard');
//       }
//       if (userData.role === 'accountant') {
//         navigate('/accountant/dashboard');
//       }
//       // else {
//       //   navigate('/dashboard');
//       // }
// console.log(userData.role);
//     } catch (err) {
//       console.error('Login error:', err.response?.data?.message || err.message);
//       setError(err.response?.data?.message || 'Login failed. Please check your credentials or try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter ${currentTheme.mainBg}`}>
//       {/* <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row items-stretch overflow-hidden"> */}
//   <div className={`p-6 sm:p-8 rounded-xl w-full max-w-6xl min-h-[500px] flex flex-col md:flex-row items-stretch overflow-hidden ${currentTheme.cardBg} ${currentTheme.shadow} ${currentTheme.border}`}>
//         {/* Left Section: Institute Name and Description */}
//   <div className={`md:w-3/4 p-6 md:p-10 flex flex-col justify-center items-center text-center md:text-left rounded-lg md:rounded-r-none mb-6 md:mb-0 ${currentTheme.panelBg || 'bg-gradient-to-br from-green-50 to-green-100'}`}>
//           {/* Institute Logo */}
//           <img
//             src="/Jamia%20Logo.png"
//             alt="Jamia Tul Mastwaar logo"
//             className="w-20 h-20 sm:w-24 sm:h-24 mb-4 object-contain"
//           />
//           <h1 className={`text-4xl sm:text-5xl font-extrabold mb-4 leading-tight ${currentTheme.linkText} text-green-800`}>
//             Jamia Tul Mastwaar
//           </h1>
//           <p className={`italic text-md sm:text-lg px-4 md:px-0 leading-relaxed max-w-md ${currentTheme.text || 'text-gray-700'}`}>
//             "Educating minds, empowering futures through knowledge and wisdom."
//           </p>
//           <p className={`text-sm mt-4 max-w-md ${currentTheme.mutedText || 'text-gray-500'}`}>
//             Committed to fostering academic excellence, personal growth, and community engagement. Join us on a journey of discovery.
//           </p>
//         </div>

//         {/* Right Section: Login Form */}
//         <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
//           <h2 className={`text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight text-center ${currentTheme.title || 'text-green-800'}`}>
//             Welcome Back!
//           </h2>
//           {error && (
//             <div className={`px-4 py-3 rounded-lg relative mb-6 text-sm ${currentTheme.errorBg || 'bg-red-100'} ${currentTheme.errorText || 'text-red-700'} ${currentTheme.errorBorder || 'border border-red-400'}`} role="alert">
//               {error}
//             </div>
//           )}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="cnic" className={`block text-sm font-semibold mb-2 ${currentTheme.label || 'text-gray-700'}`}>CNIC</label>
//               <input
//                 type="text"
//                 id="cnic"
//                 className={`mt-1 block w-full px-5 py-3 rounded-lg shadow-sm focus:outline-none transition duration-200 text-base ${currentTheme.inputBg || 'border border-gray-300'} ${currentTheme.inputText || ''}`}
//                 value={cnic}
//                 onChange={(e) => setCnic(e.target.value)}
//                 placeholder="Enter your CNIC (e.g., 1234567890123)"
//                 maxLength="13"
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${currentTheme.label || 'text-gray-700'}`}>Password</label>
//               <input
//                 type="password"
//                 id="password"
//                 className={`mt-1 block w-full px-5 py-3 rounded-lg shadow-sm focus:outline-none transition duration-200 text-base ${currentTheme.inputBg || 'border border-gray-300'} ${currentTheme.inputText || ''}`}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 required
//               />
//             </div>
//             <button
//               type="submit"
//               className={`w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white ${currentTheme.buttonBg || 'bg-green-600'} hover:${currentTheme.buttonHover || 'bg-green-700'} focus:outline-none transition duration-300 transform hover:-translate-y-1 active:scale-95`}
//               disabled={loading}
//             >
//               {loading ? 'Logging In...' : 'Login'}
//             </button>
//           </form>
//           {/* <p className="mt-8 text-center text-gray-600 text-sm">
//             Forgot your password? <a href="#" className="text-green-600 hover:text-green-800 font-medium transition duration-200">Reset it here</a>.
//           </p> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;






// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Eye, EyeOff, Lock, CreditCard } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
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

      localStorage.setItem('userInfo', JSON.stringify(loggedInUser));
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

          <h2 className="text-4xl font-extrabold text-center text-green-800 mb-4">
            Welcome Back
          </h2>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500 font-medium">Secure Login</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-100 text-red-700 border border-red-400 animate-[shake_0.4s]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* CNIC */}
            <div className="relative">
              <CreditCard className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                type="text"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                maxLength="13"
                placeholder=" "
                className="peer w-full pl-11 pr-4 pt-6 pb-2 rounded-xl border border-gray-300
                bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
              />
              <label className="absolute left-11 top-2 text-sm text-gray-500
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                peer-focus:top-2 peer-focus:text-sm peer-focus:text-green-600 transition-all">
                CNIC
              </label>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full pl-11 pr-12 pt-6 pb-2 rounded-xl border border-gray-300
                bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                required
              />
              <label className="absolute left-11 top-2 text-sm text-gray-500
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                peer-focus:top-2 peer-focus:text-sm peer-focus:text-green-600 transition-all">
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-500 hover:text-green-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-lg font-bold text-white
              bg-green-600 hover:bg-green-700
              shadow-lg hover:shadow-xl
              transition-all duration-300
              active:scale-[0.97]"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-gray-500">
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
