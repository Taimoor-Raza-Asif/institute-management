// // src/components/Layout.jsx
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   UserCircleIcon, Cog6ToothIcon, BriefcaseIcon, AcademicCapIcon,
//   BanknotesIcon, ChartBarIcon, PowerIcon, HomeIcon,
//   ClipboardDocumentListIcon, CalendarDaysIcon, BookOpenIcon,
//   Bars3Icon, XMarkIcon, ClockIcon, ClipboardDocumentCheckIcon, UserGroupIcon, WalletIcon,
//   ChevronDownIcon, PaintBrushIcon // Icon for theme selector
// } from '@heroicons/react/24/outline';

// // --- THEME DEFINITIONS ---
// // Define distinct color combinations using Tailwind classes for easy application.
// const themes = {
//   // Theme 1: Original Green (Light) - Default
//   Green: {
//     sidebarClasses: 'bg-gradient-to-r from-green-100 to-white text-gray-800 border-r-2 border-green-200',
//     headerText: 'text-green-800',
//     linkHover: 'hover:bg-gradient-to-r hover:from-gray-300 hover:to-green-500 hover:text-black',
//     linkText: 'text-gray-800',
//     mainBg: 'bg-gray-50',
//     logoSvg: 'text-green-600',
//   },
//   // Theme 2: General Dark (New Dark Mode)
//   'General Dark': {
//     sidebarClasses: 'bg-gray-700 text-gray-200 border-r-2 border-gray-600',
//     headerText: 'text-white',
//     linkHover: 'hover:bg-gray-600 hover:text-white',
//     linkText: 'text-gray-200',
//     mainBg: 'bg-gray-900',
//     logoSvg: 'text-gray-400',
//   },
//   // Theme 3: Deep Blue (Dark Mode)
//   'Deep Blue': {
//     sidebarClasses: 'bg-gray-900 text-white border-r-2 border-blue-700',
//     headerText: 'text-blue-500',
//     linkHover: 'hover:bg-blue-800 hover:text-white',
//     linkText: 'text-gray-300',
//     mainBg: 'bg-gray-800',
//     logoSvg: 'text-blue-500',
//   },
//   // Theme 4: Royal Purple (Vibrant Light)
//   'Royal Purple': {
//     sidebarClasses: 'bg-purple-50 text-purple-900 border-r-2 border-purple-300',
//     headerText: 'text-purple-800',
//     linkHover: 'hover:bg-purple-200 hover:text-purple-900',
//     linkText: 'text-purple-800',
//     mainBg: 'bg-white',
//     logoSvg: 'text-purple-600',
//   },
//   // Theme 5: Sunset Orange (Warm Light)
//   'Sunset Orange': {
//     sidebarClasses: 'bg-orange-50 text-orange-900 border-r-2 border-orange-200',
//     headerText: 'text-orange-800',
//     linkHover: 'hover:bg-orange-200 hover:text-orange-900',
//     linkText: 'text-orange-800',
//     mainBg: 'bg-white',
//     logoSvg: 'text-orange-500',
//   },
//   // Theme 6: Black & Teal (Contrast Dark Mode)
//   'Black & Teal': {
//     sidebarClasses: 'bg-gray-800 text-teal-300 border-r-2 border-teal-500',
//     headerText: 'text-teal-400',
//     linkHover: 'hover:bg-teal-700 hover:text-white',
//     linkText: 'text-teal-300',
//     mainBg: 'bg-gray-900',
//     logoSvg: 'text-teal-500',
//   },
//   // Theme 7: Vibrant Magenta (New Theme)
//   'Vibrant Magenta': {
//     sidebarClasses: 'bg-pink-100 text-pink-900 border-r-2 border-pink-400',
//     headerText: 'text-pink-700',
//     linkHover: 'hover:bg-pink-300 hover:text-pink-900',
//     linkText: 'text-pink-800',
//     mainBg: 'bg-white',
//     logoSvg: 'text-pink-600',
//   }
// };

// const defaultThemeName = 'Green';

// const Layout = ({ children, currentUser, onLogout }) => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [openDropdowns, setOpenDropdowns] = useState({});

