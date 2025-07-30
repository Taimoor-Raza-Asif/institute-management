// // src/components/Layout.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { UserCircleIcon, Cog6ToothIcon, BriefcaseIcon, AcademicCapIcon, BanknotesIcon, ChartBarIcon, PowerIcon, HomeIcon, ClipboardDocumentListIcon, CalendarDaysIcon, BookOpenIcon } from '@heroicons/react/24/outline'; // Example icons

// const Layout = ({ children, currentUser, onLogout }) => {
//   return (
//     <div className="flex h-screen bg-gray-100 font-inter">
//       {/* Tailwind CSS Font Import (ensure it's loaded in your public/index.html or main CSS) */}
//       <style>
//         {`
//           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//           body {
//             font-family: 'Inter', sans-serif;
//           }
//           /* Custom scrollbar for overflow-y-auto */
//           .custom-scrollbar::-webkit-scrollbar {
//             width: 8px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-track {
//             background: #f1f1f1;
//             border-radius: 10px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb {
//             background: #888;
//             border-radius: 10px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//             background: #555;
//           }
//         `}
//       </style>
//       {/* Sidebar */}
//       <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
//         <div className="text-2xl font-bold mb-6 text-center text-indigo-300">
//           SMS
//         </div>
//         <nav className="flex-grow overflow-y-auto custom-scrollbar">
//           <ul>
//             {currentUser && (
//               <>


//                 {/* Admin Links */}
//                 {currentUser.role === 'admin' && (
//                   <>
//                     <li className="mb-2">
//                       <Link to="/admin/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <HomeIcon className="h-5 w-5 mr-3" /> Admin Dashboard
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/students" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <AcademicCapIcon className="h-5 w-5 mr-3" /> Students
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/staff" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <BriefcaseIcon className="h-5 w-5 mr-3" /> Staff
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <BanknotesIcon className="h-5 w-5 mr-3" /> Fees
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/admin/users" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <UserCircleIcon className="h-5 w-5 mr-3" /> User Management
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/admin/access-control" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <Cog6ToothIcon className="h-5 w-5 mr-3" /> Access Control
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/admin/manage-leaves" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <ClipboardDocumentListIcon className="h-5 w-5 mr-3" /> Manage All Leaves
//                       </Link>
//                     </li>
//                     {/* Add other admin modules here */}
//                   </>
//                 )}

//                 {/* Student Links */}
//                 {currentUser.role === 'student' && (
//                   <>
//                     <li className="mb-2">
//                       <Link to="/student/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <HomeIcon className="h-5 w-5 mr-3" /> Student Dashboard
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/students/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <BanknotesIcon className="h-5 w-5 mr-3" /> My Fees
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/student/attendance" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                       </Link>
//                     </li>
//                   </>
//                 )}

//                 {/* Teacher Links */}
//                 {currentUser.role === 'teacher' && (
//                   <>
//                     <li className="mb-2">
//                       <Link to="/staff/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <HomeIcon className="h-5 w-5 mr-3" /> Staff Dashboard
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/students" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <AcademicCapIcon className="h-5 w-5 mr-3" /> My Students
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/teacher/subjects" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <BookOpenIcon className="h-5 w-5 mr-3" /> My Subjects
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                       </Link>
//                     </li>
//                   </>
//                 )}

//                 {/* Accountant Links */}
//                 {currentUser.role === 'accountant' && (
//                   <>
//                     <li className="mb-2">
//                       <Link to="/accountant/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <HomeIcon className="h-5 w-5 mr-3" /> Accountant Dashboard
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <BanknotesIcon className="h-5 w-5 mr-3" /> Fees Management
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/bills" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <BanknotesIcon className="h-5 w-5 mr-3" /> Bill Management
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/donations" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <BanknotesIcon className="h-5 w-5 mr-3" /> Donation Management
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/financial-reports" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <ChartBarIcon className="h-5 w-5 mr-3" /> Financial Reports
//                       </Link>
//                     </li>
//                   </>
//                 )}

