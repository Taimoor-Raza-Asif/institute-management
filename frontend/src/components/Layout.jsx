// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../context/ThemeContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { resolveFileUrl } from '../utils/urlHelper.js';
import {
  UserCircleIcon, Cog6ToothIcon, BriefcaseIcon, AcademicCapIcon,
  BanknotesIcon, ChartBarIcon, PowerIcon, HomeIcon,
  ClipboardDocumentListIcon, CalendarDaysIcon, BookOpenIcon,
  Bars3Icon, XMarkIcon, ClockIcon, ClipboardDocumentCheckIcon, UserGroupIcon, WalletIcon,
  ChevronDownIcon, PaintBrushIcon, AdjustmentsHorizontalIcon, CreditCardIcon, HeartIcon, ReceiptRefundIcon, ReceiptPercentIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';


const Layout = ({ children, currentUser, onLogout }) => {
  // --- Theme Context Consumption ---
  const { currentThemeName, currentTheme, themes, setCurrentThemeName } = useTheme();

  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // default closed on mobile
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState('');
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const profileIdValue = currentUser?.profileId && typeof currentUser.profileId === 'object'
    ? currentUser.profileId._id
    : currentUser?.profileId;

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // On desktop, sidebar should start open
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Close drawer on route change (mobile)
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Resolve top-right avatar image from current user or linked profile.
  useEffect(() => {
    let cancelled = false;

    const loadHeaderAvatar = async () => {
      setAvatarLoadFailed(false);

      if (!currentUser) {
        setHeaderAvatarUrl('');
        return;
      }

      const directAvatar = currentUser.profilePictureUrl || currentUser.profileId?.profilePictureUrl;
      if (directAvatar) {
        setHeaderAvatarUrl(resolveFileUrl(directAvatar));
        return;
      }

      if (!profileIdValue || currentUser.role === 'super_admin') {
        setHeaderAvatarUrl('');
        return;
      }

      try {
        const endpoint = currentUser.role === 'student'
          ? `/students/${profileIdValue}`
          : `/staff/${profileIdValue}`;
        const { data } = await api.get(endpoint);
        const fetchedAvatar = data?.profilePictureUrl || data?.student?.profilePictureUrl || data?.staff?.profilePictureUrl;
        if (!cancelled) {
          setHeaderAvatarUrl(fetchedAvatar ? resolveFileUrl(fetchedAvatar) : '');
        }
      } catch {
        if (!cancelled) {
          setHeaderAvatarUrl('');
        }
      }
    };

    loadHeaderAvatar();

    return () => {
      cancelled = true;
    };
  }, [currentUser, profileIdValue]);

  const openSidebar  = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const toggleDropdown = (name) => {
    setOpenDropdowns(prevState => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const getMyProfileLink = () => {
    if (!currentUser || !profileIdValue) return null;
    if (currentUser.role === 'student') {
      return `/profile/student/${profileIdValue}`;
    } else if (['admin', 'teacher', 'accountant', 'cook', 'cleaner'].includes(currentUser.role)) {
      return `/profile/staff/${profileIdValue}`;
    }
    return null;
  };

  const getMyMarksLink = () => {
    if (!currentUser || !profileIdValue) return null;
    if (currentUser.role === 'teacher') return `/marks/teacher/${profileIdValue}`;
    if (currentUser.role === 'student') return `/marks/student/${profileIdValue}`;
    return null;
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/';
    if (currentUser.role === 'super_admin') return '/super-admin/dashboard';
    if (currentUser.role === 'admin') return '/admin/dashboard';
    if (currentUser.role === 'student') return '/student/dashboard';
    if (currentUser.role === 'teacher') return '/teacher/dashboard';
    if (currentUser.role === 'accountant') return '/accountant/dashboard';
    return '/';
  };

  const myProfileLink = getMyProfileLink();
  const dashboardLink = getDashboardLink();

  // Helper: active tab styles per theme
  const activeClassesMap = {
    'Green': `${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'}`,
    'General Dark': 'bg-gray-600 text-white',
    'Deep Blue': 'bg-blue-800 text-white',
    'Royal Purple': 'bg-purple-600 text-white',
    'Sunset Orange': 'bg-orange-600 text-white',
    'Black & Teal': 'bg-teal-700 text-white',
    'Vibrant Magenta': 'bg-pink-600 text-white',
  };
  const activeClasses = activeClassesMap[currentThemeName] || `${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'}`;
  const navClass = ({ isActive }) => `flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 ${currentTheme.linkText} ${isActive ? activeClasses : ''}`;

  // Derive a short accent color for the mobile bottom nav active indicator
  const accentColor = currentThemeName === 'General Dark' ? '#6b7280'
    : currentThemeName === 'Deep Blue' ? '#1e40af'
    : currentThemeName === 'Royal Purple' ? '#7c3aed'
    : currentThemeName === 'Sunset Orange' ? '#ea580c'
    : currentThemeName === 'Black & Teal' ? '#0f766e'
    : currentThemeName === 'Vibrant Magenta' ? '#db2777'
    : '#16a34a';

  // Mobile bottom nav items — role-dependent shortcuts
  const getMobileNavItems = () => {
    if (!currentUser) return [];
    const items = [
      { to: dashboardLink, icon: HomeIcon, label: 'Home' },
    ];
    if (myProfileLink) {
      items.push({ to: myProfileLink, icon: UserCircleIcon, label: 'Profile' });
    }
    if (['admin', 'teacher', 'accountant'].includes(currentUser.role)) {
      items.push({ to: '/students', icon: AcademicCapIcon, label: 'Students' });
    }
    if (['admin', 'accountant'].includes(currentUser.role)) {
      items.push({ to: '/fees', icon: BanknotesIcon, label: 'Fees' });
    }
    if (currentUser.role === 'student') {
      items.push({ to: '/fees', icon: BanknotesIcon, label: 'My Fees' });
      items.push({ to: `/attendance/my/${currentUser.profileId}`, icon: CalendarDaysIcon, label: 'Attendance' });
    }
    if (currentUser.role === 'teacher') {
      items.push({ to: '/attendance/students/assigned', icon: ClipboardDocumentCheckIcon, label: 'Attendance' });
    }
    // Always show "More" (hamburger) as last item
    items.push({ action: openSidebar, icon: Bars3Icon, label: 'More' });
    // Limit to 5 items max
    return items.slice(0, 5);
  };

  const mobileNavItems = getMobileNavItems();

  // Component for theme selection UI
  const ThemeSelector = () => {
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
                    setOpenDropdowns({});
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

  // Sidebar inner content — shared between desktop and mobile drawer
  const SidebarContent = () => (
    <>
      <div className="flex flex-col items-center justify-center mb-6 pt-6">
        <img
          src="/Jamia%20Logo.png"
          alt="Jamia Tul Mastwaar logo"
          className="h-16 w-16 mb-2 object-contain"
        />
        <h1 className={`text-xl font-bold ${currentTheme.headerText} text-center leading-snug`}>
          Jamia Tul Mastwaar
        </h1>
        {/* Close button — only visible on mobile */}
        <button
          onClick={closeSidebar}
          className={`md:hidden p-2 rounded-full absolute top-3 right-3 focus:outline-none ${currentTheme?.inputRing || 'focus:ring-2 focus:ring-green-500'} ${currentTheme.linkHover}`}
          aria-label="Close sidebar"
        >
          <XMarkIcon className={`h-6 w-6 ${currentTheme.headerText}`} />
        </button>
      </div>

      <nav className="flex-grow pt-2">
        <ul className={currentTheme.linkText}>
          {/* Theme Selector */}
          <ThemeSelector />

          {/* Dashboard Links */}
          {currentUser.role === 'super_admin' && (
            <li className="mb-2">
              <NavLink to="/super-admin/dashboard" className={navClass} onClick={isMobile ? closeSidebar : undefined}>
                <HomeIcon className={`h-5 w-5 mr-3`} /> Super Admin Console
              </NavLink>
            </li>
          )}
          {currentUser.role === 'admin' && (
            <li className="mb-2">
              <NavLink to="/admin/dashboard" className={navClass} onClick={isMobile ? closeSidebar : undefined}>
                <HomeIcon className={`h-5 w-5 mr-3`} /> Admin Dashboard
              </NavLink>
            </li>
          )}
          {currentUser.role === 'student' && (
            <li className="mb-2">
              <NavLink to="/student/dashboard" className={navClass} onClick={isMobile ? closeSidebar : undefined}>
                <HomeIcon className={`h-5 w-5 mr-3`} /> Student Dashboard
              </NavLink>
            </li>
          )}
          {currentUser.role === 'teacher' && (
            <li className="mb-2">
              <NavLink to="/teacher/dashboard" className={navClass} onClick={isMobile ? closeSidebar : undefined}>
                <HomeIcon className={`h-5 w-5 mr-3`} /> Teacher Dashboard
              </NavLink>
            </li>
          )}
          {currentUser.role === 'accountant' && (
            <li className="mb-2">
              <NavLink to="/accountant/dashboard" className={navClass} onClick={isMobile ? closeSidebar : undefined}>
                <HomeIcon className={`h-5 w-5 mr-3`} /> Accountant Dashboard
              </NavLink>
            </li>
          )}

          {myProfileLink && (
            <li className="mb-2">
              <NavLink to={myProfileLink} className={navClass} onClick={isMobile ? closeSidebar : undefined}>
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
                      <NavLink to="/students" className={navClass} onClick={isMobile ? closeSidebar : undefined}>
                        <AcademicCapIcon className={`h-5 w-5 mr-3`} /> Student Management
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/staff" className={navClass} onClick={isMobile ? closeSidebar : undefined}>
                        <BriefcaseIcon className={`h-5 w-5 mr-3`} /> Staff Management
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/users" className={navClass} onClick={isMobile ? closeSidebar : undefined}>
                        <UserCircleIcon className={`h-5 w-5 mr-3`} /> User Management
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/access-control" className={navClass} onClick={isMobile ? closeSidebar : undefined}>
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
                    <li><NavLink to="/fees" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BanknotesIcon className={`h-5 w-5 mr-3`} /> Fees Management</NavLink></li>
                    <li><NavLink to="/fee-structure" className={navClass} onClick={isMobile ? closeSidebar : undefined}><AdjustmentsHorizontalIcon className={`h-5 w-5 mr-3`} /> Fee Structure</NavLink></li>
                    <li><NavLink to="/salary-structure" className={navClass} onClick={isMobile ? closeSidebar : undefined}><AdjustmentsHorizontalIcon className={`h-5 w-5 mr-3`} /> Salary Structure</NavLink></li>
                    <li><NavLink to="/salaries" className={navClass} onClick={isMobile ? closeSidebar : undefined}><CreditCardIcon className={`h-5 w-5 mr-3`} /> Salary Management</NavLink></li>
                    <li><NavLink to="/donations" className={navClass} onClick={isMobile ? closeSidebar : undefined}><HeartIcon className={`h-5 w-5 mr-3`} /> Donation Management</NavLink></li>
                    <li><NavLink to="/billing" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ReceiptRefundIcon className={`h-5 w-5 mr-3`} /> Bills Management</NavLink></li>
                    <li><NavLink to="/chart-of-accounts" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BanknotesIcon className={`h-5 w-5 mr-3`} /> Chart of Accounts</NavLink></li>
                    <li><NavLink to="/accounts-wallets" className={navClass} onClick={isMobile ? closeSidebar : undefined}><WalletIcon className={`h-5 w-5 mr-3`} /> Accounts &amp; Wallets</NavLink></li>
                    <li><NavLink to="/financial-reports" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ChartBarIcon className={`h-5 w-5 mr-3`} /> Financial Reports</NavLink></li>
                    <li><NavLink to="/account-ledger" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BookOpenIcon className={`h-5 w-5 mr-3`} /> Account Ledger</NavLink></li>
                    <li><NavLink to="/financial-statements" className={navClass} onClick={isMobile ? closeSidebar : undefined}><DocumentChartBarIcon className={`h-5 w-5 mr-3`} /> Financial Statements</NavLink></li>
                    <li><NavLink to="/discounted-students" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ReceiptPercentIcon className={`h-5 w-5 mr-3`} /> Discounted Students</NavLink></li>
                  </ul>
                )}
              </li>

              <li className="mb-2">
                <div
                  onClick={() => toggleDropdown('academic-management')}
                  className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}
                >
                  <BookOpenIcon className={`h-5 w-5 mr-3`} />
                  Academic &amp; Attendance
                  <ChevronDownIcon
                    className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['academic-management'] ? 'rotate-180' : ''}`}
                  />
                </div>
                {openDropdowns['academic-management'] && (
                  <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                    <li><NavLink to="/academic-structure" className={navClass} onClick={isMobile ? closeSidebar : undefined}><AcademicCapIcon className={`h-5 w-5 mr-3`} /> Academic Structure</NavLink></li>
                    <li><NavLink to="/assign-classes" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BookOpenIcon className={`h-5 w-5 mr-3`} /> Assign Classes</NavLink></li>
                    <li><NavLink to="/attendance/mark" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClipboardDocumentCheckIcon className={`h-5 w-5 mr-3`} /> Mark Attendance</NavLink></li>
                    <li><NavLink to="/attendance/all" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ChartBarIcon className={`h-5 w-5 mr-3`} /> All Attendance Records</NavLink></li>
                    <li><NavLink to="/admin/student-leaves" className={navClass} onClick={isMobile ? closeSidebar : undefined}><CalendarDaysIcon className={`h-5 w-5 mr-3`} /> Student Leaves</NavLink></li>
                    <li><NavLink to="/admin/staff-leaves" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClockIcon className={`h-5 w-5 mr-3`} /> Staff Leaves</NavLink></li>
                  </ul>
                )}
              </li>
            </>
          )}

          {/* Student Links */}
          {currentUser.role === 'student' && (
            <>
              <li className="mb-2"><NavLink to="/fees" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BanknotesIcon className={`h-5 w-5 mr-3`} /> My Fees</NavLink></li>
              <li className="mb-2"><NavLink to="/student/registered-subjects" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BookOpenIcon className={`h-5 w-5 mr-3`} /> Registered Subjects</NavLink></li>
              <li className="mb-2"><NavLink to={`/attendance/my/${currentUser.profileId}`} className={navClass} onClick={isMobile ? closeSidebar : undefined}><CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance</NavLink></li>
              <li className="mb-2"><NavLink to="/student/student-leaves" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request</NavLink></li>
              <li className="mb-2"><NavLink to={getMyMarksLink()} className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClockIcon className={`h-5 w-5 mr-3`} /> My Marks</NavLink></li>
            </>
          )}

          {/* Teacher Links */}
          {currentUser.role === 'teacher' && (
            <>
              {currentUser.canAccessStudents && (
                <li className="mb-2"><NavLink to="/students" className={navClass} onClick={isMobile ? closeSidebar : undefined}><AcademicCapIcon className={`h-5 w-5 mr-3`} /> Student Management</NavLink></li>
              )}
              {currentUser.canAccessStaff && (
                <li className="mb-2"><NavLink to="/staff" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BriefcaseIcon className={`h-5 w-5 mr-3`} /> Staff Management</NavLink></li>
              )}
              <li className="mb-2">
                <div onClick={() => toggleDropdown('teacher-classes')} className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}>
                  <AcademicCapIcon className={`h-5 w-5 mr-3`} /> My Classes
                  <ChevronDownIcon className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-classes'] ? 'rotate-180' : ''}`} />
                </div>
                {openDropdowns['teacher-classes'] && (
                  <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                    <li><NavLink to="/teacher/my-students" className={navClass} onClick={isMobile ? closeSidebar : undefined}><UserGroupIcon className={`h-5 w-5 mr-3`} /> My Students</NavLink></li>
                    <li><NavLink to="/teacher/my-subjects" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BookOpenIcon className={`h-5 w-5 mr-3`} /> My Subjects</NavLink></li>
                    <li className="mb-2"><NavLink to="/marks/add" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClockIcon className={`h-5 w-5 mr-3`} /> Add Marks</NavLink></li>
                    <li className="mb-2"><NavLink to={getMyMarksLink()} className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClockIcon className={`h-5 w-5 mr-3`} /> View Marks</NavLink></li>
                  </ul>
                )}
              </li>
              <li className="mb-2">
                <div onClick={() => toggleDropdown('teacher-attendance')} className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}>
                  <ClipboardDocumentListIcon className={`h-5 w-5 mr-3`} /> Attendance &amp; Leaves
                  <ChevronDownIcon className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['teacher-attendance'] ? 'rotate-180' : ''}`} />
                </div>
                {openDropdowns['teacher-attendance'] && (
                  <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                    <li><NavLink to="/attendance/students/assigned" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClipboardDocumentCheckIcon className={`h-5 w-5 mr-3`} /> Mark Attendance</NavLink></li>
                    <li><NavLink to="/attendance/all" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ChartBarIcon className={`h-5 w-5 mr-3`} /> All Attendance Records</NavLink></li>
                    <li><NavLink to={`/attendance/my/${currentUser.profileId}`} className={navClass} onClick={isMobile ? closeSidebar : undefined}><CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance</NavLink></li>
                    <li><NavLink to="/teacher/student-leaves" className={navClass} onClick={isMobile ? closeSidebar : undefined}><CalendarDaysIcon className={`h-5 w-5 mr-3`} /> Student Leave Requests</NavLink></li>
                    <li><NavLink to="/staff/staff-leaves" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request</NavLink></li>
                  </ul>
                )}
              </li>
              <li className="mb-2"><NavLink to="/my-salaries" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BanknotesIcon className={`h-5 w-5 mr-3`} /> My Salaries</NavLink></li>
            </>
          )}

          {/* Accountant Links */}
          {currentUser.role === 'accountant' && (
            <>
              {currentUser.canAccessStudents && (
                <li className="mb-2"><NavLink to="/students" className={navClass} onClick={isMobile ? closeSidebar : undefined}><AcademicCapIcon className={`h-5 w-5 mr-3`} /> Student Management</NavLink></li>
              )}
              {currentUser.canAccessStaff && (
                <li className="mb-2"><NavLink to="/staff" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BriefcaseIcon className={`h-5 w-5 mr-3`} /> Staff Management</NavLink></li>
              )}
              <li className="mb-2">
                <div onClick={() => toggleDropdown('accountant-finance')} className={`flex items-center p-2 text-sm md:text-base rounded-md ${currentTheme.linkHover} transition duration-200 cursor-pointer`}>
                  <WalletIcon className={`h-5 w-5 mr-3`} /> Financial Management
                  <ChevronDownIcon className={`h-4 w-4 ml-auto transition-transform duration-200 ${openDropdowns['accountant-finance'] ? 'rotate-180' : ''}`} />
                </div>
                {openDropdowns['accountant-finance'] && (
                  <ul className={`mt-1 ml-4 border-l ${currentTheme.border}`}>
                    <li><NavLink to="/fees" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BanknotesIcon className={`h-5 w-5 mr-3`} /> Fees Management</NavLink></li>
                    <li><NavLink to="/salary-structure" className={navClass} onClick={isMobile ? closeSidebar : undefined}><AdjustmentsHorizontalIcon className={`h-5 w-5 mr-3`} /> Salary Structure</NavLink></li>
                    <li><NavLink to="/salaries" className={navClass} onClick={isMobile ? closeSidebar : undefined}><CreditCardIcon className={`h-5 w-5 mr-3`} /> Salary Management</NavLink></li>
                    <li><NavLink to="/billing" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ReceiptRefundIcon className={`h-5 w-5 mr-3`} /> Bill Management</NavLink></li>
                    <li><NavLink to="/donations" className={navClass} onClick={isMobile ? closeSidebar : undefined}><HeartIcon className={`h-5 w-5 mr-3`} /> Donation Management</NavLink></li>
                    <li><NavLink to="/accounts-wallets" className={navClass} onClick={isMobile ? closeSidebar : undefined}><WalletIcon className={`h-5 w-5 mr-3`} /> Accounts &amp; Wallets</NavLink></li>
                    <li><NavLink to="/financial-reports" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ChartBarIcon className={`h-5 w-5 mr-3`} /> Financial Reports</NavLink></li>
                    <li><NavLink to="/discounted-students" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ReceiptPercentIcon className={`h-5 w-5 mr-3`} /> Discounted Students</NavLink></li>
                  </ul>
                )}
              </li>
              <li className="mb-2"><NavLink to={`/attendance/my/${currentUser.profileId}`} className={navClass} onClick={isMobile ? closeSidebar : undefined}><CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance</NavLink></li>
              <li className="mb-2"><NavLink to="/staff/staff-leaves" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request</NavLink></li>
            </>
          )}

          {/* Cook/Cleaner Links */}
          {(currentUser.role === 'cook' || currentUser.role === 'cleaner') && (
            <>
              <li className="mb-2"><NavLink to={`/attendance/my/${currentUser.profileId}`} className={navClass} onClick={isMobile ? closeSidebar : undefined}><CalendarDaysIcon className={`h-5 w-5 mr-3`} /> My Attendance</NavLink></li>
              <li className="mb-2"><NavLink to="/my-salaries" className={navClass} onClick={isMobile ? closeSidebar : undefined}><BanknotesIcon className={`h-5 w-5 mr-3`} /> My Salaries</NavLink></li>
              <li className="mb-2"><NavLink to="/staff/staff-leaves" className={navClass} onClick={isMobile ? closeSidebar : undefined}><ClockIcon className={`h-5 w-5 mr-3`} /> My Leave Request</NavLink></li>
            </>
          )}
        </ul>
      </nav>

      <div className={`mt-auto pt-4 border-t ${currentTheme.border}`}>
        <p className={`text-sm mb-2 truncate ${currentTheme.linkText}`} title={currentUser.cnic}>
          Logged in as: {currentUser.name} - ({currentUser.role})
        </p>
        <button
          onClick={onLogout}
          className="flex items-center justify-center w-full p-2 rounded-md bg-red-600 hover:bg-red-700 transition duration-200 text-white"
        >
          <PowerIcon className="h-5 w-5 mr-2" /> Logout
        </button>
      </div>
    </>
  );

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
            background: ${currentTheme.linkText.includes('text-white') ? '#0f1724' : '#f1f1f1'};
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${currentTheme.linkText.includes('text-white') ? '#334155' : '#b3b3b3'};
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${currentTheme.linkText.includes('text-white') ? '#475569' : '#777'};
          }
          .sidebar-transition {
            transition: width 0.3s ease-in-out, transform 0.3s ease-in-out;
          }
          .main-content-full-width {
            margin-left: 0 !important;
            width: 100% !important;
          }

          /* Page hero: large rounded gradient header */
          .page-hero {
            border-radius: 1rem;
            padding: 2rem 2.25rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 8px 24px rgba(2,6,23,0.06);
            display: block;
            overflow: hidden;
          }
          .page-hero .title {
            font-size: 1.875rem;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 0.25rem;
          }
          .page-hero .subtitle {
            font-size: 1rem;
            opacity: 0.9;
          }

          .section-card {
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .section-card .meta {
            font-size: 0.95rem;
            margin-bottom: 1rem;
            opacity: 0.9;
          }

          .subject-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0,1fr));
            gap: 1rem;
            margin-top: 0.5rem;
          }
          .subject-item {
            padding: 1rem 1.25rem;
            border-radius: 0.5rem;
            border: 1px solid ${currentTheme.linkText.includes('text-white') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }

          /* ── Mobile bottom nav theming ── */
          .mobile-bottom-nav {
            background: ${currentTheme.linkText.includes('text-white') ? '#1e293b' : '#ffffff'};
            color: ${currentTheme.linkText.includes('text-white') ? '#94a3b8' : '#64748b'};
          }
          .mobile-bottom-nav a,
          .mobile-bottom-nav button {
            color: ${currentTheme.linkText.includes('text-white') ? '#94a3b8' : '#64748b'};
          }
          .mobile-bottom-nav a:hover,
          .mobile-bottom-nav button:hover {
            color: ${accentColor};
            background: ${accentColor}18;
          }
          .mobile-bottom-nav a.mob-nav-active,
          .mobile-bottom-nav button.mob-nav-active {
            color: ${accentColor};
          }

          /* ── Mobile top bar theming ── */
          .mobile-top-bar {
            background: ${currentTheme.linkText.includes('text-white') ? '#1e293b' : '#ffffff'};
            color: ${currentTheme.linkText.includes('text-white') ? '#f1f5f9' : '#1e293b'};
          }
          .mobile-top-bar button {
            color: ${currentTheme.linkText.includes('text-white') ? '#94a3b8' : '#64748b'};
          }
        `}
      </style>

      {/* ── DESKTOP sidebar (≥ 768px) ── */}
      {currentUser && (
        <aside
          className={`
            hidden md:flex flex-col p-4 shadow-xl
            ${currentTheme.sidebarClasses}
            sidebar-transition
            ${isSidebarOpen ? 'md:w-72' : 'md:w-0 md:overflow-hidden md:p-0'}
            overflow-y-auto custom-scrollbar relative
          `}
        >
          <SidebarContent />
        </aside>
      )}

      {/* ── MOBILE drawer overlay ── */}
      {currentUser && isMobile && isSidebarOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE drawer ── */}
      {currentUser && isMobile && (
        <aside
          className={`
            mobile-drawer
            ${currentTheme.sidebarClasses}
            flex flex-col p-4
            overflow-y-auto custom-scrollbar
            ${isSidebarOpen ? '' : 'mobile-drawer-hidden'}
          `}
          style={{
            transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <SidebarContent />
        </aside>
      )}

      {/* ── Main Content ── */}
      <main
        className={`
          flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
          ${currentUser && isSidebarOpen && !isMobile ? 'md:ml-2' : 'md:ml-0 main-content-full-width'}
        `}
      >
        {/* ── Mobile top header bar ── */}
        {currentUser && isMobile && (
          <header className="mobile-top-bar md:hidden">
            <button
              onClick={openSidebar}
              aria-label="Open menu"
              className="p-1.5 rounded-lg"
              style={{ background: accentColor + '15' }}
            >
              <Bars3Icon className="h-6 w-6" style={{ color: accentColor }} />
            </button>
            <span className="mob-title">Jamia Tul Mastwaar</span>
            {myProfileLink && (
              <NavLink to={myProfileLink} aria-label="My profile">
                {headerAvatarUrl && !avatarLoadFailed ? (
                  <img
                    src={headerAvatarUrl}
                    alt="Profile"
                    onError={() => setAvatarLoadFailed(true)}
                    className="h-8 w-8 rounded-full object-cover border border-white/70"
                  />
                ) : (
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                    style={{ background: accentColor }}
                  >
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </NavLink>
            )}
          </header>
        )}

        {/* ── Desktop hamburger toggle (collapsed sidebar) ── */}
        {currentUser && !isSidebarOpen && !isMobile && (
          <button
            onClick={toggleSidebar}
            className="hidden md:flex fixed top-3 left-3 z-40 p-2 rounded-md bg-white shadow-lg border border-gray-200"
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>
        )}

        {/* ── Page content ── */}
        <div
          className={`flex-1 overflow-y-auto px-6 py-6 custom-scrollbar ${isMobile && currentUser ? 'mobile-main-content' : ''}`}
        >
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </div>

        {/* ── Mobile bottom navigation bar ── */}
        {currentUser && isMobile && (
          <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile navigation">
            {mobileNavItems.map((item, idx) => {
              const Icon = item.icon;
              if (item.action) {
                return (
                  <button
                    key={idx}
                    onClick={item.action}
                    aria-label={item.label}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </button>
                );
              }
              return (
                <NavLink
                  key={idx}
                  to={item.to}
                  aria-label={item.label}
                  className={({ isActive }) => isActive ? 'mob-nav-active' : ''}
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        )}
      </main>
    </div>
  );
};

export default Layout;
