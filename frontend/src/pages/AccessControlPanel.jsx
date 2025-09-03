// // src/pages/AccessControlPanel.jsx
// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import api from '../api';
// import { UserContext } from '../App';
// import { Switch } from '@headlessui/react';
// import { FunnelIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// const AccessControlPanel = () => {
//   const { currentUser } = useContext(UserContext);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // --- Filter States ---
//   const [filterCnic, setFilterCnic] = useState('');
//   const [debouncedFilterCnic, setDebouncedFilterCnic] = useState('');
//   const [filterRole, setFilterRole] = useState('');

//   const userRoles = ['admin', 'student', 'teacher', 'accountant', 'cook', 'cleaner'];

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

//   // Effect to debounce the search term
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedFilterCnic(filterCnic);
//     }, 500);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [filterCnic]);

//   const handleToggleEditMode = async (userToUpdate) => {
//     if (currentUser._id === userToUpdate._id) {
//       alert("You cannot disable your own edit mode from this panel. Please manage your own edit mode via your profile settings if available.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const updatedUser = await api.put(`/users/${userToUpdate._id}/editmode`, {
//         enable: !userToUpdate.editModeEnabled,
//       });
//       setUsers(prevUsers =>
//         prevUsers.map(user =>
//           user._id === userToUpdate._id ? { ...user, editModeEnabled: updatedUser.data.editModeEnabled } : user
//         )
//       );
//       alert(`Edit mode for ${userToUpdate.cnic} (${userToUpdate.role}) ${updatedUser.data.editModeEnabled ? 'enabled' : 'disabled'} successfully.`);
//     } catch (err) {
//       console.error("Error toggling edit mode:", err);
//       setError("Failed to update edit mode. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!currentUser || currentUser.role !== 'admin') {
//     return <div className="text-center py-8 text-red-600">Access Denied: Only administrators can manage access control.</div>;
//   }

//   // Filter the users based on the search and role filters
//   const filteredUsers = users.filter(user => {
//     const cnicMatch = debouncedFilterCnic ? user.cnic.includes(debouncedFilterCnic) : true;
//     const roleMatch = filterRole ? user.role === filterRole : true;
//     return cnicMatch && roleMatch;
//   });

//   return (
//     <div className="container mx-auto p-4 sm:p-6 lg:p-4">
//       <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-14">Access Control Panel</h1>
//       <p className="text-gray-600 mb-8 text-center">Toggle edit permissions for individual users. When 'Edit Mode' is enabled, users can edit their own data until the access mode is closed.</p>

//       <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
//           {/* Search Input */}
//           <div className="relative w-full sm:w-1/2">
//             <input
//               type="text"
//               id="filterCnic"
//               value={filterCnic}
//               onChange={(e) => setFilterCnic(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//               placeholder="Search by CNIC..."
//             />
//             <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//           </div>

//           {/* Role Filter */}
//           <div className="w-full sm:w-auto">
//             <select
//               id="filterRole"
//               value={filterRole}
//               onChange={(e) => setFilterRole(e.target.value)}
//               className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
//             >
//               <option value="">All Roles</option>
//               {userRoles.map(role => (
//                 <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center py-4">Loading access control settings...</div>
//       ) : error ? (
//         <div className="text-center py-4 text-red-500">{error}</div>
//       ) : (
//         <div className="bg-white shadow-lg rounded-lg overflow-hidden">
//           {filteredUsers.length === 0 ? (
//             <p className="p-4 text-center text-gray-500">No user accounts found matching the criteria.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-green-600">
//                   <tr>
//                     <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">CNIC</th>
//                     <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">Role</th>
//                     <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">Linked Profile</th>
//                     <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">Edit Mode Enabled</th>
//                     <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-white border border-white uppercase tracking-wider">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredUsers.map((user) => (
//                     <tr key={user._id} className="hover:bg-gray-50">
//                       {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {user.cnic}
//                       </td> */}
//                       <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
//                         <div className="flex items-center">
//                           {user.profileId.profilePictureUrl ? (
//                             // If profilePictureUrl exists, render the <img> tag
//                             <img
//                               src={`http://localhost:5000${user.profileId.profilePictureUrl}`}
//                               alt={`${user.profileId.cnic}'s Profile`}
//                               className="h-8 w-8 rounded-full object-cover mr-2"
//                               onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/ffffff?text=NA'; }}
//                             />
//                           ) : (
//                             // If not, render the placeholder icon
//                             <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
//                           )}
//                           <span>{user.cnic}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {user.role}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {user.profileId ?
//                           `${user.profileId.name || user.profileId.cnic || user.profileId.employeeId} (ID: ${user.profileId._id})`
//                           : 'N/A'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-center">
//                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.editModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                           {user.editModeEnabled ? 'Yes' : 'No'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
//                         {currentUser._id !== user._id ? (
//                           <Switch
//                             checked={user.editModeEnabled}
//                             onChange={() => handleToggleEditMode(user)}
//                             className={`${user.editModeEnabled ? 'bg-green-600' : 'bg-gray-200'
//                               } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
//                           >
//                             <span className="sr-only">Toggle edit mode</span>
//                             <span
//                               className={`${user.editModeEnabled ? 'translate-x-6' : 'translate-x-1'
//                                 } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
//                             />
//                           </Switch>
//                         ) : (
//                           <span className="text-gray-400">Not available</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccessControlPanel;