//                 {/* Cook/Cleaner Links */}
//                 {(currentUser.role === 'cook' || currentUser.role === 'cleaner') && (
//                   <>
//                     <li className="mb-2">
//                       <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                       </Link>
//                     </li>
//                     <li className="mb-2">
//                       <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
//                         <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                       </Link>
//                     </li>
//                   </>
//                 )}
//               </>
//             )}
//           </ul>
//         </nav>
//         {currentUser && (
//           <div className="mt-auto pt-4 border-t border-gray-700">
//             <p className="text-sm text-gray-400 mb-2 truncate" title={currentUser.cnic}>Logged in as: {currentUser.role} ({currentUser.cnic})</p>
//             <button
//               onClick={onLogout}
//               className="flex items-center justify-center w-full p-2 rounded-md bg-red-600 hover:bg-red-700 transition duration-200 text-white"
//             >
//               <PowerIcon className="h-5 w-5 mr-2" /> Logout
//             </button>
//           </div>
//         )}
//       </aside>

//       {/* Main Content */}
// <main className="flex-1 flex flex-col overflow-hidden">
//   <header className="bg-white shadow p-4 flex justify-between items-center flex-shrink-0">
//     <h1 className="text-xl font-semibold text-gray-800">
//       {currentUser ? `Welcome, ${currentUser.name || currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}!` : 'Welcome'}
//     </h1>
//     {/* Display current user's edit mode status if applicable */}
//     {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'student' || currentUser.role === 'cook' || currentUser.role === 'cleaner' || currentUser.role === 'accountant') && (
//       <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentUser.editModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//         Edit Mode: {currentUser.editModeEnabled ? 'Enabled' : 'Disabled'}
//       </span>
//     )}
//   </header>
//   <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
//     {children}
//   </div>
// </main>
//     </div>
//   );
// };

// export default Layout;




