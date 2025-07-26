// src/pages/UserManagement.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App'; // Assuming UserContext is provided by App.jsx
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const UserManagement = () => {
  const { currentUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]); // For linking student profiles
  const [staffMembers, setStaffMembers] = useState([]); // For linking staff profiles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'view'

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch user accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfilesForLinking = useCallback(async () => {
    try {
      // Fetch all students (assuming admin can see all)
      const studentsRes = await api.get('/students');
      setStudents(studentsRes.data);

      // Fetch all staff (assuming admin can see all)
      const staffRes = await api.get('/staff');
      setStaffMembers(staffRes.data);
    } catch (err) {
      console.error("Error fetching profiles for linking:", err);
      // Don't set global error, just log. User management can still proceed.
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
      fetchProfilesForLinking();
    }
  }, [currentUser, fetchUsers, fetchProfilesForLinking]);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormMode('add');
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleViewUser = (user) => {
    setEditingUser(user);
    setFormMode('view');
    setShowForm(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user account? This will NOT delete their associated student/staff profile.")) {
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user account.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormMode('add');
    fetchUsers(); // Refresh list after form close
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="text-center py-8 text-red-600">Access Denied: Only administrators can manage users.</div>;
  }

  if (loading) return <div className="text-center py-4">Loading users...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">User Account Management</h2>

      <div className="flex justify-end mb-6">
        <button
          onClick={handleAddUser}
          className="flex items-center bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition duration-200 shadow-md"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Add New User
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit Mode Enabled</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.cnic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.profileId ?
                      `${user.profileId.name || user.profileId.cnic || user.profileId.employeeId} (ID: ${user.profileId._id})`
                      : 'N/A'
                    } ({user.roleMapping})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.editModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.editModeEnabled ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2">
                    <button onClick={() => handleViewUser(user)} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View User Details">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit User">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {currentUser._id !== user._id && ( // Prevent admin from deleting their own user account
                      <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete User">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">No user accounts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          formMode={formMode}
          onClose={handleFormClose}
          students={students}
          staffMembers={staffMembers}
          users={users} 
        />
      )}
    </div>
  );
};

// UserForm.jsx (Nested component for Add/Edit/View User)
const UserForm = ({ user, formMode, onClose, students, staffMembers, users }) => { // <--- Destructured 'users' here
  const [cnic, setCnic] = useState(user?.cnic || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || '');
  const [profileId, setProfileId] = useState(user?.profileId || '');
  const [editModeEnabled, setEditModeEnabled] = useState(user?.editModeEnabled || false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const isViewMode = formMode === 'view';
  const isEditMode = formMode === 'edit';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    const errors = {};
    if (!cnic) errors.cnic = 'CNIC is required.';
    else if (!/^\d{13}$/.test(cnic)) errors.cnic = 'CNIC must be 13 digits.';
    if (!isEditMode && !password) errors.password = 'Password is required for new users.';
    if (!role) errors.role = 'Role is required.';
    if (!profileId) errors.profileId = 'Profile ID is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const userData = { cnic, role, profileId, editModeEnabled };
    if (password) { // Only include password if it's set (for new user or password change)
      userData.password = password;
    }

    try {
      if (isEditMode) {
        await api.put(`/users/${user._id}`, userData);
        alert('User updated successfully!');
      } else {
        await api.post('/users/register', userData);
        alert('User created successfully!');
      }
      onClose();
    } catch (err) {
      console.error("Error saving user:", err.response?.data || err.message);
      setFormError(err.response?.data?.message || 'Failed to save user.');
    }
  };

  const getTitle = () => {
    if (isViewMode) return 'View User Details';
    if (isEditMode) return 'Edit User Account';
    return 'Add New User Account';
  };

  const getAvailableProfiles = useCallback(() => { // Added useCallback for optimization
    if (role === 'student') {
      // Filter out students already linked to a user account
      const linkedStudentIds = users.filter(u => u.role === 'student').map(u => u.profileId?._id); // Access _id
      return students.filter(s => !linkedStudentIds.includes(s._id) || (isEditMode && user?.profileId === s._id));
    } else if (['teacher', 'admin', 'accountant', 'cook', 'cleaner'].includes(role)) {
      // Filter out staff already linked to a user account (excluding the current editing user)
      const linkedStaffIds = users.filter(u => ['teacher', 'admin', 'accountant', 'cook', 'cleaner'].includes(u.role)).map(u => u.profileId?._id); // Access _id
      return staffMembers.filter(s => !linkedStaffIds.includes(s._id) || (isEditMode && user?.profileId === s._id));
    }
    return [];
  }, [role, users, students, staffMembers, isEditMode, user]); // Added dependencies

  // Ensure profileId state is correctly initialized when a user is passed for editing/viewing
  useEffect(() => {
    if (user) {
      setProfileId(user.profileId?._id || ''); // Access _id if profileId is an object
      setRole(user.role || '');
      setCnic(user.cnic || '');
      setEditModeEnabled(user.editModeEnabled || false);
    } else {
      // Reset form fields when adding a new user
      setProfileId('');
      setRole('');
      setCnic('');
      setPassword('');
      setEditModeEnabled(false);
    }
    setFieldErrors({}); // Clear errors when user changes
    setFormError(''); // Clear form error
  }, [user]);


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">{getTitle()}</h3>
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">CNIC</label>
            <input
              type="text"
              id="cnic"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              className={`mt-1 block w-full p-2 border ${fieldErrors.cnic ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
              readOnly={isViewMode || isEditMode} // CNIC cannot be changed after creation
            />
            {fieldErrors.cnic && <p className="text-red-500 text-xs mt-1">{fieldErrors.cnic}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password {isEditMode && "(Leave blank to keep current)"}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full p-2 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
              readOnly={isViewMode}
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setProfileId(''); // Clear profile ID when role changes
              }}
              className={`mt-1 block w-full p-2 border ${fieldErrors.role ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewMode || isEditMode ? 'bg-gray-50' : ''}`}
              disabled={isViewMode || isEditMode} // Role cannot be changed after creation
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="accountant">Accountant</option>
              <option value="cook">Cook</option>
              <option value="cleaner">Cleaner</option>
            </select>
            {fieldErrors.role && <p className="text-red-500 text-xs mt-1">{fieldErrors.role}</p>}
          </div>
          {role && (
            <div>
              <label htmlFor="profileId" className="block text-sm font-medium text-gray-700">Link Profile</label>
              <select
                id="profileId"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className={`mt-1 block w-full p-2 border ${fieldErrors.profileId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
                disabled={isViewMode}
              >
                <option value="">Select Profile</option>
                {getAvailableProfiles().map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.employeeId || p.cnic || p._id})
                  </option>
                ))}
              </select>
              {fieldErrors.profileId && <p className="text-red-500 text-xs mt-1">{fieldErrors.profileId}</p>}
            </div>
          )}
          {isEditMode && ( // Only show edit mode toggle in edit mode
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editModeEnabled"
                checked={editModeEnabled}
                onChange={(e) => setEditModeEnabled(e.target.checked)}
                className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${isViewMode ? 'bg-gray-50' : ''}`}
                disabled={isViewMode}
              />
              <label htmlFor="editModeEnabled" className="ml-2 block text-sm text-gray-900">
                Enable Edit Mode for this User
              </label>
            </div>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                {isEditMode ? 'Update User' : 'Create User'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;