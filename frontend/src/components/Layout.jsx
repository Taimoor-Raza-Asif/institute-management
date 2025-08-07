// // src/components/Layout.jsx
// import React, { useState } from 'react'; // Import useState
// import { Link } from 'react-router-dom';
// import {
//   UserCircleIcon, Cog6ToothIcon, BriefcaseIcon, AcademicCapIcon,
//   BanknotesIcon, ChartBarIcon, PowerIcon, HomeIcon,
//   ClipboardDocumentListIcon, CalendarDaysIcon, BookOpenIcon,
//   Bars3Icon, XMarkIcon, ClockIcon, ClipboardDocumentCheckIcon, UserGroupIcon, WalletIcon
// } from '@heroicons/react/24/outline';

// const Layout = ({ children, currentUser, onLogout }) => {
//   // State to control sidebar visibility. Default to true (open) for desktop.
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };


//   const getMyProfileLink = () => {
//     if (!currentUser || !currentUser.profileId) return null; // No profile for admin or if profileId is missing

//     if (currentUser.role === 'student') {
//       return `/profile/student/${currentUser.profileId}`;
//     } else if (['admin', 'teacher', 'accountant', 'cook', 'cleaner'].includes(currentUser.role)) {
//       return `/profile/staff/${currentUser.profileId}`;
//     }
//     return null; // For admin or other roles not meant to have a 'My Profile' link
//   };

//   const myProfileLink = getMyProfileLink();

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
//           /* Transition for sidebar width and transform */
//           .sidebar-transition {
//             transition: width 0.3s ease-in-out, transform 0.3s ease-in-out;
//           }
//           /* Ensure content takes full width when sidebar is hidden */
//           @media (max-width: 767px) { /* Adjust breakpoint as needed, Tailwind's 'md' is 768px */
//             .main-content-full-width {
//               margin-left: 0 !important;
//               width: 100% !important;
//             }
//           }
//         `}
//       </style>

//       {/* Sidebar */}
//       {/* Only render sidebar if currentUser exists (i.e., user is logged in) */}
//       {currentUser && (
//         <aside
//           className={`
//             fixed top-0 left-0 h-full bg-gray-700 text-white flex flex-col p-4 shadow-lg z-30
//             sidebar-transition
//             ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
//             md:relative md:w-72 md:translate-x-0
//             overflow-y-auto custom-scrollbar
//           `}
//         >
//           <div className="flex justify-between items-center mb-6"> {/* Flex container for title and close button */}
//             <h1 className="text-2xl font-bold text-white flex-grow text-center pr-4 pt-8"> {/* Adjusted text-center and added pr-8 to make space for button */}
//               Jamia Tul Mastwaar
//             </h1>
//             <button
//               onClick={toggleSidebar}
//               className="md:hidden p-2 rounded-md text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               aria-label="Close sidebar"
//             >
//               <XMarkIcon className="h-6 w-6" />
//             </button>
//           </div>
//           <nav className="flex-grow pt-12">
//             <ul>
//               {myProfileLink && (
//                 <li className="mb-2">
//                   <Link to={myProfileLink} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                     <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                   </Link>
//                 </li>
//               )}

//               {/* Admin Links */}
//               {currentUser.role === 'admin' && (
//                 <>
//                   <li className="mb-2">
//                     <Link to="/admin/dashboard" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <HomeIcon className="h-5 w-5 mr-3" /> Admin Dashboard
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/students" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <AcademicCapIcon className="h-5 w-5 mr-3" /> Student Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/staff" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BriefcaseIcon className="h-5 w-5 mr-3" /> Staff Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/assign-classes" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BookOpenIcon className="h-5 w-5 mr-3" /> Assign Classes
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/salaries" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> Salary Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> Fees Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/admin/users" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <UserCircleIcon className="h-5 w-5 mr-3" /> User Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/admin/access-control" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <Cog6ToothIcon className="h-5 w-5 mr-3" /> Access Control
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/admin/student-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> Student Leaves
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/admin/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ClockIcon className="h-5 w-5 mr-3" /> Staff Leaves
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/attendance/mark" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ClipboardDocumentCheckIcon className="h-5 w-5 mr-3" /> Mark Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/attendance/all" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ChartBarIcon className="h-5 w-5 mr-3" /> All Attendance Records
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/donations" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> Donation Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/billing" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> Bills Management
//                     </Link>
//                   </li>
//                 </>
//               )}