// src/components/Layout.jsx
import React, { useState } from 'react'; // Import useState
import { Link } from 'react-router-dom';
import {
  UserCircleIcon, Cog6ToothIcon, BriefcaseIcon, AcademicCapIcon,
  BanknotesIcon, ChartBarIcon, PowerIcon, HomeIcon,
  ClipboardDocumentListIcon, CalendarDaysIcon, BookOpenIcon,
  Bars3Icon, XMarkIcon, ClockIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children, currentUser, onLogout }) => {
  // State to control sidebar visibility. Default to true (open) for desktop.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      {/* Tailwind CSS Font Import (ensure it's loaded in your public/index.html or main CSS) */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          /* Custom scrollbar for overflow-y-auto */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          /* Transition for sidebar width and transform */
          .sidebar-transition {
            transition: width 0.3s ease-in-out, transform 0.3s ease-in-out;
          }
          /* Ensure content takes full width when sidebar is hidden */
          @media (max-width: 767px) { /* Adjust breakpoint as needed, Tailwind's 'md' is 768px */
            .main-content-full-width {
              margin-left: 0 !important;
              width: 100% !important;
            }
          }
        `}
      </style>

      {/* Sidebar */}
      {/* Only render sidebar if currentUser exists (i.e., user is logged in) */}
      {currentUser && (
        <aside
          className={`
            fixed top-0 left-0 h-full bg-gray-700 text-white flex flex-col p-4 shadow-lg z-30
            sidebar-transition
            ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
            md:relative md:w-72 md:translate-x-0
            overflow-y-auto custom-scrollbar
          `}
        >
          <div className="flex justify-between items-center mb-6"> {/* Flex container for title and close button */}
            <h1 className="text-2xl font-bold text-white flex-grow text-center pr-4 pt-8"> {/* Adjusted text-center and added pr-8 to make space for button */}
              Jamia Tul Mastwaar
            </h1>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-md text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-grow pt-12">
            <ul>
              {/* Admin Links */}
              {currentUser.role === 'admin' && (
                <>
                  <li className="mb-2">
                    <Link to="/admin/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <HomeIcon className="h-5 w-5 mr-3" /> Admin Dashboard
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/students" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <AcademicCapIcon className="h-5 w-5 mr-3" /> Student Management
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <BriefcaseIcon className="h-5 w-5 mr-3" /> Staff Management
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <BanknotesIcon className="h-5 w-5 mr-3" /> Fees Management
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/admin/users" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <UserCircleIcon className="h-5 w-5 mr-3" /> User Management
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/admin/access-control" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <Cog6ToothIcon className="h-5 w-5 mr-3" /> Access Control
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/admin/student-leaves" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
                      <CalendarDaysIcon className="h-5 w-5 mr-3" /> Student Leaves
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/admin/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
                      <ClockIcon className="h-5 w-5 mr-3" /> Staff Leaves
                    </Link>
                  </li>
                  {/* Add other admin modules here */}
                </>
              )}

              {/* Student Links */}
              {currentUser.role === 'student' && (
                <>
                  <li className="mb-2">
                    <Link to="/student/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <HomeIcon className="h-5 w-5 mr-3" /> Student Dashboard
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/students/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <BanknotesIcon className="h-5 w-5 mr-3" /> My Fees
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/student/attendance" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/student/student-leaves" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
                      <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Leave Request
                    </Link>
                  </li>
                </>
              )}

              {/* Teacher Links */}
              {currentUser.role === 'teacher' && (
                <>
                  <li className="mb-2">
                    <Link to="/teacher/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <HomeIcon className="h-5 w-5 mr-3" /> Teacher Dashboard
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/students" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <AcademicCapIcon className="h-5 w-5 mr-3" /> My Students
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/teacher/subjects" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <BookOpenIcon className="h-5 w-5 mr-3" /> My Subjects
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
                      <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/teacher/student-leaves" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
                      <CalendarDaysIcon className="h-5 w-5 mr-3" /> Student Leave Requests
                    </Link>
                  </li>
                </>
              )}

              {/* Accountant Links */}
              {currentUser.role === 'accountant' && (
                <>
                  <li className="mb-2">
                    <Link to="/accountant/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <HomeIcon className="h-5 w-5 mr-3" /> Accountant Dashboard
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gray-780 transition duration-200">
                      <BanknotesIcon className="h-5 w-5 mr-3" /> Fees Management
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/bills" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <BanknotesIcon className="h-5 w-5 mr-3" /> Bill Management
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/donations" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <BanknotesIcon className="h-5 w-5 mr-3" /> Donation Management
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/financial-reports" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <ChartBarIcon className="h-5 w-5 mr-3" /> Financial Reports
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
                      <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
                    </Link>
                  </li>
                </>
              )}

              {/* Cook/Cleaner Links */}
              {(currentUser.role === 'cook' || currentUser.role === 'cleaner') && (
                <>
                  <li className="mb-2">
                    <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gray-800 transition duration-200">
                      <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gray-700 transition duration-200">
                      <ClockIcon className="h-5 w-5 mr-3" /> {currentUser.role === 'cook' ? 'Cook Leave Request' : 'Cleaner Leave Request'}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <div className="mt-auto pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-2 truncate" title={currentUser.cnic}>Logged in as: {currentUser.role} ({currentUser.cnic})</p>
            <button
              onClick={onLogout}
              className="flex items-center justify-center w-full p-2 rounded-md bg-red-600 hover:bg-red-700 transition duration-200 text-white"
            >
              <PowerIcon className="h-5 w-5 mr-2" /> Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main
        className={`
          flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
          ${currentUser && isSidebarOpen ? 'md:ml-2' : 'md:ml-0 main-content-full-width'}
        `}
      >
        <header className="bg-white shadow p-4 flex justify-between items-center flex-shrink-0">
          {currentUser && ( // Only show hamburger and welcome if logged in
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-4"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          )}

          <h1 className="text-xl font-semibold text-gray-800 flex-grow">
            {currentUser ? `Welcome, ${currentUser.name || currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}!` : 'Welcome'}
          </h1>
          {/* Display current user's edit mode status if applicable */}
          {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'student' || currentUser.role === 'cook' || currentUser.role === 'cleaner' || currentUser.role === 'accountant') && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentUser.editModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Edit Mode: {currentUser.editModeEnabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;