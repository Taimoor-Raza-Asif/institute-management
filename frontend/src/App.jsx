// src/App.jsx
import React, { useState, useEffect, useCallback, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import SalaryForm from './components/SalaryForm';
import StaffSalaryList from './components/StaffSalaryList';
import AssignClasses from './pages/AssignClasses';
import MyStudents from './pages/MyStudents';
import MySubjects from './components/MySubjects'; // New Import
import MarksList from './components/MarksList'; // New Import
import MarkingForm from './components/MarkingForm';
import RegisteredSubjects from './components/RegisteredSubjects';
import DonationManagement from './components/DonationManagement';
import BillingManagement from './components/BillingManagement';
import Reports from './pages/Reports';
import EditMarksForm from './components/EditMarksForm'; // New Import
import AcademicStructurePanel from './pages/AcademicStructurePanel';
import { ThemeProvider } from './context/ThemeContext'; 

export const UserContext = createContext(null);

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadUserFromLocalStorage = useCallback(() => {
    const raw = sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo');
    if (raw) {
      try {
        setCurrentUser(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse user info from storage", e);
        sessionStorage.removeItem('userInfo');
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
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userInfo');
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

  const roleDashboardPath = (role) => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      case 'student': return '/student/dashboard';
      case 'accountant': return '/accountant/dashboard';
      case 'cook':
      case 'cleaner':
        return '/staff/dashboard';
      default: return '/login';
    }
  };

  return (
    <ThemeProvider>
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <Router>
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default Route: Always start at login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes - Wrapped by PrivateRoute which includes Layout */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile/:role/:id" element={<PrivateRoute><ProfileScreen /> </PrivateRoute>} />

          <Route path="/attendance/mark" element={<PrivateRoute><AttendanceMarking /></PrivateRoute>} />
          <Route path="/attendance/my/:id" element={<PrivateRoute><MyAttendance /></PrivateRoute>} />
          <Route path="/attendance/all" element={<PrivateRoute roles={['admin', 'teacher']}><AllAttendanceRecords /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
          <Route path="/admin/access-control" element={<PrivateRoute roles={['admin']}><AccessControlPanel /></PrivateRoute>} />
          <Route path="/admin/student-leaves" element={<PrivateRoute roles={['admin']}><LeaveList /></PrivateRoute>} />
          <Route path="/admin/staff-leaves" element={<PrivateRoute roles={['admin']}><StaffLeaveList /></PrivateRoute>} />
          <Route path="/assign-classes" element={<PrivateRoute roles={['admin']}><AssignClasses /></PrivateRoute>} />
           <Route path="/admin/marks" element={<PrivateRoute roles={['admin']}><MarksList /></PrivateRoute>} /> {/* New Route */}
           
          <Route path="/academic-structure" element={<PrivateRoute roles={['admin']}><AcademicStructurePanel /></PrivateRoute>} />

          <Route path="/salaries" element={<PrivateRoute roles={['admin', 'accountant']}><StaffSalaryList /></PrivateRoute>} />
          <Route path="/salary/add" element={<PrivateRoute roles={['admin', 'accountant']}><SalaryForm /></PrivateRoute>} />
          <Route path="/salary/edit/:id" element={<PrivateRoute roles={['admin', 'accountant']}><SalaryForm /></PrivateRoute>} />

          <Route path="/donations" element={<PrivateRoute roles={['admin', 'accountant']}><DonationManagement /></PrivateRoute>} />
          <Route path="/billing" element={<PrivateRoute roles={['admin', 'accountant']}><BillingManagement /></PrivateRoute>} />
          <Route path="/financial-reports" element={<PrivateRoute roles={['admin', 'accountant']}><Reports /></PrivateRoute>} />
          {/* Staff-specific route */}
          <Route path="/my-salaries" element={<PrivateRoute><StaffSalaryList /></PrivateRoute>} />


          {/* Student Module */}
          <Route path="/student/dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/registered-subjects" element={<PrivateRoute roles={['student']}><RegisteredSubjects /></PrivateRoute>} />
          <Route path="/students/my-data" element={<PrivateRoute roles={['student']}><StudentForm isViewMode={true} /></PrivateRoute>} />
          <Route path="/student/attendance" element={<PrivateRoute roles={['student']}><p className="text-center py-8">Student Attendance Coming Soon!</p></PrivateRoute>} />
          <Route path="/student/student-leaves" element={<PrivateRoute roles={['student']}><LeaveList /></PrivateRoute>} />
           <Route path="/marks/student/:id" element={<PrivateRoute roles={['student']}><MarksList /></PrivateRoute>} /> {/* New Route */}

          {/* Teacher Module */}
          <Route path="/teacher/dashboard" element={<PrivateRoute roles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/staff/my-data" element={<PrivateRoute roles={['teacher', 'cook', 'cleaner', 'accountant']}><StaffForm isViewMode={true} /></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute roles={['admin', 'teacher']}><StudentList /></PrivateRoute>} />
          <Route path="/teacher/subjects" element={<PrivateRoute roles={['teacher']}><p className="text-center py-8">Teacher Subjects Management Coming Soon!</p></PrivateRoute>} />
          <Route path="/staff/staff-leaves" element={<PrivateRoute roles={['admin', 'teacher', 'cook', 'cleaner', 'accountant']}><StaffLeaveList /></PrivateRoute>} />
          <Route path="/teacher/student-leaves" element={<PrivateRoute roles={['teacher']}><LeaveList /></PrivateRoute>} />
          <Route path="/teacher/my-students" element={<PrivateRoute roles={['teacher']}><MyStudents currentUser={currentUser} /></PrivateRoute>} />
          <Route path="/teacher/my-subjects" element={<PrivateRoute roles={['teacher']}><MySubjects /></PrivateRoute>} />
          <Route path="/marks/add" element={<PrivateRoute roles={['teacher']}><MarkingForm /></PrivateRoute>} /> 
          <Route path="/marks/teacher/:id" element={<PrivateRoute roles={['teacher']}><MarksList /></PrivateRoute>} /> 
          <Route path="/attendance/students/assigned" element={<PrivateRoute roles={['teacher']}><AttendanceMarking /></PrivateRoute>} />
            <Route path="/marks/edit/:id" element={<EditMarksForm />} />
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

          {/* Catch all for undefined routes - redirects to role dashboard or login */}
          <Route path="*" element={<Navigate to={currentUser ? roleDashboardPath(currentUser.role) : "/login"} replace />} />
        </Routes>
      </Router>
    </UserContext.Provider>
    <ToastContainer 
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
    </ThemeProvider>
  );
};

export default App;