//   // Initialize theme from localStorage, or use default
//   const [currentThemeName, setCurrentThemeName] = useState(() => {
//     return localStorage.getItem('appTheme') || defaultThemeName;
//   });

//   const currentTheme = themes[currentThemeName] || themes[defaultThemeName];

//   // Effect to save theme name to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('appTheme', currentThemeName);
//   }, [currentThemeName]);

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

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

//   const getMyMarksLink = () => {
//     if (!currentUser || !currentUser.profileId) {
//       return null;
//     }
//     if (currentUser.role === 'teacher') {
//       return `/marks/teacher/${currentUser.profileId}`;
//     }
//     if (currentUser.role === 'student') {
//       return `/marks/student/${currentUser.profileId}`;
//     }
//     return null;
//   };

//   const myProfileLink = getMyProfileLink();

//   // Component for theme selection UI
//   const ThemeSelector = () => {
//     const themeNames = Object.keys(themes);

//     return (
//       <li className="mb-2">
//         <div
//           onClick={() => toggleDropdown('theme-selector')}
//           className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} cursor-pointer`}
//         >
//           <PaintBrushIcon className={`h-5 w-5 mr-3 ${currentTheme.linkText}`} />
//           <span className={`${currentTheme.linkText}`}>Theme: {currentThemeName}</span>
//           <ChevronDownIcon
//             className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['theme-selector'] ? 'rotate-180' : ''} ${currentTheme.linkText}`}
//           />
//         </div>
//         {openDropdowns['theme-selector'] && (
//           <ul className="mt-1 ml-4 border-l border-current">
//             {themeNames.map((name) => (
//               <li key={name}>
//                 <button
//                   onClick={() => {
//                     setCurrentThemeName(name);
//                     setOpenDropdowns({}); // Close dropdown after selection
//                   }}
//                   className={`flex items-center w-full text-left p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentThemeName === name ? 'font-bold underline' : ''}`}
//                 >
//                   <span className={`${currentTheme.linkText}`}>{name}</span>
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </li>
//     );
//   };


//   return (
//     <div className={`flex h-screen font-inter ${currentTheme.mainBg}`}>
//       <style>
//         {`
//           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//           body {
//             font-family: 'Inter', sans-serif;
//           }
//           /* Custom scrollbar to respect dark/light modes */
//           .custom-scrollbar::-webkit-scrollbar {
//             width: 8px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-track { 
//             background: ${currentTheme.mainBg.includes('dark') || currentTheme.mainBg.includes('gray-800') || currentTheme.mainBg.includes('gray-900') ? '#374151' : '#f1f1f1'};
//             border-radius: 10px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb {
//             background: ${currentTheme.mainBg.includes('dark') || currentTheme.mainBg.includes('gray-800') || currentTheme.mainBg.includes('gray-900') ? '#6b7280' : '#888'};
//             border-radius: 10px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//             background: ${currentTheme.mainBg.includes('dark') || currentTheme.mainBg.includes('gray-800') || currentTheme.mainBg.includes('gray-900') ? '#9ca3af' : '#555'};
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
//             fixed top-0 left-0 h-full 
//             ${currentTheme.sidebarClasses} 
//             flex flex-col p-4 shadow-xl z-30
//             sidebar-transition
//             ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
//             md:relative md:w-72 md:translate-x-0
//             overflow-y-auto custom-scrollbar
//           `}
//         >
//           <div className="flex flex-col items-center justify-center mb-6 pt-6">
//             {/* Logo SVG (Placeholder) */}
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className={`h-12 w-12 mb-2 ${currentTheme.logoSvg}`}
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M12 2l10 5-10 5-10-5 10-5zm0 17l10-5-10-5-10 5 10 5zm0-9l10-5-10-5-10 5 10 5z" />
//             </svg>
//             <h1 className={`text-2xl font-bold ${currentTheme.headerText} text-center`}>
//               Jamia Tul Mastwaar
//             </h1>
//             <button
//               onClick={toggleSidebar}
//               className="md:hidden p-2 rounded-md absolute top-2 right-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//               aria-label="Close sidebar"
//             >
//               <XMarkIcon className={`h-6 w-6 ${currentTheme.headerText}`} />
//             </button>
//           </div>
//           <nav className="flex-grow pt-4">
//             <ul>
//               {/* Theme Selector */}
//               <ThemeSelector />

