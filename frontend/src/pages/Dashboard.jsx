// src/pages/Dashboard.jsx
import React, { useContext } from 'react';
import { UserContext } from '../App'; // Assuming UserContext is provided by App.jsx
import { Link } from 'react-router-dom';
import { AcademicCapIcon, BriefcaseIcon, BanknotesIcon, UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { currentUser } = useContext(UserContext);

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-700">Welcome!</h2>
        <p className="text-gray-600 mt-2">Please log in to access your dashboard.</p>
      </div>
    );
  }

  const getDashboardLink = () => {
    switch (currentUser.role) {
      case 'admin': return '/admin/dashboard';
      case 'student': return '/student/dashboard';
      case 'teacher': return '/teacher/dashboard';
      case 'accountant': return '/accountant/dashboard';
      case 'cook':
      case 'cleaner': return '/staff/dashboard';
      default: return '#'; // Fallback
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Your Dashboard, {currentUser.name}!</h1>
      <p className="text-lg text-gray-600 mb-8">Your current role is: <span className="font-semibold text-indigo-700">{currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentUser.role === 'admin' && (
          <>
            <DashboardCard
              title="Manage Students"
              description="View, add, edit, and delete student records."
              icon={<AcademicCapIcon className="h-8 w-8 text-indigo-600" />}
              link="/students"
            />
            <DashboardCard
              title="Manage Staff"
              description="View, add, edit, and delete staff members."
              icon={<BriefcaseIcon className="h-8 w-8 text-green-600" />}
              link="/staff"
            />
            <DashboardCard
              title="Manage Fees"
              description="Oversee all fee records and financial transactions."
              icon={<BanknotesIcon className="h-8 w-8 text-purple-600" />}
              link="/fees"
            />
            <DashboardCard
              title="User Management"
              description="Create and manage user accounts and roles."
              icon={<UserCircleIcon className="h-8 w-8 text-blue-600" />}
              link="/admin/users"
            />
            <DashboardCard
              title="Access Control Panel"
              description="Configure edit permissions for different user roles."
              icon={<Cog6ToothIcon className="h-8 w-8 text-orange-600" />}
              link="/admin/access-control"
            />
          </>
        )}

        {currentUser.role === 'student' && (
          <DashboardCard
            title="My Profile"
            description="View and update your personal student information."
            icon={<UserCircleIcon className="h-8 w-8 text-blue-600" />}
            link="/students/my-data"
          />
        )}

        {currentUser.role === 'teacher' && (
          <>
            <DashboardCard
              title="My Profile"
              description="View and update your personal staff information."
              icon={<UserCircleIcon className="h-8 w-8 text-blue-600" />}
              link="/staff/my-data"
            />
            <DashboardCard
              title="My Students"
              description="View and manage students in your assigned subjects."
              icon={<AcademicCapIcon className="h-8 w-8 text-indigo-600" />}
              link="/students"
            />
          </>
        )}

        {(currentUser.role === 'cook' || currentUser.role === 'cleaner') && (
          <DashboardCard
            title="My Profile"
            description="View your personal staff information and attendance."
            icon={<UserCircleIcon className="h-8 w-8 text-blue-600" />}
            link="/staff/my-data"
          />
        )}

        {currentUser.role === 'accountant' && (
          <DashboardCard
            title="Fee Management"
            description="Manage fee records, payments, and dues."
            icon={<BanknotesIcon className="h-8 w-8 text-purple-600" />}
            link="/fees"
          />
        )}

        {/* Link to specific role dashboard if not already on it */}
        {getDashboardLink() !== '#' && window.location.pathname !== getDashboardLink() && (
            <div className="md:col-span-full lg:col-span-full flex justify-center mt-8">
                <Link to={getDashboardLink()} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-200">
                    Go to {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, icon, link }) => (
  <Link to={link} className="block bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 transform hover:-translate-y-1">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-semibold text-gray-800 ml-4">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </Link>
);

export default Dashboard;
