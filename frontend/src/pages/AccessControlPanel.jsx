// src/pages/AccessControlPanel.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App';
import { Switch } from '@headlessui/react'; // Example using Headless UI Switch for a nice toggle

const AccessControlPanel = () => {
  const { currentUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users for access control:", err);
      setError("Failed to load user access settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  const handleToggleEditMode = async (userToUpdate) => {
    // Prevent admin from disabling their own edit mode via this panel
    if (currentUser._id === userToUpdate._id) {
      alert("You cannot disable your own edit mode from this panel. Please manage your own edit mode via your profile settings if available.");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await api.put(`/users/${userToUpdate._id}/editmode`, {
        enable: !userToUpdate.editModeEnabled,
      });
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userToUpdate._id ? { ...user, editModeEnabled: updatedUser.data.editModeEnabled } : user
        )
      );
      alert(`Edit mode for ${userToUpdate.cnic} (${userToUpdate.role}) ${updatedUser.data.editModeEnabled ? 'enabled' : 'disabled'} successfully.`);
    } catch (err) {
      console.error("Error toggling edit mode:", err);
      setError("Failed to update edit mode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="text-center py-8 text-red-600">Access Denied: Only administrators can manage access control.</div>;
  }

  if (loading) return <div className="text-center py-4">Loading access control settings...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Access Control Panel</h2>
      <p className="text-gray-600 mb-8 text-center">Toggle edit permissions for individual users. When 'Edit Mode' is enabled, users of that role can edit their own data or data they are authorized to modify (e.g., teachers editing student data).</p>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit Mode Enabled</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
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
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.profileId} ({user.roleMapping})
                  </td> */}
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.profileId ?
                      `${user.profileId.name || user.profileId.cnic || user.profileId.employeeId} (ID: ${user.profileId._id})`
                      : 'N/A'} ({user.roleMapping})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.editModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.editModeEnabled ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {currentUser._id !== user._id ? ( // Admin cannot toggle their own edit mode here
                      <Switch
                        checked={user.editModeEnabled}
                        onChange={() => handleToggleEditMode(user)}
                        className={`${
                          user.editModeEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      >
                        <span className="sr-only">Enable notifications</span>
                        <span
                          className={`${
                            user.editModeEnabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    ) : (
                      <span className="text-gray-400 text-xs">Manage in Profile</span>
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
    </div>
  );
};

export default AccessControlPanel;
