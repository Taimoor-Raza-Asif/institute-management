// // import React from 'react';
// // import { Routes, Route, Link } from 'react-router-dom';
// // import StudentList from './components/StudentList';
// // import StudentForm from './components/StudentForm';
// // import FeeForm from './components/FeeForm';
// // import FeeList from './components/FeeList';



// // const App = () => {
// //   return (
// //     <div style={{ padding: '20px' }}>
// //       <h1 className="text-3xl font-bold text-blue-600">Institute Admin Dashboard</h1>

// //       {/* Navigation */}
// //       <nav>
// //         <Link to="/students" style={{ marginRight: '15px' }}>Students</Link>
// //         <Link to="/fees">Fees</Link>
// //       </nav>
// //       <hr />

// //       {/* Routing */}
// //       <Routes>
// //         <Route
// //           path="/students"
// //           element={
// //             <div>
// //               <StudentList />
// //             </div>
// //           }
// //         />
// //         <Route path="/fees" element={<FeeList />} />
// //         <Route path="*" element={<p>Page not found</p>} />
// //       </Routes>
// //     </div>
// //   );
// // };

// // export default App;


// // // src/App.jsx (Conceptual Example)
// // import React, { useState } from 'react';
// // import StudentList from './components/StudentList';
// // import FeeList from './components/FeeList';
// // import StaffList from './components/StaffList'; // Import the new StaffList

// // const App = () => {
// //   const [currentPage, setCurrentPage] = useState('studentList'); // Default to students

// //   const renderPage = () => {
// //     switch (currentPage) {
// //       case 'studentList':
// //         return <StudentList />;
// //       case 'feeList':
// //         return <FeeList />;
// //       case 'staffList': // New case for staff management
// //         return <StaffList />;
// //       default:
// //         return <StudentList />;
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-100">
// //       {/* Navigation Bar */}
// //       <nav className="bg-white shadow-md p-4 flex justify-center space-x-6">
// //         <button
// //           onClick={() => setCurrentPage('studentList')}
// //           className={`px-4 py-2 rounded-md font-medium ${currentPage === 'studentList' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
// //         >
// //           Students
// //         </button>
// //         <button
// //           onClick={() => setCurrentPage('feeList')}
// //           className={`px-4 py-2 rounded-md font-medium ${currentPage === 'feeList' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
// //         >
// //           Fees
// //         </button>
// //         <button
// //           onClick={() => setCurrentPage('staffList')} // New navigation button
// //           className={`px-4 py-2 rounded-md font-medium ${currentPage === 'staffList' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
// //         >
// //           Staff
// //         </button>
// //       </nav>

// //       {/* Page Content */}
// //       <main className="py-6">
// //         {renderPage()}
// //       </main>
// //     </div>
// //   );
// // };

// // export default App;


// // src/App.jsx
// import React, { useState, useEffect, useCallback, createContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import Dashboard from './pages/Dashboard'; // General Dashboard
// import AdminDashboard from './pages/AdminDashboard';
// import TeacherDashboard from './pages/TeacherDashboard';
// import StudentDashboard from './pages/StudentDashboard';
// import StaffDashboard from './pages/StaffDashboard'; // For Cook/Cleaner
// import AccountantDashboard from './pages/AccountantDashboard';
// import UserManagement from './pages/UserManagement';
// import AccessControlPanel from './pages/AccessControlPanel';
// import Unauthorized from './pages/Unauthorized';
// import Layout from './components/Layout';
// import StudentList from './components/StudentList'; // Already updated
// import StudentForm from './components/StudentForm'; // For /students/my-data route directly
// import StaffList from './components/StaffList'; // Already updated
// import StaffForm from './components/StaffForm'; // For /staff/my-data route directly
// import FeeList from './components/FeeList'; // Already updated

// // Create a UserContext to easily access currentUser throughout the app
// export const UserContext = createContext(null); // <--- ENSURE THIS LINE IS PRESENT AND CORRECT

// const App = () =>{
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   // Function to load user from localStorage
//   const loadUserFromLocalStorage = useCallback(() => {
//     const userInfo = localStorage.getItem('userInfo');
//     if (userInfo) {
//       try {
//         setCurrentUser(JSON.parse(userInfo));
//       } catch (e) {
//         console.error("Failed to parse user info from localStorage", e);
//         localStorage.removeItem('userInfo'); // Clear corrupted data
//         setCurrentUser(null);
//       }
//     }
//     setLoadingUser(false);
//   }, []);

//   useEffect(() => {
//     loadUserFromLocalStorage();
//   }, [loadUserFromLocalStorage]);

//   const handleLogin = (userInfo) => {
//     setCurrentUser(userInfo);
//     localStorage.setItem('userInfo', JSON.stringify(userInfo)); // Ensure info is stored on login
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('userInfo');
//     setCurrentUser(null);
//     // Redirect to login page after logout
//     // Using window.location.href for a full page reload to clear all state
//     window.location.href = '/login';
//   };

