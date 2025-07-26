// // src/pages/LoginPage.jsx
// import React, { useState } from 'react';
// import api from '../api'; // Your configured axios instance

// const LoginPage = ({ onLogin }) => {
//   const [cnic, setCnic] = useState(''); // CNIC is now the primary login identifier
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState(''); // State for selected role (might be derived from login response later)
//   const [editModeEnabled, setEditModeEnabled] = useState(false); // State for edit mode toggle
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const roles = ['admin', 'student', 'teacher', 'accountant', 'cook', 'cleaner'];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     if (!cnic || !password) { // Check for CNIC and password
//       setError('Please enter CNIC and password.');
//       setLoading(false);
//       return;
//     }

//     try {
//       // --- ACTUAL BACKEND API CALL FOR LOGIN (sending cnic instead of email) ---
//       const response = await api.post('/users/login', {
//         cnic, // Send CNIC
//         password,
//       });

//       const userData = response.data; // This will contain _id, name, email, role, and token from your backend

//       const loggedInUser = {
//         token: userData.token,
//         cnic: userData.cnic || cnic, // Use CNIC from backend response, or the one entered
//         email: userData.email, // Backend might still return email for other purposes
//         role: userData.role, // Use the role returned by the backend
//         name: userData.name,
//         profileId: userData.profileId || userData._id,
//         editModeEnabled: editModeEnabled, // Still controlled by frontend checkbox for now
//       };

//       // Store user info in localStorage or context API
//       localStorage.setItem('userInfo', JSON.stringify(loggedInUser));

//       onLogin(loggedInUser); // Call the onLogin prop with the actual user data

//     } catch (err) {
//       console.error('Login error:', err.response?.data?.message || err.message);
//       setError(err.response?.data?.message || 'Login failed. Please check your credentials or try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter">
//       <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
//         <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Login</h2>
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//             {error}
//           </div>
//         )}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
//             <input
//               type="text"
//               id="cnic"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               value={cnic}
//               onChange={(e) => setCnic(e.target.value)}
//               placeholder="Enter your CNIC (e.g., 1234567890123)"
//               maxLength="13"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//             <input
//               type="password"
//               id="password"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
//             disabled={loading}
//           >
//             {loading ? 'Logging In...' : 'Login'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const LoginPage = ({ onLogin }) => {
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      if (userData.role == 'admin') {
        navigate('/admin/dashboard');
      }
      if (userData.role == 'teacher') {
        navigate('/teacher/dashboard');
      }
      if (userData.role == 'student') {
        navigate('/student/dashboard');
      }
      if (userData.role == 'accountant') {
        navigate('/accountant/dashboard');
      }
      else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-500 to-white-600 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      {/* <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row items-stretch overflow-hidden"> */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-6xl min-h-[500px] flex flex-col md:flex-row items-stretch overflow-hidden">
        {/* Left Section: Institute Name and Description */}
        <div className="md:w-3/4 p-6 md:p-10 flex flex-col justify-center items-center text-center md:text-left bg-gradient-to-br from-green-50 to-green-100 rounded-lg md:rounded-r-none mb-6 md:mb-0">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 mb-4 leading-tight">
            Jamia Tul Mastwaar
          </h1>
          <p className="text-gray-700 italic text-md sm:text-lg px-4 md:px-0 leading-relaxed max-w-md">
            "Educating minds, empowering futures through knowledge and wisdom."
          </p>
          <p className="text-gray-500 text-sm mt-4 max-w-md">
            Committed to fostering academic excellence, personal growth, and community engagement. Join us on a journey of discovery.
          </p>
        </div>

        {/* Right Section: Login Form */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8 tracking-tight text-center">
            Welcome Back!
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cnic" className="block text-sm font-semibold text-gray-700 mb-2">CNIC</label>
              <input
                type="text"
                id="cnic"
                className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 text-base"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="Enter your CNIC (e.g., 1234567890123)"
                maxLength="13"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 transform hover:-translate-y-1 active:scale-95"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>
          {/* <p className="mt-8 text-center text-gray-600 text-sm">
            Forgot your password? <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-200">Reset it here</a>.
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