//               {/* Student Links */}
//               {currentUser.role === 'student' && (
//                 <>
//                   <li className="mb-2">
//                     <Link to="/student/dashboard" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <HomeIcon className="h-5 w-5 mr-3" /> Student Dashboard
//                     </Link>
//                   </li>
//                   {/* <li className="mb-2">
//                     <Link to="/students/my-data" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                     </Link>
//                   </li> */}
//                   <li className="mb-2">
//                     <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> My Fees
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/student/student-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Leave Request
//                     </Link>
//                   </li>
//                 </>
//               )}

//               {/* Teacher Links */}
//               {currentUser.role === 'teacher' && (
//                 <>
//                   <li className="mb-2">
//                     <Link to="/teacher/dashboard" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <HomeIcon className="h-5 w-5 mr-3" /> Teacher Dashboard
//                     </Link>
//                   </li>
//                   {/* <li className="mb-2">
//                     <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                     </Link>
//                   </li> */}
//                   <li className="mb-2">
//                     <Link to="/teacher/my-students" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <UserGroupIcon className="h-5 w-5 mr-3" /> My Students
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/teacher/subjects" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BookOpenIcon className="h-5 w-5 mr-3" /> My Subjects
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/attendance/mark" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ClipboardDocumentCheckIcon className="h-5 w-5 mr-3" /> Mark Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/attendance/all" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ChartBarIcon className="h-5 w-5 mr-3" /> All Attendance Records
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/my-salaries" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> My Salaries
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/staff/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/teacher/student-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> Student Leave Requests
//                     </Link>
//                   </li>

//                 </>
//               )}



//               {/* Accountant Links */}
//               {currentUser.role === 'accountant' && (
//                 <>
//                   <li className="mb-2">
//                     <Link to="/accountant/dashboard" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <HomeIcon className="h-5 w-5 mr-3" /> Accountant Dashboard
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gray-780 transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> Fees Management
//                     </Link>
//                   </li>
//                   {/* <li className="mb-2">
//                     <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                     </Link>
//                   </li> */}
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                     </Link>
//                   </li>
//                   {/* <li className="mb-2">
//                     <Link to="/my-salaries" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> My Salaries
//                     </Link>
//                   </li> */}
//                   <li className="mb-2">
//                     <Link to="/salaries" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> Salary Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/bills" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> Bill Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/donations" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> Donation Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/billing" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> Bills Management
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/financial-reports" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ChartBarIcon className="h-5 w-5 mr-3" /> Financial Reports
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/staff/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
//                     </Link>
//                   </li>
//                 </>
//               )}

//               {/* Cook/Cleaner Links */}
//               {(currentUser.role === 'cook' || currentUser.role === 'cleaner') && (
//                 <>
//                   {/* <li className="mb-2">
//                     <Link to="/staff/my-data" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                     </Link>
//                   </li> */}
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/my-salaries" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> My Salaries
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/staff/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ClockIcon className="h-5 w-5 mr-3" /> {currentUser.role === 'cook' ? 'My Leave Request' : 'My Leave Request'}
//                     </Link>
//                   </li>
//                 </>
//               )}
//             </ul>
//           </nav>
//           <div className="mt-auto pt-4 border-t border-gray-800">
//             <p className="text-sm text-gray-400 mb-2 truncate" title={currentUser.cnic}>Logged in as: {currentUser.role} ({currentUser.cnic})</p>
//             <button
//               onClick={onLogout}
//               className="flex items-center justify-center w-full p-2 rounded-md bg-red-600 hover:bg-red-700 transition duration-200 text-white"
//             >
//               <PowerIcon className="h-5 w-5 mr-2" /> Logout
//             </button>
//           </div>
//         </aside>
//       )}

