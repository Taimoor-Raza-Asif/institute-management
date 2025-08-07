// // src/pages/AccessControlPanel.jsx
// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import api from '../api';
// import { UserContext } from '../App';
// import { Switch } from '@headlessui/react';
// import { ShieldCheckIcon } from '@heroicons/react/24/outline';
// import Loader from '../components/Loader';
// import Message from '../components/Message';

// const AccessControlPanel = () => {
//   const { currentUser } = useContext(UserContext);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchUsers = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await api.get('/users');
//       setUsers(response.data);
//     } catch (err) {
//       console.error("Error fetching users for access control:", err);
//       setError("Failed to load user access settings.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (currentUser?.role === 'admin') {
//       fetchUsers();
//     }
//   }, [currentUser, fetchUsers]);

//   const handleToggleEditMode = async (userToUpdate) => {
//     if (currentUser._id === userToUpdate._id) {
//       alert("You cannot disable your own edit mode.");
//       return;
//     }
//     const newEditMode = !userToUpdate.canEditStaff;
//     try {
//       await api.put(`/users/${userToUpdate._id}`, { canEditStaff: newEditMode });
//       setUsers(prevUsers =>
//         prevUsers.map(user =>
//           user._id === userToUpdate._id ? { ...user, canEditStaff: newEditMode } : user
//         )
//       );
//     } catch (err) {
//       console.error("Error updating user access:", err);
//       setError("Failed to update user access.");
//     }
//   };

//   if (!currentUser || currentUser.role !== 'admin') {
//     return <div className="text-center py-8 text-red-600">Access Denied: Only administrators can manage access.</div>;
//   }

//   return (
//     <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-6xl">
//       <div className="flex justify-between items-center mb-6 border-b pb-4">
//         <h2 className="text-3xl font-bold text-gray-800 flex items-center">
//           <ShieldCheckIcon className="h-8 w-8 mr-3 text-green-600" />
//           Access Control Panel
//         </h2>
//       </div>

//       {loading ? (
//         <Loader />
//       ) : error ? (
//         <Message type="error">{error}</Message>
//       ) : users.length === 0 ? (
//         <Message type="info">No users found.</Message>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can Edit Staff</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {users.map(user => (
//                 <tr key={user._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {`${user.profileId?.name} (${user.cnic})` || user.cnic}
//                   </td>

//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.canEditStaff ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                       {user.canEditStaff ? 'Yes' : 'No'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     <Switch
//                       checked={user.canEditStaff}
//                       onChange={() => handleToggleEditMode(user)}
//                       className={`${user.canEditStaff ? 'bg-green-600' : 'bg-gray-200'
//                         } relative inline-flex h-6 w-11 items-center rounded-full`}
//                     >
//                       <span className="sr-only">Enable edit mode for staff</span>
//                       <span
//                         className={`${user.canEditStaff ? 'translate-x-6' : 'translate-x-1'
//                           } inline-block h-4 w-4 transform rounded-full bg-white transition`}
//                       />
//                     </Switch>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccessControlPanel;



// src/pages/AccessControlPanel.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App';
import { Switch } from '@headlessui/react';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AccessControlPanel = () => {
  const { currentUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Effect to debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterCnic(filterCnic);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filterCnic]);

  const handleToggleEditMode = async (userToUpdate) => {
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

  // Filter the users based on the search and role filters
  const filteredUsers = users.filter(user => {
    const cnicMatch = debouncedFilterCnic ? user.cnic.includes(debouncedFilterCnic) : true;
    const roleMatch = filterRole ? user.role === filterRole : true;
    return cnicMatch && roleMatch;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">Access Control Panel</h1>
      <p className="text-gray-600 mb-8 text-center">Toggle edit permissions for individual users. When 'Edit Mode' is enabled, users can edit their own data until the access mode is closed.</p>

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

          {/* Role Filter */}
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
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading access control settings...</div>
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
                    <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">CNIC</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">Linked Profile</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">Edit Mode Enabled</th>
                    <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">Action</th>
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
                          `${user.profileId.name || user.profileId.cnic || user.profileId.employeeId} (ID: ${user.profileId._id})`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.editModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.editModeEnabled ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {currentUser._id !== user._id ? (
                          <Switch
                            checked={user.editModeEnabled}
                            onChange={() => handleToggleEditMode(user)}
                            className={`${
                              user.editModeEnabled ? 'bg-green-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                          >
                            <span className="sr-only">Toggle edit mode</span>
                            <span
                              className={`${
                                user.editModeEnabled ? 'translate-x-6' : 'translate-x-1'
                              } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
                            />
                          </Switch>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessControlPanel;