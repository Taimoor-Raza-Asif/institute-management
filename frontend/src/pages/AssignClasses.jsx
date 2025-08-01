// src/pages/AssignClasses.jsx
import React, { useState, useEffect } from 'react';
import api from '../api'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AssignClasses = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [assignedClassesList, setAssignedClassesList] = useState([]); // Array for individual classes
  const [newClassText, setNewClassText] = useState(''); // Input for adding new class
  const [editingIndex, setEditingIndex] = useState(null); // Index of the class being edited
  const [tempEditValue, setTempEditValue] = useState(''); // Value during inline editing
  const [filterText, setFilterText] = useState(''); // For filtering teachers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await api.get('/staff', config);

        if (Array.isArray(response.data)) {
          const teachersAndAdmins = response.data.filter(
            (staff) => staff.staffType === 'Teacher' || staff.staffType === 'Admin'
          );
          setTeachers(teachersAndAdmins);
        } else {
          setError('Invalid data received from the server.');
          toast.error('Invalid data received from the server.');
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Failed to load teachers. Check console for details.');
        toast.error('Failed to load teachers: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleTeacherChange = (e) => {
    const id = e.target.value;
    setSelectedTeacherId(id);
    const teacher = teachers.find(t => t._id === id);
    setAssignedClassesList(teacher?.assignClasses || []);
    setNewClassText('');
    setEditingIndex(null);
    setTempEditValue('');
  };

  const handleAddClass = () => {
    const trimmedClass = newClassText.trim();
    if (trimmedClass && !assignedClassesList.includes(trimmedClass)) {
      setAssignedClassesList([...assignedClassesList, trimmedClass]);
      setNewClassText('');
    } else if (trimmedClass && assignedClassesList.includes(trimmedClass)) {
      toast.warn('This class is already assigned.');
    }
  };

  const handleEditClass = (index) => {
    setEditingIndex(index);
    setTempEditValue(assignedClassesList[index]);
  };

  const handleSaveEdit = () => {
    const trimmedValue = tempEditValue.trim();
    if (trimmedValue && !assignedClassesList.includes(trimmedValue)) {
      const updatedList = [...assignedClassesList];
      updatedList[editingIndex] = trimmedValue;
      setAssignedClassesList(updatedList);
      setEditingIndex(null);
      setTempEditValue('');
    } else if (trimmedValue && assignedClassesList.includes(trimmedValue) && assignedClassesList[editingIndex] !== trimmedValue) {
      toast.warn('This class name already exists.');
    } else {
      setEditingIndex(null); // Cancel edit if value is empty or unchanged
      setTempEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setTempEditValue('');
  };

  const handleDeleteClass = (index) => {
    const updatedList = assignedClassesList.filter((_, i) => i !== index);
    setAssignedClassesList(updatedList);
    setEditingIndex(null); // Ensure no edit mode is active after deletion
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedTeacherId) {
      setError('Please select a staff member.');
      toast.error('Please select a staff member.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      await api.put(
        `/staff/${selectedTeacherId}/assign-classes`,
        { assignClasses: assignedClassesList }, // Send the whole updated list
        config
      );
      toast.success('Classes assigned successfully!');
      // Update the teacher's assigned classes in the local state
      setTeachers(prevTeachers =>
        prevTeachers.map(t =>
          t._id === selectedTeacherId ? { ...t, assignClasses: assignedClassesList } : t
        )
      );
    } catch (err) {
      console.error('Error assigning classes:', err);
      setError('Failed to assign classes.');
      toast.error('Failed to assign classes: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(filterText.toLowerCase()) ||
    teacher.staffType.toLowerCase().includes(filterText.toLowerCase())
  );

  const selectedTeacherName = teachers.find(t => t._id === selectedTeacherId)?.name || 'N/A';

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl mt-8 mb-8 font-inter">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Assign Classes to Staff</h2>

      {loading && <p className="text-center text-blue-600 text-lg">Loading...</p>}
      {error && <p className="text-center text-red-600 text-lg">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Teacher Selection and Filter */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Select Staff Member</h3>
          <div className="mb-4">
            <label htmlFor="filterTeachers" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Name or Type:
            </label>
            <input
              type="text"
              id="filterTeachers"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
              placeholder="Search teachers..."
            />
          </div>
          <div>
            <label htmlFor="teacherSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Choose Staff Member (Teacher/Admin):
            </label>
            <select
              id="teacherSelect"
              value={selectedTeacherId}
              onChange={handleTeacherChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base bg-white"
              disabled={loading}
            >
              <option value="">-- Select a Staff Member --</option>
              {filteredTeachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} ({teacher.staffType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned Classes Management */}
        {selectedTeacherId && (
          <div className="bg-blue-50 p-6 rounded-lg shadow-inner border border-blue-200">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">
              Assigned Classes for: <span className="font-bold">{selectedTeacherName}</span>
            </h3>

            {/* Add New Class */}
            <div className="flex items-center space-x-3 mb-6">
              <input
                type="text"
                value={newClassText}
                onChange={(e) => setNewClassText(e.target.value)}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
                placeholder="Add new class or semester (e.g., Class 7, BS Semester 3)"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleAddClass}
                className="p-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={loading || !newClassText.trim()}
              >
                <PlusIcon className="h-5 w-5 mr-1" /> Add
              </button>
            </div>

            {/* List of Assigned Classes */}
            {assignedClassesList.length > 0 ? (
              <ul className="space-y-3">
                {assignedClassesList.map((cls, index) => (
                  <li key={index} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-gray-200">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={tempEditValue}
                        onChange={(e) => setTempEditValue(e.target.value)}
                        className="flex-grow px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <span className="text-gray-700 text-lg font-medium">{cls}</span>
                    )}
                    <div className="flex space-x-2">
                      {editingIndex === index ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="p-2 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            aria-label="Save edit"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            aria-label="Cancel edit"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditClass(index)}
                            className="p-2 bg-yellow-500 text-white rounded-full shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            aria-label="Edit class"
                            disabled={loading}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClass(index)}
                            className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            aria-label="Delete class"
                            disabled={loading}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic text-center">No classes assigned yet. Add some above!</p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-200 hover:scale-105"
          disabled={loading || !selectedTeacherId}
        >
          {loading ? 'Saving Changes...' : 'Save Assigned Classes'}
        </button>
      </form>
    </div>
  );
};

export default AssignClasses;
