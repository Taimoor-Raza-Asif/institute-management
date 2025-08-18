// src/pages/UserManagement.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App'; // Assuming UserContext is provided by App.jsx
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Modal from '../components/Modal'; // Assuming a Modal component exists

// UserForm.jsx (Nested component for Add/Edit/View User)
const UserForm = ({ user, formMode, onClose, students, staffMembers, users }) => {
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
    if (password) {
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

  const getAvailableProfiles = useCallback(() => {
    if (role === 'student') {
      const linkedStudentIds = users.filter(u => u.role === 'student').map(u => u.profileId?._id);
      return students.filter(s => !linkedStudentIds.includes(s._id) || (isEditMode && user?.profileId === s._id));
    } else if (['teacher', 'admin', 'accountant', 'cook', 'cleaner'].includes(role)) {
      const linkedStaffIds = users.filter(u => ['teacher', 'admin', 'accountant', 'cook', 'cleaner'].includes(u.role)).map(u => u.profileId?._id);
      return staffMembers.filter(s => !linkedStaffIds.includes(s._id) || (isEditMode && user?.profileId === s._id));
    }
    return [];
  }, [role, users, students, staffMembers, isEditMode, user]);

  useEffect(() => {
    if (user) {
      setProfileId(user.profileId?._id || '');
      setRole(user.role || '');
      setCnic(user.cnic || '');
      setEditModeEnabled(user.editModeEnabled || false);
    } else {
      setProfileId('');
      setRole('');
      setCnic('');
      setPassword('');
      setEditModeEnabled(false);
    }
    setFieldErrors({});
    setFormError('');
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
              className={`mt-1 block w-full p-2 border ${fieldErrors.cnic ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
              readOnly={isViewMode || isEditMode}
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
              className={`mt-1 block w-full p-2 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
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
                setProfileId('');
              }}
              className={`mt-1 block w-full p-2 border ${fieldErrors.role ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode || isEditMode ? 'bg-gray-50' : ''}`}
              disabled={isViewMode || isEditMode}
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
                className={`mt-1 block w-full p-2 border ${fieldErrors.profileId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isViewMode ? 'bg-gray-50' : ''}`}
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
          {isEditMode && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editModeEnabled"
                checked={editModeEnabled}
                onChange={(e) => setEditModeEnabled(e.target.checked)}
                className={`h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ${isViewMode ? 'bg-gray-50' : ''}`}
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
                className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
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


const UserManagement = () => {
  const { currentUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formMode, setFormMode] = useState('add');

  // --- Filter States ---
  const [filterCnic, setFilterCnic] = useState('');
  const [debouncedFilterCnic, setDebouncedFilterCnic] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const userRoles = ['admin', 'student', 'teacher', 'accountant', 'cook', 'cleaner'];

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
      const studentsRes = await api.get('/students');
      setStudents(studentsRes.data);

      const staffRes = await api.get('/staff');
      setStaffMembers(staffRes.data);
    } catch (err) {
      console.error("Error fetching profiles for linking:", err);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
      fetchProfilesForLinking();
    }
  }, [currentUser, fetchUsers, fetchProfilesForLinking]);

  // Effect to debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterCnic(filterCnic);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filterCnic]);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormMode('add');
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleViewUser = (user) => {
    setEditingUser(user);
    setFormMode('view');
    setIsFormModalOpen(true);
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
    setIsFormModalOpen(false);
    setEditingUser(null);
    setFormMode('add');
    fetchUsers();
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="text-center py-8 text-red-600">Access Denied: Only administrators can manage users.</div>;
  }

  // Filter the users based on the search and role filters
  const filteredUsers = users.filter(user => {
    const cnicMatch = debouncedFilterCnic ? user.cnic.includes(debouncedFilterCnic) : true;
    const roleMatch = filterRole ? user.role === filterRole : true;
    return cnicMatch && roleMatch;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">User Account Management</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              id="filterCnic"
              value={filterCnic}
              onChange={(e) => setFilterCnic(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Search by CNIC..."
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* Role Filter and Add User Button */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              <select
                id="filterRole"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Roles</option>
                {userRoles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddUser}
              className="flex items-center justify-center bg-green-600 font-semibold text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" /> Add New User
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {filteredUsers.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No user accounts found matching the criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-600">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-base text-white border border-white uppercase tracking-wider">CNIC</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-base text-white border border-white uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-base text-white border border-white uppercase tracking-wider">Linked Profile</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-base text-white border border-white uppercase tracking-wider">Edit Mode</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-base text-white border border-white uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.cnic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.profileId ?
                          `${user.profileId.name || user.profileId.cnic || user.profileId.employeeId} (${user.roleMapping})`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.editModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.editModeEnabled ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleViewUser(user)} className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100" title="View User Details">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-md hover:bg-blue-100" title="Edit User">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          {currentUser._id !== user._id && (
                            <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-md hover:bg-red-100" title="Delete User">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isFormModalOpen && (
        <Modal isOpen={isFormModalOpen} onClose={handleFormClose} title={formMode === 'add' ? 'Add New User' : formMode === 'edit' ? 'Edit User' : 'View User'}>
          <UserForm
            user={editingUser}
            formMode={formMode}
            onClose={handleFormClose}
            students={students}
            staffMembers={staffMembers}
            users={users}
          />
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;