//               {/* Dashboard Links */}
//               {currentUser.role === 'admin' && (
//                 <li className="mb-2">
//                   <Link to="/admin/dashboard" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                     <HomeIcon className={`h-5 w-5 mr-3`} /> Admin Dashboard
//                   </Link>
//                 </li>
//               )}
//               {currentUser.role === 'student' && (
//                 <li className="mb-2">
//                   <Link to="/student/dashboard" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                     <HomeIcon className={`h-5 w-5 mr-3`} /> Student Dashboard
//                   </Link>
//                 </li>
//               )}
//               {currentUser.role === 'teacher' && (
//                 <li className="mb-2">
//                   <Link to="/teacher/dashboard" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                     <HomeIcon className={`h-5 w-5 mr-3`} /> Teacher Dashboard
//                   </Link>
//                 </li>
//               )}
//               {currentUser.role === 'accountant' && (
//                 <li className="mb-2">
//                   <Link to="/accountant/dashboard" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                     <HomeIcon className={`h-5 w-5 mr-3`} /> Accountant Dashboard
//                   </Link>
//                 </li>
//               )}

//               {myProfileLink && (
//                 <li className="mb-2">
//                   <Link to={myProfileLink} className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                     <UserCircleIcon className={`h-5 w-5 mr-3`} /> My Profile
//                   </Link>
//                 </li>
//               )}