//       {/* Main Content */}
//       <main
//         className={`
//           flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
//           ${currentUser && isSidebarOpen ? 'md:ml-2' : 'md:ml-0 main-content-full-width'}
//         `}
//       >
//         <header className="bg-white shadow p-4 flex justify-between items-center flex-shrink-0">
//           {currentUser && ( // Only show hamburger and welcome if logged in
//             <button
//               onClick={toggleSidebar}
//               className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-4"
//               aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
//             >
//               {isSidebarOpen ? (
//                 <XMarkIcon className="h-6 w-6" />
//               ) : (
//                 <Bars3Icon className="h-6 w-6" />
//               )}
//             </button>
//           )}

//           <h1 className="text-xl font-semibold text-gray-800 flex-grow">
//             {currentUser ? `Welcome, ${currentUser.name || currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}!` : 'Welcome'}
//           </h1>
//           {/* Display current user's edit mode status if applicable */}
//           {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'student' || currentUser.role === 'cook' || currentUser.role === 'cleaner' || currentUser.role === 'accountant') && (
//             <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentUser.editModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//               Edit Mode: {currentUser.editModeEnabled ? 'Enabled' : 'Disabled'}
//             </span>
//           )}
//         </header>
//         <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Layout;



// // src/components/Layout.jsx
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   UserCircleIcon, Cog6ToothIcon, BriefcaseIcon, AcademicCapIcon,
//   BanknotesIcon, ChartBarIcon, PowerIcon, HomeIcon,
//   ClipboardDocumentListIcon, CalendarDaysIcon, BookOpenIcon,
//   Bars3Icon, XMarkIcon, ClockIcon, ClipboardDocumentCheckIcon, UserGroupIcon, WalletIcon,
//   ChevronDownIcon
// } from '@heroicons/react/24/outline';

// const Layout = ({ children, currentUser, onLogout }) => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   // CHANGE: Use an object to track the state of multiple dropdowns
//   const [openDropdowns, setOpenDropdowns] = useState({});

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   // CHANGE: The function now toggles a specific key in the state object
//   const toggleDropdown = (name) => {
//     setOpenDropdowns(prevState => ({
//       ...prevState,
//       [name]: !prevState[name],
//     }));
//   };

//   const getMyProfileLink = () => {
//     if (!currentUser || !currentUser.profileId) return null;

//     if (currentUser.role === 'student') {
//       return `/profile/student/${currentUser.profileId}`;
//     } else if (['admin', 'teacher', 'accountant', 'cook', 'cleaner'].includes(currentUser.role)) {
//       return `/profile/staff/${currentUser.profileId}`;
//     }
//     return null;
//   };

//   const myProfileLink = getMyProfileLink();

//   return (
//     <div className="flex h-screen bg-gray-100 font-inter">
//       <style>
//         {`
//           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//           body {
//             font-family: 'Inter', sans-serif;
//           }
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
//           .sidebar-transition {
//             transition: width 0.3s ease-in-out, transform 0.3s ease-in-out;
//           }
//           .main-content-full-width {
//             margin-left: 0 !important;
//             width: 100% !important;
//           }
//         `}
//       </style>

//       {currentUser && (
//         <aside
//           className={`
//             fixed top-0 left-0 h-full bg-gray-700 text-white flex flex-col p-4 shadow-lg z-30
//             sidebar-transition
//             ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
//             md:relative md:w-72 md:translate-x-0
//             overflow-y-auto custom-scrollbar
//           `}
//         >
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-2xl font-bold text-white flex-grow text-center pr-4 pt-8">
//               Jamia Tul Mastwaar
//             </h1>
//             <button
//               onClick={toggleSidebar}
//               className="md:hidden p-2 rounded-md text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               aria-label="Close sidebar"
//             >
//               <XMarkIcon className="h-6 w-6" />
//             </button>
//           </div>
//           <nav className="flex-grow pt-12">
//             <ul>
//               {currentUser.role === 'admin' && (
//                 <li className="mb-2">
//                   <Link to="/admin/dashboard" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                     <HomeIcon className="h-5 w-5 mr-3" /> Admin Dashboard
//                   </Link>
//                 </li>
//               )}
//               {currentUser.role === 'student' && (
//                 <li className="mb-2">
//                   <Link to="/student/dashboard" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                     <HomeIcon className="h-5 w-5 mr-3" /> Student Dashboard
//                   </Link>
//                 </li>
//               )}
//               {currentUser.role === 'teacher' && (
//                 <li className="mb-2">
//                   <Link to="/teacher/dashboard" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                     <HomeIcon className="h-5 w-5 mr-3" /> Teacher Dashboard
//                   </Link>
//                 </li>
//               )}
//               {currentUser.role === 'accountant' && (
//                 <li className="mb-2">
//                   <Link to="/accountant/dashboard" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                     <HomeIcon className="h-5 w-5 mr-3" /> Accountant Dashboard
//                   </Link>
//                 </li>
//               )}