//   // A PrivateRoute component to protect routes
//   const PrivateRoute = ({ children, roles }) => {
//     if (loadingUser) {
//       return <div className="text-center py-8">Loading user authentication...</div>; // Or a spinner
//     }
//     if (!currentUser) {
//       return <Navigate to="/login" />;
//     }
//     if (roles && !roles.includes(currentUser.role)) {
//       return <Navigate to="/unauthorized" />;
//     }
//     return children;
//   };

//   return (
//     <UserContext.Provider value={{ currentUser, setCurrentUser }}>
//       <Router>
//         <Layout currentUser={currentUser} onLogout={handleLogout}>
//           <Routes>
//             <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
//             <Route path="/unauthorized" element={<Unauthorized />} />

//             {/* Default route: redirect to dashboard if logged in, else login */}
//             <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
//             <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

//             {/* Admin Routes */}
//             <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
//             <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
//             <Route path="/admin/access-control" element={<PrivateRoute roles={['admin']}><AccessControlPanel /></PrivateRoute>} />
//             <Route path="/admin/manage-leaves" element={<PrivateRoute roles={['admin']}><StaffList /></PrivateRoute>} /> {/* StaffList has ManageLeaveModal */}


//             {/* Student Module */}
//             <Route path="/student/dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
//             {/* Student's own data view - uses StudentForm in view/edit mode */}
//             <Route path="/students/my-data" element={<PrivateRoute roles={['student']}><StudentForm isViewMode={true} /></PrivateRoute>} />
//             {/* Placeholder for student attendance */}
//             <Route path="/student/attendance" element={<PrivateRoute roles={['student']}><p className="text-center py-8">Student Attendance Coming Soon!</p></PrivateRoute>} />


//             {/* Teacher Module */}
//             <Route path="/teacher/dashboard" element={<PrivateRoute roles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
//             {/* Teacher's own data view - uses StaffForm in view/edit mode */}
//             <Route path="/staff/my-data" element={<PrivateRoute roles={['teacher', 'cook', 'cleaner', 'accountant']}><StaffForm isViewMode={true} /></PrivateRoute>} />
//             {/* Teacher can view all students (filtered by subject in backend) */}
//             <Route path="/students" element={<PrivateRoute roles={['admin', 'teacher']}><StudentList /></PrivateRoute>} />
//             {/* Placeholder for teacher subjects */}
//             <Route path="/teacher/subjects" element={<PrivateRoute roles={['teacher']}><p className="text-center py-8">Teacher Subjects Management Coming Soon!</p></PrivateRoute>} />


//             {/* Staff Module (Cook, Cleaner) */}
//             <Route path="/staff/dashboard" element={<PrivateRoute roles={['cook', 'cleaner']}><StaffDashboard /></PrivateRoute>} />
//             {/* Staff's own data view is handled by /staff/my-data route above */}


//             {/* Accountant Module */}
//             <Route path="/accountant/dashboard" element={<PrivateRoute roles={['accountant']}><AccountantDashboard /></PrivateRoute>} />
//             {/* Accountant can manage fees */}
//             <Route path="/fees" element={<PrivateRoute roles={['admin', 'accountant', 'student']}><FeeList /></PrivateRoute>} /> {/* Student can view their own fees */}
//             {/* Placeholder for Bill Management, Donation Management, Reports */}
//             <Route path="/bills" element={<PrivateRoute roles={['admin', 'accountant']}><p className="text-center py-8">Bill Management Coming Soon!</p></PrivateRoute>} />
//             <Route path="/donations" element={<PrivateRoute roles={['admin', 'accountant']}><p className="text-center py-8">Donation Management Coming Soon!</p></PrivateRoute>} />
//             <Route path="/financial-reports" element={<PrivateRoute roles={['admin', 'accountant']}><p className="text-center py-8">Financial Reports Coming Soon!</p></PrivateRoute>} />


//             {/* General Staff List (only Admin can view all staff) */}
//             <Route path="/staff" element={<PrivateRoute roles={['admin']}><StaffList /></PrivateRoute>} />


//             {/* Catch all for undefined routes - redirects to dashboard or login */}
//             <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
//           </Routes>
//         </Layout>
//       </Router>
//     </UserContext.Provider>
//   );
// }

// export default App;


