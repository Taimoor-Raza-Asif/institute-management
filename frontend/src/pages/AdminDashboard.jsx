// src/pages/AdminDashboard.jsx
import React, { useContext } from 'react';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, BriefcaseIcon, BanknotesIcon, UserCircleIcon, Cog6ToothIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import LeaveList from '../components/LeaveList';
const AdminDashboard = () => {
  const { currentUser } = useContext(UserContext);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-8 text-red-600">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-indigo-800 mb-6 text-center">Admin Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">Full control over the Student Management System.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Student Management"
          description="View, add, edit, and delete student records."
          icon={<AcademicCapIcon className="h-8 w-8 text-indigo-600" />}
          link="/students"
        />
        <DashboardCard
          title="Staff Management"
          description="View, add, edit, and delete all staff members."
          icon={<BriefcaseIcon className="h-8 w-8 text-green-600" />}
          link="/staff"
        />
        <DashboardCard
          title="Fee Management"
          description="Oversee all fee records, payments, and financial details."
          icon={<BanknotesIcon className="h-8 w-8 text-purple-600" />}
          link="/fees"
        />
        <DashboardCard
          title="User Accounts"
          description="Create, update, and delete user login accounts."
          icon={<UserCircleIcon className="h-8 w-8 text-blue-600" />}
          link="/admin/users"
        />
        <DashboardCard
          title="Access Control"
          description="Manage edit permissions for different user roles."
          icon={<Cog6ToothIcon className="h-8 w-8 text-orange-600" />}
          link="/admin/access-control"
        />
        <DashboardCard
          title="Overall Reports"
          description="Generate comprehensive reports (e.g., financial, attendance)."
          icon={<ChartBarIcon className="h-8 w-8 text-teal-600" />}
          link="/reports" 
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

export default AdminDashboard;