//               {/* Admin Links */}
//               {currentUser.role === 'admin' && (
//                 <>
//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('user-management')}
//                       className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer ${currentTheme.linkText}`}
//                     >
//                       <UserGroupIcon className={`h-5 w-5 mr-3`} />
//                       Users Management
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['user-management'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['user-management'] && (
//                       <ul className="mt-1 ml-4 border-l border-current">
//                         <li>
//                           <Link to="/students" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <AcademicCapIcon className={`h-5 w-5 mr-3`} /> Student Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/staff" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BriefcaseIcon className={`h-5 w-5 mr-3`} /> Staff Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/admin/users" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <UserCircleIcon className={`h-5 w-5 mr-3`} /> User Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/admin/access-control" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <Cog6ToothIcon className={`h-5 w-5 mr-3`} /> Access Control
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>

//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('financial-management')}
//                       className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer ${currentTheme.linkText}`}
//                     >
//                       <WalletIcon className={`h-5 w-5 mr-3`} />
//                       Financial Management
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['financial-management'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['financial-management'] && (
//                       <ul className="mt-1 ml-4 border-l border-current">
//                         <li>
//                           <Link to="/fees" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BanknotesIcon className={`h-5 w-5 mr-3`} /> Fees Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/salaries" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BanknotesIcon className={`h-5 w-5 mr-3`} /> Salary Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/donations" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BanknotesIcon className={`h-5 w-5 mr-3`} /> Donation Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/billing" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BanknotesIcon className={`h-5 w-5 mr-3`} /> Bills Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/financial-reports" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ChartBarIcon className={`h-5 w-5 mr-3`} /> Financial Reports
//                           </Link>
//                         </li>

//                       </ul>
//                     )}
//                   </li>

//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('academic-management')}
//                       className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer ${currentTheme.linkText}`}
//                     >
//                       <BookOpenIcon className={`h-5 w-5 mr-3`} />
//                       Academic & Attendance
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['academic-management'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['academic-management'] && (
//                       <ul className="mt-1 ml-4 border-l border-current">
//                            <li>
//                           <Link to="/academic-structure" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <AcademicCapIcon className={`h-5 w-5 mr-3`} /> Academic Structure
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/assign-classes" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BookOpenIcon className={`h-5 w-5 mr-3`} /> Assign Classes
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/attendance/mark" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ClipboardDocumentCheckIcon className={`h-5 w-5 mr-3`} /> Mark Attendance
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/attendance/all" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ChartBarIcon className={`h-5 w-5 mr-3`} /> All Attendance Records
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/admin/student-leaves" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> Student Leaves
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/admin/staff-leaves" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ClockIcon className={`h-5 w-5 mr-3`} /> Staff Leaves
//                           </Link>
//                         </li>
//                         <li className="mb-2">
//                           <Link to="/admin/marks" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ClockIcon className={`h-5 w-5 mr-3`} /> View Marks
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>
//                 </>
//               )}

//               {/* Student Links */}
//               {currentUser.role === 'student' && (
//                 <>
//                   <li className="mb-2">
//                     <Link to="/fees" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <BanknotesIcon className={`h-5 w-5 mr-3`} /> My Fees
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/student/student-leaves" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to={getMyMarksLink()}  className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <ClockIcon className={`h-5 w-5 mr-3`} /> My Marks
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
//                       className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer ${currentTheme.linkText}`}
//                     >
//                       <AcademicCapIcon className={`h-5 w-5 mr-3`} />
//                       My Classes
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-classes'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['teacher-classes'] && (
//                       <ul className="mt-1 ml-4 border-l border-current">
//                         <li>
//                           <Link to="/teacher/my-students" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <UserGroupIcon className={`h-5 w-5 mr-3`} /> My Students
//                           </Link>
//                         </li>
//                         <li>  
//                           <Link to="/teacher/my-subjects" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BookOpenIcon className={`h-5 w-5 mr-3`} /> My Subjects
//                           </Link> 
//                         </li>

//                         <li className="mb-2">
//                           <Link to="/marks/add" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ClockIcon className={`h-5 w-5 mr-3`} /> Add Marks
//                           </Link>
//                         </li>
//                         <li className="mb-2">
//                           <Link to={getMyMarksLink()} className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ClockIcon className={`h-5 w-5 mr-3`} /> View Marks
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>

//                   <li className="mb-2">
//                     <div
//                       onClick={() => toggleDropdown('teacher-attendance')}
//                       className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer ${currentTheme.linkText}`}
//                     >
//                       <ClipboardDocumentListIcon className={`h-5 w-5 mr-3`} />
//                       Attendance & Leaves
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-attendance'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['teacher-attendance'] && (
//                       <ul className="mt-1 ml-4 border-l border-current">
//                         <li>
//                           <Link to="/attendance/students/assigned" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ClipboardDocumentCheckIcon className={`h-5 w-5 mr-3`} /> Mark Attendance
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/attendance/all" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ChartBarIcon className={`h-5 w-5 mr-3`} /> All Attendance Records
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to={`/attendance/my/${currentUser.profileId}`} className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/teacher/student-leaves" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> Student Leave Requests
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/staff/staff-leaves" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/my-salaries" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <BanknotesIcon className={`h-5 w-5 mr-3`} /> My Salaries
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
//                       className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer ${currentTheme.linkText}`}
//                     >
//                       <WalletIcon className={`h-5 w-5 mr-3`} />
//                       Financial Management
//                       <ChevronDownIcon
//                         className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['accountant-finance'] ? 'rotate-180' : ''}`}
//                       />
//                     </div>
//                     {openDropdowns['accountant-finance'] && (
//                       <ul className="mt-1 ml-4 border-l border-current">
//                         <li>
//                           <Link to="/fees" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BanknotesIcon className={`h-5 w-5 mr-3`} /> Fees Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/salaries" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BanknotesIcon className={`h-5 w-5 mr-3`} /> Salary Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/billing" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BanknotesIcon className={`h-5 w-5 mr-3`} /> Bill Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/donations" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <BanknotesIcon className={`h-5 w-5 mr-3`} /> Donation Management
//                           </Link>
//                         </li>
//                         <li>
//                           <Link to="/financial-reports" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                             <ChartBarIcon className={`h-5 w-5 mr-3`} /> Financial Reports
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </li>
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/staff/staff-leaves" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request
//                     </Link>
//                   </li>
//                 </>
//               )}

//               {/* Cook/Cleaner Links */}
//               {(currentUser.role === 'cook' || currentUser.role === 'cleaner') && (
//                 <>
//                   <li className="mb-2">
//                     <Link to={`/attendance/my/${currentUser.profileId}`} className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/my-salaries" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <BanknotesIcon className={`h-5 w-5 mr-3`} /> My Salaries
//                     </Link>
//                   </li>
//                   <li className="mb-2">
//                     <Link to="/staff/staff-leaves" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText}`} onClick={toggleSidebar}>
//                       <ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request
//                     </Link>
//                   </li>
//                 </>
//               )}
//             </ul>
//           </nav>
//           <div className="mt-auto pt-4 border-t border-current">
//             <p className={`text-sm mb-2 truncate ${currentTheme.linkText}`} title={currentUser.cnic}>Logged in as: {currentUser.cnic})</p>
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
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx'; // <-- FIX: Ensures correct file resolution
import {
  UserCircleIcon, Cog6ToothIcon, BriefcaseIcon, AcademicCapIcon,
  BanknotesIcon, ChartBarIcon, PowerIcon, HomeIcon,
  ClipboardDocumentListIcon, CalendarDaysIcon, BookOpenIcon,
  Bars3Icon, XMarkIcon, ClockIcon, ClipboardDocumentCheckIcon, UserGroupIcon, WalletIcon,
  ChevronDownIcon, PaintBrushIcon // Icon for theme selector
} from '@heroicons/react/24/outline';


const Layout = ({ children, currentUser, onLogout }) => {
  // --- Theme Context Consumption ---
  // Get theme values from the global context
  const { currentThemeName, currentTheme, themes, setCurrentThemeName } = useTheme();

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

  const getMyMarksLink = () => {
    if (!currentUser || !currentUser.profileId) {
      return null;
    }
    if (currentUser.role === 'teacher') {
      return `/marks/teacher/${currentUser.profileId}`;
    }
    if (currentUser.role === 'student') {
      return `/marks/student/${currentUser.profileId}`;
    }
    return null;
  };

  const myProfileLink = getMyProfileLink();

  // Helper: active tab styles per theme and shared class builder for NavLink
  const activeClassesMap = {
    'Green': 'bg-green-600 text-white',
    'General Dark': 'bg-gray-600 text-white',
    'Deep Blue': 'bg-blue-800 text-white',
    'Royal Purple': 'bg-purple-600 text-white',
    'Sunset Orange': 'bg-orange-600 text-white',
    'Black & Teal': 'bg-teal-700 text-white',
    'Vibrant Magenta': 'bg-pink-600 text-white',
  };
  const activeClasses = activeClassesMap[currentThemeName] || 'bg-green-600 text-white';
  const navClass = ({ isActive }) => `flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText} ${isActive ? activeClasses : ''}`;

  // Component for theme selection UI
  const ThemeSelector = () => {
    // We only expose theme names in the selector for brevity
    const themeNames = Object.keys(themes);

    return (
      <li className="mb-2">
        <div
          onClick={() => toggleDropdown('theme-selector')}
          className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} cursor-pointer ${currentTheme.linkText}`}
        >
          <PaintBrushIcon className={`h-5 w-5 mr-3`} />
          <span>Theme: {currentThemeName}</span>
          <ChevronDownIcon
            className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['theme-selector'] ? 'rotate-180' : ''}`}
          />
        </div>
        {openDropdowns['theme-selector'] && (
          <ul className={`mt-1 ml-4 border-l ${currentTheme.border} ${currentTheme.linkText}`}>
            {themeNames.map((name) => (
              <li key={name}>
                <button
                  onClick={() => {
                    setCurrentThemeName(name);
                    setOpenDropdowns({}); // Close dropdown after selection
                  }}
                  className={`flex items-center w-full text-left p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText} ${currentThemeName === name ? 'font-bold underline' : ''}`}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };


  return (
    <div className={`flex h-screen font-inter ${currentTheme.mainBg}`}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          /* Custom scrollbar styles */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track { 
            background: ${currentTheme.linkText.includes('text-white') ? '#374151' : '#f1f1f1'};
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${currentTheme.linkText.includes('text-white') ? '#6b7280' : '#888'};
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${currentTheme.linkText.includes('text-white') ? '#9ca3af' : '#555'};
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
            ${currentTheme.sidebarClasses} 
            flex flex-col p-4 shadow-xl z-30
            sidebar-transition
            ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
            md:relative md:w-72 md:translate-x-0
            overflow-y-auto custom-scrollbar
          `}
        >
          <div className="flex flex-col items-center justify-center mb-6 pt-6">
            {/* Institute Logo */}
            <img
              src="/Jamia%20Logo.png"
              alt="Jamia Tul Mastwaar logo"
              className="h-16 w-16 mb-2 object-contain"
            />
            <h1 className={`text-2xl font-bold ${currentTheme.headerText} text-center`}>
              Jamia Tul Mastwaar
            </h1>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-md absolute top-2 right-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Close sidebar"
            >
              <XMarkIcon className={`h-6 w-6 ${currentTheme.headerText}`} />
            </button>
          </div>
          <nav className="flex-grow pt-4">
            <ul className={currentTheme.linkText}>
              {/* Theme Selector - Uses Context */}
              {/* <ThemeSelector /> */}

              {/* Dashboard Links */}
              {currentUser.role === 'admin' && (
                <li className="mb-2">
                  <NavLink to="/admin/dashboard" className={navClass} onClick={toggleSidebar}>
                    <HomeIcon className={`h-5 w-5 mr-3`} /> Admin Dashboard
                  </NavLink>
                </li>
              )}
              {currentUser.role === 'student' && (
                <li className="mb-2">
                  <NavLink to="/student/dashboard" className={navClass} onClick={toggleSidebar}>
                    <HomeIcon className={`h-5 w-5 mr-3`} /> Student Dashboard
                  </NavLink>
                </li>
              )}
              {currentUser.role === 'teacher' && (
                <li className="mb-2">
                  <NavLink to="/teacher/dashboard" className={navClass} onClick={toggleSidebar}>
                    <HomeIcon className={`h-5 w-5 mr-3`} /> Teacher Dashboard
                  </NavLink>
                </li>
              )}
              {currentUser.role === 'accountant' && (
                <li className="mb-2">
                  <NavLink to="/accountant/dashboard" className={navClass} onClick={toggleSidebar}>
                    <HomeIcon className={`h-5 w-5 mr-3`} /> Accountant Dashboard
                  </NavLink>
                </li>
              )}

              {myProfileLink && (
                <li className="mb-2">
                  <NavLink to={myProfileLink} className={navClass} onClick={toggleSidebar}>
                    <UserCircleIcon className={`h-5 w-5 mr-3`} /> My Profile
                  </NavLink>
                </li>
              )}

              {/* Admin Links */}
              {currentUser.role === 'admin' && (
                <>
                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('user-management')}
                      className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}
                    >
                      <UserGroupIcon className={`h-5 w-5 mr-3`} />
                      Users Management
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['user-management'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['user-management'] && (
                      <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                        <li>
                          <NavLink to="/students" className={navClass} onClick={toggleSidebar}>
                            <AcademicCapIcon className={`h-5 w-5 mr-3`} /> Student Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/staff" className={navClass} onClick={toggleSidebar}>
                            <BriefcaseIcon className={`h-5 w-5 mr-3`} /> Staff Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/admin/users" className={navClass} onClick={toggleSidebar}>
                            <UserCircleIcon className={`h-5 w-5 mr-3`} /> User Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/admin/access-control" className={navClass} onClick={toggleSidebar}>
                            <Cog6ToothIcon className={`h-5 w-5 mr-3`} /> Access Control
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>

                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('financial-management')}
                      className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}
                    >
                      <WalletIcon className={`h-5 w-5 mr-3`} />
                      Financial Management
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['financial-management'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['financial-management'] && (
                      <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                        <li>
                          <NavLink to="/fees" className={navClass} onClick={toggleSidebar}>
                            <BanknotesIcon className={`h-5 w-5 mr-3`} /> Fees Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/salaries" className={navClass} onClick={toggleSidebar}>
                            <BanknotesIcon className={`h-5 w-5 mr-3`} /> Salary Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/donations" className={navClass} onClick={toggleSidebar}>
                            <BanknotesIcon className={`h-5 w-5 mr-3`} /> Donation Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/billing" className={navClass} onClick={toggleSidebar}>
                            <BanknotesIcon className={`h-5 w-5 mr-3`} /> Bills Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/financial-reports" className={navClass} onClick={toggleSidebar}>
                            <ChartBarIcon className={`h-5 w-5 mr-3`} /> Financial Reports
                          </NavLink>
                        </li>

                      </ul>
                    )}
                  </li>

                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('academic-management')}
                      className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}
                    >
                      <BookOpenIcon className={`h-5 w-5 mr-3`} />
                      Academic & Attendance
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['academic-management'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['academic-management'] && (
                      <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                           <li>
                          <NavLink to="/academic-structure" className={navClass} onClick={toggleSidebar}>
                            <AcademicCapIcon className={`h-5 w-5 mr-3`} /> Academic Structure
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/assign-classes" className={navClass} onClick={toggleSidebar}>
                            <BookOpenIcon className={`h-5 w-5 mr-3`} /> Assign Classes
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/attendance/mark" className={navClass} onClick={toggleSidebar}>
                            <ClipboardDocumentCheckIcon className={`h-5 w-5 mr-3`} /> Mark Attendance
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/attendance/all" className={navClass} onClick={toggleSidebar}>
                            <ChartBarIcon className={`h-5 w-5 mr-3`} /> All Attendance Records
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/admin/student-leaves" className={navClass} onClick={toggleSidebar}>
                            <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> Student Leaves
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/admin/staff-leaves" className={navClass} onClick={toggleSidebar}>
                            <ClockIcon className={`h-5 w-5 mr-3`} /> Staff Leaves
                          </NavLink>
                        </li>
                        {/* <li className="mb-2">
                          <Link to="/admin/marks" className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200`} onClick={toggleSidebar}>
                            <ClockIcon className={`h-5 w-5 mr-3`} /> View Marks
                          </Link>
                        </li> */}
                      </ul>
                    )}
                  </li>
                </>
              )}

              {/* Student Links */}
              {currentUser.role === 'student' && (
                <>
                  <li className="mb-2">
                    <NavLink to="/fees" className={navClass} onClick={toggleSidebar}>
                      <BanknotesIcon className={`h-5 w-5 mr-3`} /> My Fees
                    </NavLink>
                  </li>
                  <li className="mb-2">
                    <NavLink to={`/attendance/my/${currentUser.profileId}`} className={navClass} onClick={toggleSidebar}>
                      <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance
                    </NavLink>
                  </li>
                  <li className="mb-2">
                    <NavLink to="/student/student-leaves" className={navClass} onClick={toggleSidebar}>
                      <ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request
                    </NavLink>
                  </li>
                  <li className="mb-2">
                    <NavLink to={getMyMarksLink()}  className={navClass} onClick={toggleSidebar}>
                      <ClockIcon className={`h-5 w-5 mr-3`} /> My Marks
                    </NavLink>
                  </li>
                </>
              )}

              {/* Teacher Links */}
              {currentUser.role === 'teacher' && (
                <>
                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('teacher-classes')}
                      className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}
                    >
                      <AcademicCapIcon className={`h-5 w-5 mr-3`} />
                      My Classes
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-classes'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['teacher-classes'] && (
                      <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                        <li>
                          <NavLink to="/teacher/my-students" className={navClass} onClick={toggleSidebar}>
                            <UserGroupIcon className={`h-5 w-5 mr-3`} /> My Students
                          </NavLink>
                        </li>
                        <li>  
                          <NavLink to="/teacher/my-subjects" className={navClass} onClick={toggleSidebar}>
                            <BookOpenIcon className={`h-5 w-5 mr-3`} /> My Subjects
                          </NavLink> 
                        </li>

                        <li className="mb-2">
                          <NavLink to="/marks/add" className={navClass} onClick={toggleSidebar}>
                            <ClockIcon className={`h-5 w-5 mr-3`} /> Add Marks
                          </NavLink>
                        </li>
                        <li className="mb-2">
                          <NavLink to={getMyMarksLink()} className={navClass} onClick={toggleSidebar}>
                            <ClockIcon className={`h-5 w-5 mr-3`} /> View Marks
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>

                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('teacher-attendance')}
                      className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}
                    >
                      <ClipboardDocumentListIcon className={`h-5 w-5 mr-3`} />
                      Attendance & Leaves
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-attendance'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['teacher-attendance'] && (
                      <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                        <li>
                          <NavLink to="/attendance/students/assigned" className={navClass} onClick={toggleSidebar}>
                            <ClipboardDocumentCheckIcon className={`h-5 w-5 mr-3`} /> Mark Attendance
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/attendance/all" className={navClass} onClick={toggleSidebar}>
                            <ChartBarIcon className={`h-5 w-5 mr-3`} /> All Attendance Records
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to={`/attendance/my/${currentUser.profileId}`} className={navClass} onClick={toggleSidebar}>
                            <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/teacher/student-leaves" className={navClass} onClick={toggleSidebar}>
                            <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> Student Leave Requests
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/staff/staff-leaves" className={navClass} onClick={toggleSidebar}>
                            <ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="mb-2">
                    <NavLink to="/my-salaries" className={navClass} onClick={toggleSidebar}>
                      <BanknotesIcon className={`h-5 w-5 mr-3`} /> My Salaries
                    </NavLink>
                  </li>
                </>
              )}

              {/* Accountant Links */}
              {currentUser.role === 'accountant' && (
                <>
                  <li className="mb-2">
                    <div
                      onClick={() => toggleDropdown('accountant-finance')}
                      className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}
                    >
                      <WalletIcon className={`h-5 w-5 mr-3`} />
                      Financial Management
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['accountant-finance'] ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openDropdowns['accountant-finance'] && (
                      <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                        <li>
                          <NavLink to="/fees" className={navClass} onClick={toggleSidebar}>
                            <BanknotesIcon className={`h-5 w-5 mr-3`} /> Fees Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/salaries" className={navClass} onClick={toggleSidebar}>
                            <BanknotesIcon className={`h-5 w-5 mr-3`} /> Salary Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/billing" className={navClass} onClick={toggleSidebar}>
                            <BanknotesIcon className={`h-5 w-5 mr-3`} /> Bill Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/donations" className={navClass} onClick={toggleSidebar}>
                            <BanknotesIcon className={`h-5 w-5 mr-3`} /> Donation Management
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/financial-reports" className={navClass} onClick={toggleSidebar}>
                            <ChartBarIcon className={`h-5 w-5 mr-3`} /> Financial Reports
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li className="mb-2">
                    <NavLink to={`/attendance/my/${currentUser.profileId}`} className={navClass} onClick={toggleSidebar}>
                      <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance
                    </NavLink>
                  </li>
                  <li className="mb-2">
                    <NavLink to="/staff/staff-leaves" className={navClass} onClick={toggleSidebar}>
                      <ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request
                    </NavLink>
                  </li>
                </>
              )}

              {/* Cook/Cleaner Links */}
              {(currentUser.role === 'cook' || currentUser.role === 'cleaner') && (
                <>
                  <li className="mb-2">
                    <NavLink to={`/attendance/my/${currentUser.profileId}`} className={navClass} onClick={toggleSidebar}>
                      <CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance
                    </NavLink>
                  </li>
                  <li className="mb-2">
                    <NavLink to="/my-salaries" className={navClass} onClick={toggleSidebar}>
                      <BanknotesIcon className={`h-5 w-5 mr-3`} /> My Salaries
                    </NavLink>
                  </li>
                  <li className="mb-2">
                    <NavLink to="/staff/staff-leaves" className={navClass} onClick={toggleSidebar}>
                      <ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <div className={`mt-auto pt-4 border-t ${currentTheme.border}`}>
            <p className={`text-sm mb-2 truncate ${currentTheme.linkText}`} title={currentUser.cnic}>Logged in as: {currentUser.cnic})</p>
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
        {/* Mobile hamburger to reopen sidebar when hidden */}
        {currentUser && !isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="md:hidden fixed top-3 left-3 z-40 p-2 rounded-md bg-white shadow-lg border border-gray-200"
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