// src/pages/AccessControlPanel.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../api";
import { UserContext } from "../App";
import { Switch } from "@headlessui/react";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Loader from "../components/Loader";
import Message from "../components/Message";

const AccessControlPanel = () => {
  const { currentUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter States ---
  const [filterCnic, setFilterCnic] = useState("");
  const [debouncedFilterCnic, setDebouncedFilterCnic] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [toggleAllEnabled, setToggleAllEnabled] = useState(false);

  const userRoles = [
    "admin",
    "student",
    "teacher",
    "accountant",
    "cook",
    "cleaner",
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users for access control:", err);
      setError("Failed to load user access settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "admin") {
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
      alert(
        "You cannot disable your own edit mode from this panel. Please manage your own edit mode via your profile settings if available."
      );
      return;
    }
    setLoading(true);
    try {
      const updatedUser = await api.put(`/users/${userToUpdate._id}/editmode`, {
        enable: !userToUpdate.editModeEnabled,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userToUpdate._id
            ? { ...user, editModeEnabled: updatedUser.data.editModeEnabled }
            : user
        )
      );
    } catch (err) {
      console.error("Error toggling edit mode:", err);
      setError(
        `Failed to toggle edit mode for ${
          userToUpdate.cnic || userToUpdate.email
        }.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAllEditMode = async (enabled) => {
    if (!filterRole) {
      alert("Please select a role to apply this action.");
      setToggleAllEnabled(false);
      return;
    }
    setLoading(true);
    try {
      await api.put(`/users/editmode/${filterRole}`, { enable: enabled });
      // Re-fetch users to reflect the changes
      await fetchUsers();
      alert(
        `Edit mode for all ${filterRole}s has been ${
          enabled ? "enabled" : "disabled"
        }.`
      );
    } catch (err) {
      console.error("Error toggling edit mode for all users:", err);
      setError(`Failed to toggle edit mode for all ${filterRole}s.`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter((user) => user.role !== "admin" || user._id === currentUser._id) // Admins can see their own entry but can't change it
    .filter((user) => {
      // Apply role filter
      const roleMatch = filterRole ? user.role === filterRole : true;
      // Apply CNIC/Email/Name search filter
      const searchMatch = debouncedFilterCnic
        ? (user.cnic &&
            user.cnic
              .toLowerCase()
              .includes(debouncedFilterCnic.toLowerCase())) ||
          (user.email &&
            user.email
              .toLowerCase()
              .includes(debouncedFilterCnic.toLowerCase())) ||
          (user.name &&
            user.name.toLowerCase().includes(debouncedFilterCnic.toLowerCase()))
        : true;
      return roleMatch && searchMatch;
    });

  if (loading && users.length === 0) return <Loader />;

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Access Control Panel
        </h1>
        <p className="text-gray-600 mb-4">
          Manage edit mode access for students and staff.
        </p>

        {error && <Message type="error">{error}</Message>}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0 md:space-x-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by CNIC, email, or name..."
              value={filterCnic}
              onChange={(e) => setFilterCnic(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            />
          </div>

          {/* Role Filter */}
          <div className="flex-shrink-0">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
              >
                <option value="">All Roles</option>
                {userRoles
                  .filter((role) => role !== "admin")
                  .map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {filterRole && (
          <div className="flex items-center space-x-2 my-4">
            <span className="text-gray-700 font-medium">
              Toggle all {filterRole}s' edit mode:
            </span>
            <Switch
              checked={toggleAllEnabled}
              onChange={(checked) => {
                setToggleAllEnabled(checked);
                handleToggleAllEditMode(checked);
              }}
              className={`${toggleAllEnabled ? "bg-green-600" : "bg-gray-200"}
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Toggle all edit mode</span>
              <span
                className={`${
                  toggleAllEnabled ? "translate-x-6" : "translate-x-1"
                }
                  inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
        )}
      </div>

      {loading && users.length > 0 ? (
        <Loader />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <Message type="info">No users found matching the criteria.</Message>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500  uppercase tracking-wider"
                    >
                      Linked Profile
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Edit Mode Enabled
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.cnic}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.profileId
                          ? `${
                              user.profileId.name ||
                              user.profileId.cnic ||
                              user.profileId.employeeId
                            } (ID: ${user.profileId._id})`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.editModeEnabled
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.editModeEnabled ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {currentUser._id !== user._id ? (
                          <Switch
                            checked={user.editModeEnabled}
                            onChange={() => handleToggleEditMode(user)}
                            className={`${
                              user.editModeEnabled
                                ? "bg-green-600"
                                : "bg-gray-200"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                          >
                            <span className="sr-only">Toggle edit mode</span>
                            <span
                              className={`${
                                user.editModeEnabled
                                  ? "translate-x-6"
                                  : "translate-x-1"
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