//               {myProfileLink && (
//                 <li className="mb-2">
//                   <Link to={myProfileLink} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                     <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
//                   </Link>
//                 </li>
//               )}

//               {/* Admin Links */}
//               {currentUser.role === 'admin' && (
//                 <>
//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('user-management')}
//                       className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
//                     >
//                       <UserGroupIcon className="h-5 w-5 mr-3" />
//                       Users Management
//                       <ChevronDownIcon
//                         // CHANGE: Check the state object for the dropdown's state
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['user-management'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {/* CHANGE: Conditional rendering based on the state object */}
//                     {openDropdowns['user-management'] && (
//                       <ul className="mt-1 ml-4 border-l border-gray-500">
//                         <li>
//                           <Link to="/students" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <AcademicCapIcon className="h-5 w-5 mr-3" /> Student Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/staff" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BriefcaseIcon className="h-5 w-5 mr-3" /> Staff Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/admin/users" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <UserCircleIcon className="h-5 w-5 mr-3" /> User Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/admin/access-control" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <Cog6ToothIcon className="h-5 w-5 mr-3" /> Access Control
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>

//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('financial-management')}
//                       className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
//                     >
//                       <WalletIcon className="h-5 w-5 mr-3" />
//                       Financial Management
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['financial-management'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['financial-management'] && (
//                       <ul className="mt-1 ml-4 border-l border-gray-500">
//                         <li>
//                           <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BanknotesIcon className="h-5 w-5 mr-3" /> Fees Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/salaries" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BanknotesIcon className="h-5 w-5 mr-3" /> Salary Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/donations" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BanknotesIcon className="h-5 w-5 mr-3" /> Donation Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/billing" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BanknotesIcon className="h-5 w-5 mr-3" /> Bills Management
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>

//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('academic-management')}
//                       className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
//                     >
//                       <BookOpenIcon className="h-5 w-5 mr-3" />
//                       Academic & Attendance
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['academic-management'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['academic-management'] && (
//                       <ul className="mt-1 ml-4 border-l border-gray-500">
//                         <li>
//                           <Link to="/assign-classes" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BookOpenIcon className="h-5 w-5 mr-3" /> Assign Classes
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/attendance/mark" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <ClipboardDocumentCheckIcon className="h-5 w-5 mr-3" /> Mark Attendance
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/attendance/all" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <ChartBarIcon className="h-5 w-5 mr-3" /> All Attendance Records
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/admin/student-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <CalendarDaysIcon className="h-5 w-5 mr-3" /> Student Leaves
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/admin/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <ClockIcon className="h-5 w-5 mr-3" /> Staff Leaves
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>
//                 </>
//               )}

//               {/* Student Links (kept flat as before) */}
//               {currentUser.role === 'student' && (
//                 <>
//                   <li className="mb-2">
//                     <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> My Fees
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/student/student-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
//                     </Link>
//                   </li>
//                 </>
//               )}

//               {/* Teacher Links */}
//               {currentUser.role === 'teacher' && (
//                 <>
//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('teacher-classes')}
//                       className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
//                     >
//                       <AcademicCapIcon className="h-5 w-5 mr-3" />
//                       My Classes
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-classes'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['teacher-classes'] && (
//                       <ul className="mt-1 ml-4 border-l border-gray-500">
//                         <li>
//                           <Link to="/teacher/my-students" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <UserGroupIcon className="h-5 w-5 mr-3" /> My Students
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/teacher/subjects" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BookOpenIcon className="h-5 w-5 mr-3" /> My Subjects
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>

//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('teacher-attendance')}
//                       className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
//                     >
//                       <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
//                       Attendance & Leaves
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-attendance'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['teacher-attendance'] && (
//                       <ul className="mt-1 ml-4 border-l border-gray-500">
//                         <li>
//                           <Link to="/attendance/mark" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <ClipboardDocumentCheckIcon className="h-5 w-5 mr-3" /> Mark Attendance
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/attendance/all" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <ChartBarIcon className="h-5 w-5 mr-3" /> All Attendance Records
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/teacher/student-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <CalendarDaysIcon className="h-5 w-5 mr-3" /> Student Leave Requests
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/staff/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/my-salaries" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> My Salaries
//                     </Link>
//                   </li>
//                 </>
//               )}

//               {/* Accountant Links */}
//               {currentUser.role === 'accountant' && (
//                 <>
//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('accountant-finance')}
//                       className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
//                     >
//                       <WalletIcon className="h-5 w-5 mr-3" />
//                       Financial Management
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['accountant-finance'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['accountant-finance'] && (
//                       <ul className="mt-1 ml-4 border-l border-gray-500">
//                         <li>
//                           <Link to="/fees" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BanknotesIcon className="h-5 w-5 mr-3" /> Fees Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/salaries" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BanknotesIcon className="h-5 w-5 mr-3" /> Salary Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/bills" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BanknotesIcon className="h-5 w-5 mr-3" /> Bill Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/donations" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <BanknotesIcon className="h-5 w-5 mr-3" /> Donation Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/financial-reports" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                             <ChartBarIcon className="h-5 w-5 mr-3" /> Financial Reports
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/staff/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
//                     </Link>
//                   </li>
//                 </>
//               )}

//               {/* Cook/Cleaner Links (kept flat) */}
//               {(currentUser.role === 'cook' || currentUser.role === 'cleaner') && (
//                 <>
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/my-salaries" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <BanknotesIcon className="h-5 w-5 mr-3" /> My Salaries
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/staff/staff-leaves" className="flex items-center p-2 rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200">
//                       <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
//                     </Link>
//                   </li>
//                 </>
//               )}
//             </ul>
//           </nav>
//           <div className="mt-auto pt-4 border-t border-gray-800">
//             <p className="text-sm text-gray-400 mb-2 truncate" title={currentUser.cnic}>Logged in as: {currentUser.role} ({currentUser.cnic})</p>
//             <button
//               onClick={onLogout}
//               className="flex items-center justify-center w-full p-2 rounded-md bg-red-600 hover:bg-red-700 transition duration-200 text-white"
//             >
//               <PowerIcon className="h-5 w-5 mr-2" /> Logout
//             </button>
//           </div>
//         </aside>
//       )}

//       {/* Main Content */}
//       <main
//         className={`
//           flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
//           ${currentUser && isSidebarOpen ? 'md:ml-2' : 'md:ml-0 main-content-full-width'}
//         `}
//       >
//         <header className="bg-white shadow p-4 flex justify-between items-center flex-shrink-0">
//           {currentUser && (
//             <button
//               onClick={toggleSidebar}
//               className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-4"
//               aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
//             >
//               {isSidebarOpen ? (
//                 <XMarkIcon className="h-6 w-6" />
//               ) : (
//                 <Bars3Icon className="h-6 w-6" />
//               )}
//             </button>
//           )}

//           <h1 className="text-xl font-semibold text-gray-800 flex-grow">
//             {currentUser ? `Welcome, ${currentUser.name || currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}!` : 'Welcome'}
//           </h1>
//           {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'student' || currentUser.role === 'cook' || currentUser.role === 'cleaner' || currentUser.role === 'accountant') && (
//             <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentUser.editModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//               Edit Mode: {currentUser.editModeEnabled ? 'Enabled' : 'Disabled'}
//             </span>
//           )}
//         </header>
//         <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Layout;


// src/components/Layout.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon, Cog6ToothIcon, BriefcaseIcon, AcademicCapIcon,
  BanknotesIcon, ChartBarIcon, PowerIcon, HomeIcon,
  ClipboardDocumentListIcon, CalendarDaysIcon, BookOpenIcon,
  Bars3Icon, XMarkIcon, ClockIcon, ClipboardDocumentCheckIcon, UserGroupIcon, WalletIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children, currentUser, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (name) => {
    setOpenDropdowns(prevState => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const getMyProfileLink = () => {
    if (!currentUser || !currentUser.profileId) return null;

    if (currentUser.role === 'student') {
      return `/profile/student/${currentUser.profileId}`;
    } else if (['admin', 'teacher', 'accountant', 'cook', 'cleaner'].includes(currentUser.role)) {
      return `/profile/staff/${currentUser.profileId}`;
    }
    return null;
  };

  const myProfileLink = getMyProfileLink();

  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
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
          .sidebar-transition {
            transition: width 0.3s ease-in-out, transform 0.3s ease-in-out;
          }
          .main-content-full-width {
            margin-left: 0 !important;
            width: 100% !important;
          }
        `}
      </style>

      {currentUser && (
        <aside
          className={`
            fixed top-0 left-0 h-full 
            bg-gradient-to-r from-gray-700 to-gray-900 text-white flex flex-col p-4 shadow-lg z-30
            sidebar-transition
            ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
            md:relative md:w-72 md:translate-x-0
            overflow-y-auto custom-scrollbar
          `}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white flex-grow text-center pr-4 pt-8">
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
              {/* Dashboard and My Profile links get the new text-sm class and onClick */}
              {currentUser.role === 'admin' && (
                <li className="mb-2">
                  <Link to="/admin/dashboard" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                    <HomeIcon className="h-5 w-5 mr-3" /> Admin Dashboard
                  </Link>
                </li>
              )}
              {currentUser.role === 'student' && (
                <li className="mb-2">
                  <Link to="/student/dashboard" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                    <HomeIcon className="h-5 w-5 mr-3" /> Student Dashboard
                  </Link>
                </li>
              )}
              {currentUser.role === 'teacher' && (
                <li className="mb-2">
                  <Link to="/teacher/dashboard" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                    <HomeIcon className="h-5 w-5 mr-3" /> Teacher Dashboard
                  </Link>
                </li>
              )}
              {currentUser.role === 'accountant' && (
                <li className="mb-2">
                  <Link to="/accountant/dashboard" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                    <HomeIcon className="h-5 w-5 mr-3" /> Accountant Dashboard
                  </Link>
                </li>
              )}

              {myProfileLink && (
                <li className="mb-2">
                  <Link to={myProfileLink} className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                    <UserCircleIcon className="h-5 w-5 mr-3" /> My Profile
                  </Link>
                </li>
              )}

              {/* Admin Links */}
              {currentUser.role === 'admin' && (
                <>
                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('user-management')}
                      className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
                    >
                      <UserGroupIcon className="h-5 w-5 mr-3" />
                      Users Management
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['user-management'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['user-management'] && (
                      <ul className="mt-1 ml-4 border-l border-gray-500">
                        <li>
                          <Link to="/students" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <AcademicCapIcon className="h-5 w-5 mr-3" /> Student Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/staff" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BriefcaseIcon className="h-5 w-5 mr-3" /> Staff Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/users" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <UserCircleIcon className="h-5 w-5 mr-3" /> User Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/access-control" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <Cog6ToothIcon className="h-5 w-5 mr-3" /> Access Control
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>

                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('financial-management')}
                      className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
                    >
                      <WalletIcon className="h-5 w-5 mr-3" />
                      Financial Management
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['financial-management'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['financial-management'] && (
                      <ul className="mt-1 ml-4 border-l border-gray-500">
                        <li>
                          <Link to="/fees" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Fees Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/salaries" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Salary Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/donations" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Donation Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/billing" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Bills Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/financial-reports" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <ChartBarIcon className="h-5 w-5 mr-3" /> Financial Reports
                          </Link>
                        </li>

                      </ul>
                    )}
                  </li>

                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('academic-management')}
                      className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
                    >
                      <BookOpenIcon className="h-5 w-5 mr-3" />
                      Academic & Attendance
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['academic-management'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['academic-management'] && (
                      <ul className="mt-1 ml-4 border-l border-gray-500">
                        <li>
                          <Link to="/assign-classes" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BookOpenIcon className="h-5 w-5 mr-3" /> Assign Classes
                          </Link>
                        </li>
                        <li>
                          <Link to="/attendance/mark" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <ClipboardDocumentCheckIcon className="h-5 w-5 mr-3" /> Mark Attendance
                          </Link>
                        </li>
                        <li>
                          <Link to="/attendance/all" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <ChartBarIcon className="h-5 w-5 mr-3" /> All Attendance Records
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/student-leaves" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <CalendarDaysIcon className="h-5 w-5 mr-3" /> Student Leaves
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/staff-leaves" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <ClockIcon className="h-5 w-5 mr-3" /> Staff Leaves
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                </>
              )}

              {/* Student Links */}
              {currentUser.role === 'student' && (
                <>
                  <li className="mb-2">
                    <Link to="/fees" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                      <BanknotesIcon className="h-5 w-5 mr-3" /> My Fees
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                      <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/student/student-leaves" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                      <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
                    </Link>
                  </li>
                </>
              )}

              {/* Teacher Links */}
              {currentUser.role === 'teacher' && (
                <>
                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('teacher-classes')}
                      className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
                    >
                      <AcademicCapIcon className="h-5 w-5 mr-3" />
                      My Classes
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-classes'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['teacher-classes'] && (
                      <ul className="mt-1 ml-4 border-l border-gray-500">
                        <li>
                          <Link to="/teacher/my-students" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <UserGroupIcon className="h-5 w-5 mr-3" /> My Students
                          </Link>
                        </li>
                        <li>
                          <Link to="/teacher/subjects" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BookOpenIcon className="h-5 w-5 mr-3" /> My Subjects
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>

                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('teacher-attendance')}
                      className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
                    >
                      <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                      Attendance & Leaves
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-attendance'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['teacher-attendance'] && (
                      <ul className="mt-1 ml-4 border-l border-gray-500">
                        <li>
                          <Link to="/attendance/mark" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <ClipboardDocumentCheckIcon className="h-5 w-5 mr-3" /> Mark Attendance
                          </Link>
                        </li>
                        <li>
                          <Link to="/attendance/all" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <ChartBarIcon className="h-5 w-5 mr-3" /> All Attendance Records
                          </Link>
                        </li>
                        <li>
                          <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
                          </Link>
                        </li>
                        <li>
                          <Link to="/teacher/student-leaves" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <CalendarDaysIcon className="h-5 w-5 mr-3" /> Student Leave Requests
                          </Link>
                        </li>
                        <li>
                          <Link to="/staff/staff-leaves" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="mb-2">
                    <Link to="/my-salaries" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                      <BanknotesIcon className="h-5 w-5 mr-3" /> My Salaries
                    </Link>
                  </li>
                </>
              )}

              {/* Accountant Links */}
              {currentUser.role === 'accountant' && (
                <>
                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('accountant-finance')}
                      className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200 cursor-pointer"
                    >
                      <WalletIcon className="h-5 w-5 mr-3" />
                      Financial Management
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['accountant-finance'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['accountant-finance'] && (
                      <ul className="mt-1 ml-4 border-l border-gray-500">
                        <li>
                          <Link to="/fees" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Fees Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/salaries" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Salary Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/billing" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Bill Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/donations" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Donation Management
                          </Link>
                        </li>
                        <li>
                          <Link to="/financial-reports" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                            <ChartBarIcon className="h-5 w-5 mr-3" /> Financial Reports
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="mb-2">
                    <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                      <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff/staff-leaves" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                      <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
                    </Link>
                  </li>
                </>
              )}

              {/* Cook/Cleaner Links */}
              {(currentUser.role === 'cook' || currentUser.role === 'cleaner') && (
                <>
                  <li className="mb-2">
                    <Link to={`/attendance/my/${currentUser.profileId}`} className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                      <CalendarDaysIcon className="h-5 w-5 mr-3" /> My Attendance
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/my-salaries" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                      <BanknotesIcon className="h-5 w-5 mr-3" /> My Salaries
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/staff/staff-leaves" className="flex items-center p-2 text-sm md:text-base rounded-md hover:bg-gradient-to-r from-gray-800 to-white transition duration-200" onClick={toggleSidebar}>
                      <ClockIcon className="h-5 w-5 mr-3" /> My Leave Request
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <div className="mt-auto pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-2 truncate" title={currentUser.cnic}>Logged in as: {currentUser.cnic})</p>
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
          {currentUser && (
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