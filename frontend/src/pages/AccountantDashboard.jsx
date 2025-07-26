// src/pages/AccountantDashboard.jsx
import React, { useContext } from 'react';
import { UserContext } from '../App';
import { Link } from 'react-router-dom';
import { BanknotesIcon, ChartBarIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const AccountantDashboard = () => {
  const { currentUser } = useContext(UserContext);

  if (!currentUser || currentUser.role !== 'accountant') {
    return (
      <div className="text-center py-8 text-red-600">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2">You do not have accountant privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-purple-800 mb-6 text-center">Accountant Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">Manage all financial aspects of the institution.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Fee Management"
          description="View, add, edit, and delete fee records."
          icon={<BanknotesIcon className="h-8 w-8 text-purple-600" />}
          link="/fees"
        />
        <DashboardCard
          title="My Profile"
          description="View and update your personal staff information."
          icon={<UserCircleIcon className="h-8 w-8 text-blue-600" />}
          link="/staff/my-data"
        />
        <DashboardCard
          title="Bill Management"
          description="Handle utility bills and other expenses."
          icon={<BanknotesIcon className="h-8 w-8 text-red-600" />}
          link="/bills" 
        />
        <DashboardCard
          title="Donation Management"
          description="Track and manage donations received."
          icon={<BanknotesIcon className="h-8 w-8 text-yellow-600" />}
          link="/donations" 
        />
        <DashboardCard
          title="Financial Reports"
          description="Generate financial summaries and reports."
          icon={<ChartBarIcon className="h-8 w-8 text-teal-600" />}
          link="/financial-reports" 
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

export default AccountantDashboard;
