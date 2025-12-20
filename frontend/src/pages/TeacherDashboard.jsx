// src/pages/TeacherDashboard.jsx
import React, { useContext } from 'react';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, UserCircleIcon, CalendarDaysIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const TeacherDashboard = () => {
  const { currentUser } = useContext(UserContext);

  if (!currentUser || currentUser.role !== 'teacher') {
    return (
      <div className="text-center py-8 text-red-600">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2">You do not have teacher privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">Teacher Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">Manage your profile and students in your subjects.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="My Profile"
          description="View and update your personal staff information."
          icon={<UserCircleIcon className="h-8 w-8 text-green-600" />}
          link="/staff/my-data"
        />
        <DashboardCard
          title="My Students"
          description="View students assigned to your subjects and manage their records."
          icon={<AcademicCapIcon className="h-8 w-8 text-green-600" />}
          link="/students"
        />
        <DashboardCard
          title="My Attendance"
          description="View your attendance records."
          icon={<CalendarDaysIcon className="h-8 w-8 text-orange-600" />}
          link="/staff/my-data" // Link to staff form which will show attendance
        />
        <DashboardCard
          title="My Subjects"
          description="View details about the subjects you teach."
          icon={<BookOpenIcon className="h-8 w-8 text-purple-600" />}
          link="/teacher/subjects"
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

export default TeacherDashboard;
