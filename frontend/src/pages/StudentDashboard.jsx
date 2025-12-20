// src/pages/StudentDashboard.jsx
import React, { useContext } from 'react';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import { UserCircleIcon, BanknotesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { currentUser } = useContext(UserContext);

  if (!currentUser || currentUser.role !== 'student') {
    return (
      <div className="text-center py-8 text-red-600">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2">You do not have student privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-teal-800 mb-6 text-center">Student Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">Access your personal information and academic records.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="My Profile"
          description="View and manage your personal student information."
          icon={<UserCircleIcon className="h-8 w-8 text-green-600" />}
          link="/students/my-data"
        />
        <DashboardCard
          title="My Fees"
          description="View your fee payment history and current dues."
          icon={<BanknotesIcon className="h-8 w-8 text-purple-600" />}
          link="/fees" // The FeeList component will filter by student's ID
        />
        <DashboardCard
          title="My Attendance"
          description="Check your attendance records."
          icon={<CalendarDaysIcon className="h-8 w-8 text-orange-600" />}
          link="/student/attendance" 
        />
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

export default StudentDashboard;
