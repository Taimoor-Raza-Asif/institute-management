// src/pages/AccessControlPanel.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../api";
import { UserContext } from "../App";
import { Switch } from "@headlessui/react";
import { FunnelIcon, MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Loader from "../components/Loader";
import Message from "../components/Message";
import ConfirmationModal from "../components/ConfirmationModal";
import { useTheme } from "../context/ThemeContext";

const AccessControlPanel = () => {
  const { currentUser } = useContext(UserContext);
  const { currentTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterCnic, setFilterCnic] = useState("");
  const [debouncedFilterCnic, setDebouncedFilterCnic] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [toggleAllEnabled, setToggleAllEnabled] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const userRoles = ["admin", "student", "teacher", "accountant", "cook", "cleaner"];

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
      setInfoMessage("You cannot disable your own edit mode from this panel. Please manage your own edit mode via your profile settings if available.");
      setShowInfoModal(true);
      return;
    }
    setLoading(true);
    try {
      const updatedUser = await api.put(`/users/${userToUpdate._id}/editmode`, { enable: !userToUpdate.editModeEnabled });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userToUpdate._id ? { ...user, editModeEnabled: updatedUser.data.editModeEnabled } : user))
      );
    } catch (err) {
      console.error("Error toggling edit mode:", err);
      setError(`Failed to toggle edit mode for ${userToUpdate.cnic || userToUpdate.email}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAllEditMode = async (enabled) => {
    if (!filterRole) {
      setInfoMessage("Please select a role to apply this action.");
      setShowInfoModal(true);
      setToggleAllEnabled(false);
      return;
    }
    setConfirmMessage(`Are you sure you want to ${enabled ? "enable" : "disable"} edit mode for all ${filterRole}s?`);
    setConfirmAction(() => async () => {
      setShowConfirmModal(false);
      setLoading(true);
      try {
        await api.put(`/users/editmode/${filterRole}`, { enable: enabled });
        await fetchUsers();
        setInfoMessage(`Edit mode for all ${filterRole}s has been ${enabled ? "enabled" : "disabled"}.`);
        setShowInfoModal(true);
      } catch (err) {
        console.error("Error toggling edit mode for all users:", err);
        setError(`Failed to toggle edit mode for all ${filterRole}s.`);
      } finally {
        setLoading(false);
      }
    });
    setShowConfirmModal(true);
  };

  const filteredUsers = users
    .filter((user) => user.role !== "admin" || user._id === currentUser._id)
    .filter((user) => {
      const roleMatch = filterRole ? user.role === filterRole : true;
      const searchMatch = debouncedFilterCnic
        ? (user.cnic && user.cnic.toLowerCase().includes(debouncedFilterCnic.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(debouncedFilterCnic.toLowerCase())) ||
          (user.name && user.name.toLowerCase().includes(debouncedFilterCnic.toLowerCase()))
        : true;
      return roleMatch && searchMatch;
    });

  if (loading && users.length === 0) return <Loader />;

  return (
    <div className={`container mx-auto p-6 sm:p-8 min-h-screen ${currentTheme?.mainBg || "bg-gray-50"}`}>
      <div className={`mb-8 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${currentTheme?.heroBg || "bg-emerald-50"} ${currentTheme?.shadow || "shadow-lg"}`}>
        <div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold ${currentTheme?.heroTitle || "text-green-800"}`}>Access Control Panel</h1>
          <p className={`${currentTheme?.heroSubtitle || "text-gray-600"} mt-2 text-sm`}>Search users, filter by role, and toggle edit permissions.</p>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <div className="px-3 py-2 rounded-xl bg-white/70 shadow-sm border border-gray-100">
            <span className="font-semibold text-gray-800">{filteredUsers.length}</span> visible
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/70 shadow-sm border border-gray-100">
            <span className="font-semibold text-gray-800">{users.length}</span> total
          </div>
        </div>
      </div>

      <div className={`mb-6 p-6 rounded-2xl ${currentTheme?.cardBg || "bg-white"} ${currentTheme?.shadow || "shadow-lg"} ${currentTheme?.border || "border border-gray-100"}`}>
        {error && <Message type="error">{error}</Message>}

        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${currentTheme?.mutedText || "text-gray-400"}`} />
            <input
              type="text"
              placeholder="Search by CNIC, email, or name..."
              value={filterCnic}
              onChange={(e) => setFilterCnic(e.target.value)}
              className={`w-full h-12 pl-10 pr-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 transition ${currentTheme?.inputBg || "border-gray-200 bg-gray-50"} ${currentTheme?.inputText || "text-gray-800"}`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-56">
              <FunnelIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${currentTheme?.mutedText || "text-gray-400"}`} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`w-full h-12 pl-10 pr-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 transition ${currentTheme?.inputBg || "border-gray-200 bg-white"} ${currentTheme?.inputText || "text-gray-800"}`}
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

            <div className={`flex items-center justify-between gap-3 px-4 h-12 rounded-xl border ${currentTheme?.border || "border-gray-200"} ${currentTheme?.cardBg || "bg-white"} ${currentTheme?.shadow || "shadow-sm"} w-full sm:w-auto min-w-[200px]`}>
              <div className="text-sm">
                <p className={`${currentTheme?.subtitle || "text-gray-700"} font-semibold text-xs leading-tight`}>Bulk toggle</p>
                <p className={`${currentTheme?.mutedText || "text-gray-500"} text-[10px] leading-tight`}>Apply to selected role</p>
              </div>
              <Switch
                checked={toggleAllEnabled}
                onChange={(checked) => {
                  setToggleAllEnabled(checked);
                  handleToggleAllEditMode(checked);
                }}
                className={`${toggleAllEnabled ? "bg-green-600" : "bg-gray-200"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex-shrink-0`}
              >
                <span className="sr-only">Toggle all edit mode</span>
                <span className={`${toggleAllEnabled ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`} />
              </Switch>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setToggleAllEnabled(false);
        }}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
        message={confirmMessage}
      />

      <ConfirmationModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        onConfirm={() => setShowInfoModal(false)}
        message={infoMessage}
      />

      {loading && users.length > 0 ? (
        <Loader />
      ) : (
        <div className={`p-6 rounded-2xl ${currentTheme?.cardBg || "bg-white"} ${currentTheme?.shadow || "shadow-lg"} ${currentTheme?.border || "border border-gray-100"}`}>
          {filteredUsers.length === 0 ? (
            <Message type="info">No users found matching the criteria.</Message>
          ) : (
            <div className="overflow-x-auto rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${currentTheme?.theadBg || "bg-gradient-to-r from-green-600 to-emerald-600"}`}>
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-xl">Name</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Edit Mode</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className={`${currentTheme?.tbodyBg || "bg-white"} divide-y divide-gray-100`}>
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id} className={`transition-all duration-150 hover:bg-green-50 hover:shadow-md ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profileId?.profilePictureUrl ? (
                            <img
                              src={`http://localhost:5000${user.profileId.profilePictureUrl}`}
                              alt={`${user.profileId?.name || 'User'}'s Profile`}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-green-200"
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/cccccc/ffffff?text=NA'; }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-green-200">
                              <UserCircleIcon className={`h-6 w-6 ${currentTheme?.mutedText || "text-green-700"}`} />
                            </div>
                          )}
                          <div className="ml-3">
                            <div className={`text-sm font-semibold ${currentTheme?.text || "text-gray-900"}`}>{user.profileId?.name || user.name || "Unnamed user"}</div>
                            <div className={`text-xs ${currentTheme?.mutedText || "text-gray-500"}`}>{user.cnic || user.email || "No identifier"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${user.role === "admin" ? (currentTheme?.roleAdminPill || "bg-green-100 text-green-800") : (currentTheme?.rolePill || "bg-gray-100 text-gray-800")}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${user.editModeEnabled ? (currentTheme?.successPill || "bg-green-100 text-green-800") : (currentTheme?.errorPill || "bg-red-100 text-red-800")}`}>
                          {user.editModeEnabled ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {currentUser._id !== user._id ? (
                          <Switch
                            checked={user.editModeEnabled}
                            onChange={() => handleToggleEditMode(user)}
                            className={`${user.editModeEnabled ? (currentTheme?.switchOn || "bg-green-600") : (currentTheme?.switchOff || "bg-gray-200")} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                          >
                            <span className="sr-only">Toggle edit mode</span>
                            <span className={`${user.editModeEnabled ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`} />
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