// src/App.jsx
import React, { useState, useEffect, useCallback, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AccountantDashboard from './pages/AccountantDashboard';
import UserManagement from './pages/UserManagement';
import AccessControlPanel from './pages/AccessControlPanel';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import StaffList from './components/StaffList';
import StaffForm from './components/StaffForm';
import FeeList from './components/FeeList';
import LeaveList from './components/LeaveList';
import StaffLeaveList from './components/StaffLeaveList';
import ProfileScreen from './components/ProfileScreen';
import AttendanceMarking from './components/AttendanceMarking';
import MyAttendance from './components/MyAttendance';
import AllAttendanceRecords from './components/AllAttendanceRecords';
export const UserContext = createContext(null);

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadUserFromLocalStorage = useCallback(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        setCurrentUser(JSON.parse(userInfo));
      } catch (e) {
        console.error("Failed to parse user info from localStorage", e);
        localStorage.removeItem('userInfo');
        setCurrentUser(null);
      }
    }
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    loadUserFromLocalStorage();
  }, [loadUserFromLocalStorage]);

  const handleLogin = (userInfo) => {
    setCurrentUser(userInfo);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const PrivateRoute = ({ children, roles }) => {
    if (loadingUser) {
      // Basic full-screen loading indicator for initial auth check
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <p className="text-xl text-gray-700">Loading user authentication...</p>
        </div>
      );
    }
    if (!currentUser) {
      return <Navigate to="/login" replace />; // Use replace to avoid extra history entries
    }
    if (roles && !roles.includes(currentUser.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
    // Render children wrapped by Layout for protected routes
    return <Layout currentUser={currentUser} onLogout={handleLogout}>{children}</Layout>;
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <Router>
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default Route: Redirect based on login status */}
          <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

          {/* Protected Routes - Wrapped by PrivateRoute which includes Layout */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile/:role/:id" element={<PrivateRoute><ProfileScreen /> </PrivateRoute>} />

          <Route path="/attendance/mark" element={<PrivateRoute><AttendanceMarking /></PrivateRoute>} />
          <Route path="/attendance/my/:id" element={<PrivateRoute><MyAttendance /></PrivateRoute>} /> 
          <Route path="/attendance/all" element={<PrivateRoute><AllAttendanceRecords /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
          <Route path="/admin/access-control" element={<PrivateRoute roles={['admin']}><AccessControlPanel /></PrivateRoute>} />
          <Route path="/admin/student-leaves" element={<PrivateRoute roles={['admin']}><LeaveList /></PrivateRoute>} />
          <Route path="/admin/staff-leaves" element={<PrivateRoute roles={['admin']}><StaffLeaveList /></PrivateRoute>} />


          {/* Student Module */}
          <Route path="/student/dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/students/my-data" element={<PrivateRoute roles={['student']}><StudentForm isViewMode={true} /></PrivateRoute>} />
          <Route path="/student/attendance" element={<PrivateRoute roles={['student']}><p className="text-center py-8">Student Attendance Coming Soon!</p></PrivateRoute>} />
          <Route path="/student/student-leaves" element={<PrivateRoute roles={['student']}><LeaveList /></PrivateRoute>} />

          {/* Teacher Module */}
          <Route path="/teacher/dashboard" element={<PrivateRoute roles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/staff/my-data" element={<PrivateRoute roles={['teacher', 'cook', 'cleaner', 'accountant']}><StaffForm isViewMode={true} /></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute roles={['admin', 'teacher']}><StudentList /></PrivateRoute>} />
          <Route path="/teacher/subjects" element={<PrivateRoute roles={['teacher']}><p className="text-center py-8">Teacher Subjects Management Coming Soon!</p></PrivateRoute>} />
          <Route path="/staff/staff-leaves" element={<PrivateRoute roles={['admin', 'teacher', 'cook', 'cleaner', 'accountant']}><StaffLeaveList /></PrivateRoute>} />
          <Route path="/teacher/student-leaves" element={<PrivateRoute roles={['teacher']}><LeaveList /></PrivateRoute>} />

          {/* Staff Module (Cook, Cleaner) */}
          <Route path="/staff/dashboard" element={<PrivateRoute roles={['cook', 'cleaner']}><StaffDashboard /></PrivateRoute>} />

          {/* Accountant Module */}
          <Route path="/accountant/dashboard" element={<PrivateRoute roles={['accountant']}><AccountantDashboard /></PrivateRoute>} />
          <Route path="/fees" element={<PrivateRoute roles={['admin', 'accountant', 'student']}><FeeList /></PrivateRoute>} />
          <Route path="/bills" element={<PrivateRoute roles={['admin', 'accountant']}><p className="text-center py-8">Bill Management Coming Soon!</p></PrivateRoute>} />
          <Route path="/donations" element={<PrivateRoute roles={['admin', 'accountant']}><p className="text-center py-8">Donation Management Coming Soon!</p></PrivateRoute>} />
          <Route path="/financial-reports" element={<PrivateRoute roles={['admin', 'accountant']}><p className="text-center py-8">Financial Reports Coming Soon!</p></PrivateRoute>} />

          {/* General Staff List (only Admin can view all staff) */}
          <Route path="/staff" element={<PrivateRoute roles={['admin']}><StaffList /></PrivateRoute>} />

          {/* Catch all for undefined routes - redirects to dashboard or login */}
          <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
};

export default App;