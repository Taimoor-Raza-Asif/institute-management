// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import api from '../api';
// import { MagnifyingGlassIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
// import Loader from "../components/Loader";
// import Message from "../components/Message";

// const AssignClasses = () => {
//     const [staffList, setStaffList] = useState([]);
//     const [allTeachers, setAllTeachers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState("");

//     const [showAssignmentForm, setShowAssignmentForm] = useState(false);
//     const [selectedStaff, setSelectedStaff] = useState("");
//     const [assignmentsForSelectedTeacher, setAssignmentsForSelectedTeacher] = useState([]);
//     const [newAssignments, setNewAssignments] = useState([]);

//     const [searchTermTeachers, setSearchTermTeachers] = useState("");
//     const [filteredStaffList, setFilteredStaffList] = useState([]);

//     const [currentAssignment, setCurrentAssignment] = useState({
//         type: "Class",
//         classNumber: "",
//         degreeName: "",
//         semester: "",
//         subjects: [""]
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const [editingAssignmentIndex, setEditingAssignmentIndex] = useState(null);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
//     const [filterType, setFilterType] = useState("All");

//     const fetchTeachers = useCallback(async () => {
//         try {
//             const res = await api.get("/staff?staffType=Teacher");
//             const teachers = Array.isArray(res.data) ? res.data : res.data.data || [];
//             setStaffList(teachers);
//             setFilteredStaffList(teachers);
//         } catch (err) {
//             console.error(err);
//             setError("Failed to fetch teacher list.");
//             setStaffList([]);
//             setFilteredStaffList([]);
//         }
//     }, []);

//     const fetchAssignedTeachers = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const res = await api.get("/staff?staffType=Teacher");
//             const teachersWithAssignments = res.data.filter(teacher => teacher.assignClasses && teacher.assignClasses.length > 0);
//             setAllTeachers(teachersWithAssignments);
//         } catch (err) {
//             console.error(err);
//             setError("Failed to fetch assigned classes.");
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchTeachers();
//         fetchAssignedTeachers();
//     }, [fetchTeachers, fetchAssignedTeachers]);

//     useEffect(() => {
//         const handler = setTimeout(() => {
//             setDebouncedSearchTerm(searchTerm);
//         }, 500);
//         return () => {
//             clearTimeout(handler);
//         };
//     }, [searchTerm]);

//     useEffect(() => {
//         const lowercasedSearchTerm = searchTermTeachers.toLowerCase();
//         const filtered = staffList.filter(teacher =>
//             teacher.name.toLowerCase().includes(lowercasedSearchTerm)
//         );
//         setFilteredStaffList(filtered);
//     }, [searchTermTeachers, staffList]);

//     const handleAssignmentInputChange = (e) => {
//         const { name, value } = e.target;
//         setCurrentAssignment(prev => ({ ...prev, [name]: value }));
//         setFormErrors(prev => ({ ...prev, [name]: "" }));
//     };

//     const handleSubjectChange = (value, index) => {
//         const updatedSubjects = [...currentAssignment.subjects];
//         updatedSubjects[index] = value;
//         setCurrentAssignment(prev => ({ ...prev, subjects: updatedSubjects }));
//         setFormErrors(prev => ({ ...prev, subjects: "" }));
//     };

//     const handleRemoveSubject = (index) => {
//         const updatedSubjects = currentAssignment.subjects.filter((_, i) => i !== index);
//         setCurrentAssignment(prev => ({ ...prev, subjects: updatedSubjects }));
//     };

//     const validateAssignmentForm = (currentAssignmentsList, currentItemIndex = null) => {
//         let errors = {};
//         let isValid = true;
        
//         const assignment = {
//             ...currentAssignment,
//             subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
//         };

//         if (assignment.type === "Class") {
//             if (!assignment.classNumber.trim()) {
//                 errors.classNumber = "Class number is required.";
//                 isValid = false;
//             } else {
//                 const isDuplicate = currentAssignmentsList.some((a, i) =>
//                     i !== currentItemIndex && a.type === "Class" && a.classNumber === assignment.classNumber
//                 );
//                 if (isDuplicate) {
//                     errors.classNumber = "This class is already assigned to this teacher.";
//                     isValid = false;
//                 }
//             }
//         } else {
//             if (!assignment.degreeName.trim()) {
//                 errors.degreeName = "Degree name is required.";
//                 isValid = false;
//             }
//             if (!assignment.semester || assignment.semester <= 0) {
//                 errors.semester = "Semester must be a positive number.";
//                 isValid = false;
//             } else {
//                 const isDuplicate = currentAssignmentsList.some((a, i) =>
//                     i !== currentItemIndex && a.type === "BS" && a.degreeName === assignment.degreeName && a.semester == assignment.semester
//                 );
//                 if (isDuplicate) {
//                     errors.degreeName = "This BS degree and semester is already assigned to this teacher.";
//                     isValid = false;
//                 }
//             }
//         }

//         if (assignment.subjects.length === 0) {
//             errors.subjects = "At least one subject is required.";
//             isValid = false;
//         }

//         setFormErrors(errors);
//         return isValid;
//     };

//     const handleAddAssignmentToList = (e) => {
//         e.preventDefault();
//         setSuccessMessage("");
//         setError(null);

//         const currentAssignmentsList = [...assignmentsForSelectedTeacher, ...newAssignments];

//         if (!validateAssignmentForm(currentAssignmentsList)) {
//             return;
//         }
        
//         const assignment = {
//             ...currentAssignment,
//             subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
//         };

//         setNewAssignments(prev => [...prev, assignment]);
//         resetCurrentAssignmentForm();
//     };

//     const handleUpdateAssignment = (e) => {
//         e.preventDefault();
//         setSuccessMessage("");
//         setError(null);

//         const combinedList = [...assignmentsForSelectedTeacher, ...newAssignments];
//         if (!validateAssignmentForm(combinedList, editingAssignmentIndex)) {
//             return;
//         }

//         const assignment = {
//             ...currentAssignment,
//             subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
//         };
        
//         const updatedAssignments = [...assignmentsForSelectedTeacher];
//         updatedAssignments[editingAssignmentIndex] = assignment;
//         setAssignmentsForSelectedTeacher(updatedAssignments);

//         resetCurrentAssignmentForm();
//     }

//     const resetCurrentAssignmentForm = () => {
//         setCurrentAssignment({
//             type: "Class",
//             classNumber: "",
//             degreeName: "",
//             semester: "",
//             subjects: [""]
//         });
//         setEditingAssignmentIndex(null);
//         setFormErrors({});
//     };

//     const handleEditAssignmentFromList = (index) => {
//         const assignmentToEdit = newAssignments[index];
//         setCurrentAssignment(assignmentToEdit);
//         setEditingAssignmentIndex(index);
//     };

//     const handleRemoveAssignmentFromList = (index) => {
//         if (window.confirm("Are you sure you want to remove this assignment from the list?")) {
//             setNewAssignments(prev => prev.filter((_, i) => i !== index));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSuccessMessage("");
//         setError(null);

//         if (!selectedStaff) {
//             setError("Please select a teacher.");
//             return;
//         }
//         const combinedAssignments = [...assignmentsForSelectedTeacher, ...newAssignments];
//         if (combinedAssignments.length === 0) {
//             setError("Please add at least one assignment to the list.");
//             return;
//         }

//         try {
//             await api.put(`/staff/${selectedStaff}/assign-classes`, { assignClasses: combinedAssignments });
//             setSuccessMessage("Assignments updated successfully!");
//             resetMainForm();
//             fetchAssignedTeachers();
//         } catch (err) {
//             console.error(err);
//             setError(err.response?.data?.message || "Failed to save assignments.");
//         }
//     };

//     const resetMainForm = () => {
//         setSelectedStaff("");
//         setAssignmentsForSelectedTeacher([]);
//         setNewAssignments([]);
//         resetCurrentAssignmentForm();
//         setShowAssignmentForm(false);
//     };

//     const handleEditTableAssignment = (teacherId, assignmentIndex) => {
//         setSuccessMessage("");
//         setError(null);
//         const teacher = allTeachers.find(t => t._id === teacherId);
//         if (!teacher) return;
        
//         setSelectedStaff(teacherId);
//         const assignments = teacher.assignClasses || [];
//         setAssignmentsForSelectedTeacher(assignments);
        
//         const assignmentToEdit = assignments[assignmentIndex];
//         setCurrentAssignment(assignmentToEdit);
//         setEditingAssignmentIndex(assignmentIndex);

//         setShowAssignmentForm(true);
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };
    
//     const handleDeleteTableAssignment = async (teacherId, assignmentIndex) => {
//         if (!window.confirm("Are you sure you want to delete this specific assignment?")) return;
    
//         try {
//             const teacher = allTeachers.find(t => t._id === teacherId);
//             if (!teacher) throw new Error("Teacher not found.");
            
//             const updatedAssignments = teacher.assignClasses.filter((_, i) => i !== assignmentIndex);
            
//             await api.put(`/staff/${teacherId}/assign-classes`, { assignClasses: updatedAssignments });
//             setSuccessMessage("Assignment deleted successfully!");
//             fetchAssignedTeachers();
//         } catch (err) {
//             console.error(err);
//             setError(err.response?.data?.message || "Failed to delete assignment.");
//         }
//     };

//     const filteredTeachersAndAssignments = useMemo(() => {
//         const allAssignments = allTeachers.flatMap(teacher =>
//             teacher.assignClasses.map((assignment, index) => ({
//                 ...assignment,
//                 teacherName: teacher.name,
//                 teacherId: teacher._id,
//                 assignmentIndex: index
//             }))
//         );

//         return allAssignments.filter(item => {
//             const typeMatch = filterType === "All" || item.type === filterType;
//             const nameMatch = item.teacherName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
//             return typeMatch && nameMatch;
//         });
//     }, [allTeachers, debouncedSearchTerm, filterType]);

//     return (
//         <div className="container mx-auto p-4 sm:p-6 lg:p-8">
//             <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-8">Assign Classes to Teachers</h1>
//             {successMessage && <Message type="success" text={successMessage} />}
//             {error && <Message type="error" text={error} />}

//             <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
//                     <div className="relative w-full sm:w-1/2 lg:w-2/3">
//                         <input
//                             type="text"
//                             placeholder="Search by teacher name..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//                         />
//                         <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     </div>
//                     <div className="w-full sm:w-auto">
//                         <select
//                             value={filterType}
//                             onChange={(e) => setFilterType(e.target.value)}
//                             className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//                         >
//                             <option value="All">All Types</option>
//                             <option value="Class">Class</option>
//                             <option value="BS">BS Degree</option>
//                         </select>
//                     </div>
//                     <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//                         <button
//                             onClick={() => setShowAssignmentForm(!showAssignmentForm)}
//                             className="flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
//                         >
//                             <PlusIcon className="h-5 w-5 mr-2" />
//                             {showAssignmentForm ? 'Hide Form' : 'Assign Classes'}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showAssignmentForm && (
//                 <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Assignment Form</h3>
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
//                             <h4 className="text-lg font-semibold text-gray-800 mb-4">Teacher Selection</h4>
//                             <div>
//                                 <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">Select Teacher</label>
//                                 <div className="relative">
//                                     <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                     <input
//                                         type="text"
//                                         placeholder="Search teachers..."
//                                         value={searchTermTeachers}
//                                         onChange={(e) => setSearchTermTeachers(e.target.value)}
//                                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//                                     />
//                                 </div>
//                                 <select
//                                     id="teacher"
//                                     value={selectedStaff}
//                                     onChange={(e) => { setSelectedStaff(e.target.value); setAssignmentsForSelectedTeacher([]); setNewAssignments([]); }}
//                                     className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//                                     required
//                                 >
//                                     <option value="" disabled>Select a teacher</option>
//                                     {filteredStaffList.map((staff) => (
//                                         <option key={staff._id} value={staff._id}>
//                                             {staff.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
//                             <h4 className="text-lg font-semibold text-gray-800 mb-4">{editingAssignmentIndex !== null ? "Edit Assignment" : "Add New Assignment"}</h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
//                                 <div>
//                                     <label htmlFor="assignType" className="block text-sm font-medium text-gray-700">Assignment Type</label>
//                                     <select
//                                         id="assignType"
//                                         name="type"
//                                         value={currentAssignment.type}
//                                         onChange={handleAssignmentInputChange}
//                                         className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//                                         required
//                                         disabled={editingAssignmentIndex !== null}
//                                     >
//                                         <option value="Class">Class</option>
//                                         <option value="BS">BS Degree</option>
//                                     </select>
//                                 </div>
//                                 {currentAssignment.type === "Class" ? (
//                                     <div>
//                                         <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700">Class Number</label>
//                                         <input
//                                             id="classNumber"
//                                             name="classNumber"
//                                             type="text"
//                                             value={currentAssignment.classNumber}
//                                             onChange={handleAssignmentInputChange}
//                                             className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.classNumber ? 'border-red-500' : 'border-gray-300'}`}
//                                         />
//                                         {formErrors.classNumber && <p className="mt-1 text-sm text-red-600">{formErrors.classNumber}</p>}
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <div>
//                                             <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
//                                             <input
//                                                 id="degreeName"
//                                                 name="degreeName"
//                                                 type="text"
//                                                 value={currentAssignment.degreeName}
//                                                 onChange={handleAssignmentInputChange}
//                                                 className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.degreeName ? 'border-red-500' : 'border-gray-300'}`}
//                                             />
//                                             {formErrors.degreeName && <p className="mt-1 text-sm text-red-600">{formErrors.degreeName}</p>}
//                                         </div>
//                                         <div>
//                                             <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
//                                             <input
//                                                 id="semester"
//                                                 name="semester"
//                                                 type="number"
//                                                 value={currentAssignment.semester}
//                                                 onChange={handleAssignmentInputChange}
//                                                 className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.semester ? 'border-red-500' : 'border-gray-300'}`}
//                                             />
//                                             {formErrors.semester && <p className="mt-1 text-sm text-red-600">{formErrors.semester}</p>}
//                                         </div>
//                                     </>
//                                 )}
//                             </div>

//                             <div className="mt-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
//                                 <div className="space-y-2">
//                                     {currentAssignment.subjects.map((subject, index) => (
//                                         <div key={index} className="flex items-center space-x-2">
//                                             <input
//                                                 type="text"
//                                                 value={subject}
//                                                 onChange={(e) => handleSubjectChange(e.target.value, index)}
//                                                 className={`block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.subjects ? 'border-red-500' : 'border-gray-300'}`}
//                                                 placeholder={`Subject ${index + 1}`}
//                                             />
//                                             {currentAssignment.subjects.length > 1 && (
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleRemoveSubject(index)}
//                                                     className="text-red-600 hover:text-red-800 p-1 transition-colors"
//                                                 >
//                                                     <XMarkIcon className="h-5 w-5" />
//                                                 </button>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <button
//                                     type="button"
//                                     onClick={() => setCurrentAssignment(prev => ({ ...prev, subjects: [...prev.subjects, ""] }))}
//                                     className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
//                                 >
//                                     <PlusIcon className="h-4 w-4 mr-2" /> Add Subject
//                                 </button>
//                                 {formErrors.subjects && <p className="mt-1 text-sm text-red-600">{formErrors.subjects}</p>}
//                             </div>
//                             <div className="mt-6 flex justify-end">
//                                 {editingAssignmentIndex !== null ? (
//                                     <button
//                                         type="button"
//                                         onClick={handleUpdateAssignment}
//                                         className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
//                                     >
//                                         Update Assignment
//                                     </button>
//                                 ) : (
//                                     <button
//                                         type="button"
//                                         onClick={handleAddAssignmentToList}
//                                         className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
//                                     >
//                                         Add to List
//                                     </button>
//                                 )}
//                                 <button
//                                     type="button"
//                                     onClick={resetCurrentAssignmentForm}
//                                     className="ml-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition duration-200"
//                                 >
//                                     Clear
//                                 </button>
//                             </div>
//                         </div>
                        
//                         {(assignmentsForSelectedTeacher.length > 0 || newAssignments.length > 0) && (
//                             <div className="bg-white rounded-xl shadow-lg p-6">
//                                 <h4 className="text-xl font-semibold text-gray-900 mb-4">Assignments to be Saved ({assignmentsForSelectedTeacher.length + newAssignments.length})</h4>
//                                 <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
//                                     {assignmentsForSelectedTeacher.map((assignment, index) => (
//                                         <li key={`existing-${index}`} className="p-4 flex justify-between items-center bg-gray-50">
//                                             <div>
//                                                 <p className="text-sm font-medium text-gray-900">
//                                                     {assignment.type === "Class" ? `Class ${assignment.classNumber}` : `${assignment.degreeName} (Sem ${assignment.semester})`}
//                                                 </p>
//                                                 <p className="text-xs text-gray-500">Subjects: {assignment.subjects.join(", ")}</p>
//                                             </div>
//                                             <div className="flex items-center space-x-2">
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleEditTableAssignment(selectedStaff, index)}
//                                                     className="text-yellow-600 hover:text-yellow-800 p-1"
//                                                 >
//                                                     <PencilIcon className="h-5 w-5" />
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleDeleteTableAssignment(selectedStaff, index)}
//                                                     className="text-red-600 hover:text-red-800 p-1"
//                                                 >
//                                                     <TrashIcon className="h-5 w-5" />
//                                                 </button>
//                                             </div>
//                                         </li>
//                                     ))}
//                                     {newAssignments.map((assignment, index) => (
//                                         <li key={`new-${index}`} className="p-4 flex justify-between items-center bg-gray-50">
//                                             <div>
//                                                 <p className="text-sm font-medium text-gray-900">
//                                                     {assignment.type === "Class" ? `Class ${assignment.classNumber}` : `${assignment.degreeName} (Sem ${assignment.semester})`}
//                                                 </p>
//                                                 <p className="text-xs text-gray-500">Subjects: {assignment.subjects.join(", ")}</p>
//                                             </div>
//                                             <div className="flex items-center space-x-2">
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleEditAssignmentFromList(index)}
//                                                     className="text-yellow-600 hover:text-yellow-800 p-1"
//                                                 >
//                                                     <PencilIcon className="h-5 w-5" />
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleRemoveAssignmentFromList(index)}
//                                                     className="text-red-600 hover:text-red-800 p-1"
//                                                 >
//                                                     <TrashIcon className="h-5 w-5" />
//                                                 </button>
//                                             </div>
//                                         </li>
//                                     ))}
//                                 </ul>
//                                 <div className="mt-6 flex justify-end">
//                                     <button
//                                         type="submit"
//                                         className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 shadow-md flex items-center"
//                                     >
//                                         Save All Assignments
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </form>
//                 </div>
//             )}

//             <div className="bg-white rounded-lg shadow-md p-6">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4">Existing Assigned Classes</h2>
                
//                 {loading ? (
//                     <Loader />
//                 ) : filteredTeachersAndAssignments.length === 0 ? (
//                     <Message type="info" text="No assignments found matching the criteria." />
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-hidden">
//                             <thead className="bg-green-600 text-white rounded-md">
//                                 <tr>
//                                     <th className="p-2">Teacher</th>
//                                     <th className="p-2">Type</th>
//                                     <th className="p-2">Class/Degree</th>
//                                     <th className="p-2">Subjects</th>
//                                     <th className="p-2 text-right">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {filteredTeachersAndAssignments.map((assignment) => (
//                                     <tr key={`${assignment.teacherId}-${assignment.assignmentIndex}`} className="text-center bg-gray-50 hover:bg-gray-200 transition-colors duration-150">
//                                         <td className="border border-white p-2 text-sm font-medium text-gray-900">
//                                             {assignment.teacherName}
//                                         </td>
//                                         <td className="border border-white p-2 text-sm text-gray-500">
//                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.type === 'Class' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
//                                                 {assignment.type}
//                                             </span>
//                                         </td>
//                                         <td className="border border-white p-2 text-sm text-gray-500">
//                                             {assignment.type === "Class" ? `Class ${assignment.classNumber}` : `${assignment.degreeName} (Sem ${assignment.semester})`}
//                                         </td>
//                                         <td className="border border-white p-2 text-sm text-gray-500">
//                                             {assignment.subjects.join(", ")}
//                                         </td>
//                                         <td className="border border-white p-2 text-right text-sm font-medium">
//                                             <button
//                                                 onClick={() => handleEditTableAssignment(assignment.teacherId, assignment.assignmentIndex)}
//                                                 className="text-indigo-600 hover:text-indigo-900 mr-2 p-1 rounded-md hover:bg-gray-100"
//                                                 title="Edit Assignment"
//                                             >
//                                                 <PencilIcon className="h-5 w-5" />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleDeleteTableAssignment(assignment.teacherId, assignment.assignmentIndex)}
//                                                 className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
//                                                 title="Delete Assignment"
//                                             >
//                                                 <TrashIcon className="h-5 w-5" />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AssignClasses;










// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import api from '../api';
// import { MagnifyingGlassIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon, GraduationCapIcon } from '@heroicons/react/24/outline';
// import Loader from "../components/Loader";
// import Message from "../components/Message";
// import { toast } from 'react-toastify';

// const AssignClasses = () => {
//     const [academicStructure, setAcademicStructure] = useState(null);
//     const [structureLoading, setStructureLoading] = useState(true);

//     const [staffList, setStaffList] = useState([]);
//     const [allTeachers, setAllTeachers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState("");

//     const [showAssignmentForm, setShowAssignmentForm] = useState(false);
//     const [selectedStaff, setSelectedStaff] = useState("");
//     const [assignmentsForSelectedTeacher, setAssignmentsForSelectedTeacher] = useState([]);
//     const [newAssignments, setNewAssignments] = useState([]); // Used only for adding new assignments

//     const [searchTermTeachers, setSearchTermTeachers] = useState("");
//     const [filteredStaffList, setFilteredStaffList] = useState([]);

//     const [currentAssignment, setCurrentAssignment] = useState({
//         type: "", // Will be set to the first dynamic type slug on load
//         classNumber: "",
//         classIdentifier: "", // For Almiya types
//         degreeName: "",
//         semester: "",
//         subjects: [""]
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const [editingAssignmentIndex, setEditingAssignmentIndex] = useState(null);
//     const [filterType, setFilterType] = useState("All");

//     // Helper to get configuration for a slug
//     const getAcademicConfig = (slug) => academicStructure?.find(type => type.slug === slug);
//     const selectedAcademicType = getAcademicConfig(currentAssignment.type);

//     // --- Data Fetching ---

//     const fetchAcademicStructure = useCallback(async () => {
//         try {
//             const { data } = await api.get('/academic-structure');
//             setAcademicStructure(data.classTypes);
//             if (data.classTypes.length > 0) {
//                 // Set initial assignment type to the first available type that is not Hifaz
//                 const defaultType = data.classTypes.find(t => t.slug !== 'Hifaz')?.slug || data.classTypes[0].slug;
//                 setCurrentAssignment(prev => prev.type ? prev : { ...prev, type: defaultType });
//             }
//         } catch (err) {
//             setError('Failed to load academic structure.');
//         } finally {
//             setStructureLoading(false);
//         }
//     }, []);

//     const fetchTeachers = useCallback(async () => {
//         try {
//             const res = await api.get("/staff?staffType=Teacher");
//             const teachers = Array.isArray(res.data) ? res.data : res.data.data || [];
//             setStaffList(teachers);
//             setFilteredStaffList(teachers);
//         } catch (err) {
//             console.error(err);
//             setError("Failed to fetch teacher list.");
//         }
//     }, []);

//     const fetchAssignedTeachers = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const res = await api.get("/staff?staffType=Teacher");
//             const teachers = Array.isArray(res.data) ? res.data : res.data.data || [];
//             const teachersWithAssignments = teachers.filter(teacher => teacher.assignClasses && teacher.assignClasses.length > 0);
//             setAllTeachers(teachersWithAssignments);
//         } catch (err) {
//             console.error(err);
//             setError("Failed to fetch assigned classes.");
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchAcademicStructure();
//     }, [fetchAcademicStructure]);
    
//     useEffect(() => {
//         if (!structureLoading) {
//             fetchTeachers();
//             fetchAssignedTeachers();
//         }
//     }, [structureLoading, fetchTeachers, fetchAssignedTeachers]);

//     // --- Search Debounce ---
//     useEffect(() => {
//         const handler = setTimeout(() => {
//             // Note: The main table filtering uses this debounce
//         }, 500);
//         return () => {
//             clearTimeout(handler);
//         };
//     }, []);

//     useEffect(() => {
//         const lowercasedSearchTerm = searchTermTeachers.toLowerCase();
//         const filtered = staffList.filter(teacher =>
//             teacher.name.toLowerCase().includes(lowercasedSearchTerm)
//         );
//         setFilteredStaffList(filtered);
//     }, [searchTermTeachers, staffList]);

//     // --- Assignment Handlers ---

//     const handleAssignmentInputChange = (e) => {
//         const { name, value } = e.target;
//         setCurrentAssignment(prev => {
//             const newState = { ...prev, [name]: value };

//             if (name === 'type') {
//                 // Reset all conditional fields when type changes
//                 newState.classNumber = "";
//                 newState.classIdentifier = "";
//                 newState.degreeName = "";
//                 newState.semester = "";
//                 newState.subjects = [""];
//             } else if (name === 'classNumber') {
//                 // Set class identifier if a number is selected for Class/Almiya
//                 const config = getAcademicConfig(newState.type);
//                 const classObj = config?.classConfig?.find(c => String(c.classNumber) === String(value));
//                 newState.classIdentifier = classObj?.classIdentifier || "";
//                 newState.subjects = classObj?.subjects || [""];
//             }

//             return newState;
//         });
//         setFormErrors(prev => ({ ...prev, [name]: "" }));
//     };

//     const handleSubjectChange = (value, index) => {
//         const updatedSubjects = currentAssignment.subjects.map((s, i) => i === index ? value : s);
//         setCurrentAssignment(prev => ({ ...prev, subjects: updatedSubjects }));
//         setFormErrors(prev => ({ ...prev, subjects: "" }));
//     };

//     const handleRemoveSubject = (index) => {
//         const updatedSubjects = currentAssignment.subjects.filter((_, i) => i !== index);
//         setCurrentAssignment(prev => ({ ...prev, subjects: updatedSubjects }));
//     };

//     const validateAssignmentForm = (currentAssignmentsList, currentItemIndex = null) => {
//         let errors = {};
//         let isValid = true;
        
//         const assignment = {
//             ...currentAssignment,
//             subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
//         };

//         // --- Core Validation ---
//         if (!assignment.type) { errors.type = "Type is required."; isValid = false; }
//         if (assignment.subjects.length === 0) { errors.subjects = "At least one subject is required."; isValid = false; }

//         // --- Type-Specific Validation ---
//         if (['Class', 'Almiya'].includes(assignment.type)) {
//             if (!assignment.classNumber) {
//                 errors.classNumber = "Class/Grade is required.";
//                 isValid = false;
//             } else {
//                 const isDuplicate = currentAssignmentsList.some((a, i) =>
//                     i !== currentItemIndex && (a.type === assignment.type || (a.type === 'Class' && assignment.type === 'Almiya') || (a.type === 'Almiya' && assignment.type === 'Class')) 
//                     && String(a.classNumber) === String(assignment.classNumber)
//                 );
//                 if (isDuplicate) {
//                     errors.classNumber = `This ${assignment.type} class is already assigned to this teacher.`;
//                     isValid = false;
//                 }
//             }
//         } else if (assignment.type === "BS") {
//             if (!assignment.degreeName.trim()) {
//                 errors.degreeName = "Degree name is required.";
//                 isValid = false;
//             }
//             if (!assignment.semester || assignment.semester <= 0) {
//                 errors.semester = "Semester must be a positive number.";
//                 isValid = false;
//             } else {
//                 const isDuplicate = currentAssignmentsList.some((a, i) =>
//                     i !== currentItemIndex && a.type === "BS" && a.degreeName === assignment.degreeName && String(a.semester) === String(assignment.semester)
//                 );
//                 if (isDuplicate) {
//                     errors.degreeName = "This BS degree and semester is already assigned to this teacher.";
//                     isValid = false;
//                 }
//             }
//         }
//         // Hifaz requires only type validation (no number/degree/semester)

//         setFormErrors(errors);
//         return isValid;
//     };

//     const handleAddAssignmentToList = (e) => {
//         e.preventDefault();
//         setSuccessMessage("");
//         setError(null);

//         const currentAssignmentsList = [...assignmentsForSelectedTeacher, ...newAssignments];

//         if (!validateAssignmentForm(currentAssignmentsList)) {
//             return;
//         }
        
//         const assignment = {
//             ...currentAssignment,
//             subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
//         };

//         setNewAssignments(prev => [...prev, assignment]);
//         resetCurrentAssignmentForm();
//     };

//     const handleUpdateAssignment = (e) => {
//         e.preventDefault();
//         setSuccessMessage("");
//         setError(null);

//         const combinedList = [...assignmentsForSelectedTeacher, ...newAssignments];
//         if (!validateAssignmentForm(combinedList, editingAssignmentIndex)) {
//             return;
//         }

//         const assignment = {
//             ...currentAssignment,
//             subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
//         };
        
//         // Update the item in the list being edited (assuming it's an existing assignment for simplicity)
//         const updatedAssignments = assignmentsForSelectedTeacher.map((a, i) =>
//             i === editingAssignmentIndex ? assignment : a
//         );
//         setAssignmentsForSelectedTeacher(updatedAssignments);
//         setNewAssignments(newAssignments.filter((_, i) => i !== editingAssignmentIndex - assignmentsForSelectedTeacher.length));

//         resetCurrentAssignmentForm();
//     }

//     const resetCurrentAssignmentForm = () => {
//         const defaultType = academicStructure?.find(t => t.slug !== 'Hifaz')?.slug || '';
//         setCurrentAssignment({
//             type: defaultType,
//             classNumber: "",
//             classIdentifier: "",
//             degreeName: "",
//             semester: "",
//             subjects: [""]
//         });
//         setEditingAssignmentIndex(null);
//         setFormErrors({});
//     };

//     const handleRemoveAssignmentFromList = (index) => {
//         if (window.confirm("Are you sure you want to remove this assignment from the list?")) {
//             setNewAssignments(prev => prev.filter((_, i) => i !== index));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSuccessMessage("");
//         setError(null);

//         if (!selectedStaff) {
//             setError("Please select a teacher.");
//             return;
//         }
        
//         // Combine existing assignments with new/modified assignments
//         const combinedAssignments = [...assignmentsForSelectedTeacher, ...newAssignments];
//         if (combinedAssignments.length === 0) {
//             setError("Please add at least one assignment to the list.");
//             return;
//         }

//         try {
//             await api.put(`/staff/${selectedStaff}/assign-classes`, { assignClasses: combinedAssignments });
//             toast.success("Assignments updated successfully!");
//             resetMainForm();
//             fetchAssignedTeachers();
//         } catch (err) {
//             console.error(err);
//             setError(err.response?.data?.message || "Failed to save assignments.");
//         }
//     };

//     const resetMainForm = () => {
//         setSelectedStaff("");
//         setAssignmentsForSelectedTeacher([]);
//         setNewAssignments([]);
//         resetCurrentAssignmentForm();
//         setShowAssignmentForm(false);
//     };

//     const handleEditTableAssignment = (teacherId, assignmentIndex) => {
//         setSuccessMessage("");
//         setError(null);
//         const teacher = allTeachers.find(t => t._id === teacherId);
//         if (!teacher) return;
        
//         setSelectedStaff(teacherId);
//         const assignments = teacher.assignClasses || [];
//         setAssignmentsForSelectedTeacher(assignments);
//         setNewAssignments([]); // Clear new assignments list when editing an existing assignment
        
//         const assignmentToEdit = assignments[assignmentIndex];
//         setCurrentAssignment({
//             ...assignmentToEdit,
//             subjects: assignmentToEdit.subjects.length > 0 ? assignmentToEdit.subjects : [""]
//         });
//         setEditingAssignmentIndex(assignmentIndex); // Index of the item in assignmentsForSelectedTeacher
        
//         setShowAssignmentForm(true);
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };
    
//     const handleDeleteTableAssignment = async (teacherId, assignmentIndex) => {
//         if (!window.confirm("Are you sure you want to delete this specific assignment?")) return;
    
//         try {
//             const teacher = allTeachers.find(t => t._id === teacherId);
//             if (!teacher) throw new Error("Teacher not found.");
            
//             const updatedAssignments = teacher.assignClasses.filter((_, i) => i !== assignmentIndex);
            
//             await api.put(`/staff/${teacherId}/assign-classes`, { assignClasses: updatedAssignments });
//             toast.success("Assignment deleted successfully!");
//             fetchAssignedTeachers();
//         } catch (err) {
//             console.error(err);
//             setError(err.response?.data?.message || "Failed to delete assignment.");
//         }
//     };

//     // --- Memoized Data ---
//     const filteredTeachersAndAssignments = useMemo(() => {
//         const allAssignments = allTeachers.flatMap(teacher =>
//             (teacher.assignClasses || []).map((assignment, index) => ({
//                 ...assignment,
//                 teacherName: teacher.name,
//                 teacherId: teacher._id,
//                 assignmentIndex: index
//             }))
//         );

//         return allAssignments.filter(item => {
//             const typeMatch = filterType === "All" || item.type === filterType;
//             const nameMatch = item.teacherName.toLowerCase().includes(searchTermTeachers.toLowerCase());
//             return typeMatch && nameMatch;
//         });
//     }, [allTeachers, searchTermTeachers, filterType]);

//     // Helper to render assignment details
//     const renderAssignmentDetails = (assignment) => {
//         switch (assignment.type) {
//             case 'Class':
//                 return `Class ${assignment.classNumber}`;
//             case 'Almiya':
//                 // Attempt to find the identifier from the structure
//                 const almiyaConfig = getAcademicConfig('Almiya');
//                 const classObj = almiyaConfig?.classConfig?.find(c => String(c.classNumber) === String(assignment.classNumber));
//                 return classObj ? `${classObj.classIdentifier} (Grade ${assignment.classNumber})` : `Almiya Grade ${assignment.classNumber}`;
//             case 'BS':
//                 return `${assignment.degreeName} (Sem ${assignment.semester})`;
//             case 'Hifaz':
//                 return `Hifaz-ul-Quran (Full Course)`;
//             default:
//                 return 'N/A';
//         }
//     };
    
//     // --- Render Logic ---

//     if (structureLoading || loading) return <Loader />;
//     if (error) return <Message type="error" text={error} />;
    
//     const semesterOptions = selectedAcademicType?.degreeConfig?.find(d => d.degreeName === currentAssignment.degreeName)?.maxSemester || 0;
//     const isClassOrAlmiya = ['Class', 'Almiya'].includes(currentAssignment.type);

//     return (
//         <div className="container mx-auto p-4 sm:p-6 lg:p-8">
//             <h1 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-8">Assign Classes to Teachers</h1>
//             {successMessage && <Message type="success" text={successMessage} />}
//             {error && <Message type="error" text={error} />}

//             <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
//                     <div className="relative w-full sm:w-1/2 lg:w-2/3">
//                         <input
//                             type="text"
//                             placeholder="Search existing assignments by teacher name..."
//                             value={searchTermTeachers}
//                             onChange={(e) => setSearchTermTeachers(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//                         />
//                         <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     </div>
//                     <div className="w-full sm:w-auto">
//                         <select
//                             value={filterType}
//                             onChange={(e) => setFilterType(e.target.value)}
//                             className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//                         >
//                             <option value="All">All Types</option>
//                             {academicStructure?.map(type => (
//                                 <option key={type.slug} value={type.slug}>{type.name}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//                         <button
//                             onClick={() => setShowAssignmentForm(!showAssignmentForm)}
//                             className="flex items-center justify-center bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-full sm:w-auto"
//                         >
//                             <PlusIcon className="h-5 w-5 mr-2" />
//                             {showAssignmentForm ? 'Hide Form' : 'Assign Classes'}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showAssignmentForm && (
//                 <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-indigo-200">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Assignment Form</h3>
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
//                             <h4 className="text-lg font-semibold text-gray-800 mb-4">Teacher Selection</h4>
//                             <div>
//                                 <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">Select Teacher</label>
//                                 <div className="relative">
//                                     <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                                     <input
//                                         type="text"
//                                         placeholder="Search teachers..."
//                                         value={searchTermTeachers}
//                                         onChange={(e) => setSearchTermTeachers(e.target.value)}
//                                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//                                     />
//                                 </div>
//                                 <select
//                                     id="teacher"
//                                     value={selectedStaff}
//                                     onChange={(e) => { 
//                                         setSelectedStaff(e.target.value); 
//                                         setAssignmentsForSelectedTeacher(allTeachers.find(t => t._id === e.target.value)?.assignClasses || []);
//                                         setNewAssignments([]);
//                                         resetCurrentAssignmentForm();
//                                     }}
//                                     className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//                                     required
//                                 >
//                                     <option value="" disabled>Select a teacher</option>
//                                     {filteredStaffList.map((staff) => (
//                                         <option key={staff._id} value={staff._id}>
//                                             {staff.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
//                             <h4 className="text-lg font-semibold text-gray-800 mb-4">{editingAssignmentIndex !== null ? "Edit Assignment" : "Add New Assignment"}</h4>
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
//                                 <div>
//                                     <label htmlFor="assignType" className="block text-sm font-medium text-gray-700">Assignment Type</label>
//                                     <select
//                                         id="assignType"
//                                         name="type"
//                                         value={currentAssignment.type}
//                                         onChange={handleAssignmentInputChange}
//                                         className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//                                         required
//                                         disabled={editingAssignmentIndex !== null}
//                                     >
//                                         {academicStructure?.filter(t => t.slug !== 'Hifaz').map(type => (
//                                             <option key={type.slug} value={type.slug}>{type.name}</option>
//                                         ))}
//                                     </select>
//                                 </div>
                                
//                                 {isClassOrAlmiya && selectedAcademicType && (
//                                     <div>
//                                         <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700">{selectedAcademicType.name} Class/Grade</label>
//                                         <select
//                                             id="classNumber"
//                                             name="classNumber"
//                                             value={currentAssignment.classNumber}
//                                             onChange={handleAssignmentInputChange}
//                                             className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.classNumber ? 'border-red-500' : 'border-gray-300'}`}
//                                             required
//                                         >
//                                             <option value="">Select Grade</option>
//                                             {selectedAcademicType.classConfig?.sort((a, b) => a.classNumber - b.classNumber).map(cls => (
//                                                 <option key={cls.classNumber} value={cls.classNumber}>
//                                                     {cls.classIdentifier} ({cls.classNumber})
//                                                 </option>
//                                             ))}
//                                         </select>
//                                         {formErrors.classNumber && <p className="mt-1 text-sm text-red-600">{formErrors.classNumber}</p>}
//                                     </div>
//                                 )}
                                
//                                 {currentAssignment.type === "BS" && selectedAcademicType && (
//                                     <>
//                                         <div>
//                                             <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
//                                             <select
//                                                 id="degreeName"
//                                                 name="degreeName"
//                                                 value={currentAssignment.degreeName}
//                                                 onChange={handleAssignmentInputChange}
//                                                 className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.degreeName ? 'border-red-500' : 'border-gray-300'}`}
//                                                 required
//                                             >
//                                                 <option value="">Select Degree</option>
//                                                 {selectedAcademicType.degreeConfig?.map(degree => (
//                                                     <option key={degree.degreeName} value={degree.degreeName}>{degree.degreeName}</option>
//                                                 ))}
//                                             </select>
//                                             {formErrors.degreeName && <p className="mt-1 text-sm text-red-600">{formErrors.degreeName}</p>}
//                                         </div>
//                                         {currentAssignment.degreeName && (
//                                             <div>
//                                                 <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
//                                                 <select
//                                                     id="semester"
//                                                     name="semester"
//                                                     type="number"
//                                                     value={currentAssignment.semester}
//                                                     onChange={handleAssignmentInputChange}
//                                                     className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.semester ? 'border-red-500' : 'border-gray-300'}`}
//                                                     required
//                                                 >
//                                                     <option value="">Select Semester</option>
//                                                     {Array.from({ length: selectedAcademicType.degreeConfig?.find(d => d.degreeName === currentAssignment.degreeName)?.maxSemester || 0 }, (_, i) => i + 1).map(sem => (
//                                                         <option key={sem} value={sem}>{sem}</option>
//                                                     ))}
//                                                 </select>
//                                                 {formErrors.semester && <p className="mt-1 text-sm text-red-600">{formErrors.semester}</p>}
//                                             </div>
//                                         )}
//                                     </>
//                                 )}
                                
//                                 {currentAssignment.type === "Hifaz" && (
//                                     <div className="md:col-span-2">
//                                         <label className="block text-sm font-medium text-gray-700">Hifaz Course</label>
//                                         <p className="mt-1 block w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg bg-gray-100">
//                                             Assigned to teach the complete Hifaz course (30 Juz).
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="mt-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
//                                 <p className="text-xs text-gray-500 mb-2">
//                                     *List subjects the teacher will teach for this specific class/semester. Subjects for this grade/semester are defined in the Academic Structure.
//                                 </p>
//                                 <div className="space-y-2">
//                                     {currentAssignment.subjects.map((subject, index) => (
//                                         <div key={index} className="flex items-center space-x-2">
//                                             <input
//                                                 type="text"
//                                                 value={subject}
//                                                 onChange={(e) => handleSubjectChange(e.target.value, index)}
//                                                 className={`block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.subjects ? 'border-red-500' : 'border-gray-300'}`}
//                                                 placeholder={`Subject ${index + 1}`}
//                                                 list={`subjects-list-${currentAssignment.type}-${currentAssignment.classNumber || currentAssignment.degreeName}`}
//                                             />
//                                             {/* Data List for Subject Suggestions */}
//                                             <datalist id={`subjects-list-${currentAssignment.type}-${currentAssignment.classNumber || currentAssignment.degreeName}`}>
//                                                 {/* Suggestions for Class/Almiya */}
//                                                 {isClassOrAlmiya && selectedAcademicType?.classConfig?.find(c => String(c.classNumber) === String(currentAssignment.classNumber))?.subjects.map(sub => (
//                                                     <option key={sub} value={sub} />
//                                                 ))}
//                                                 {/* Suggestions for BS */}
//                                                 {currentAssignment.type === 'BS' && selectedAcademicType?.degreeConfig?.find(d => d.degreeName === currentAssignment.degreeName)?.subjectsBySemester.get(String(currentAssignment.semester))?.map(sub => (
//                                                     <option key={sub} value={sub} />
//                                                 ))}
//                                                 {/* Hifaz is typically 'Quran' */}
//                                                 {currentAssignment.type === 'Hifaz' && <option value="Hifaz/Quran Memorization" />}
//                                             </datalist>
                                            
//                                             {currentAssignment.subjects.length > 1 && (
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleRemoveSubject(index)}
//                                                     className="text-red-600 hover:text-red-800 p-1 transition-colors"
//                                                 >
//                                                     <XMarkIcon className="h-5 w-5" />
//                                                 </button>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <button
//                                     type="button"
//                                     onClick={() => setCurrentAssignment(prev => ({ ...prev, subjects: [...prev.subjects, ""] }))}
//                                     className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
//                                 >
//                                     <PlusIcon className="h-4 w-4 mr-2" /> Add Subject
//                                 </button>
//                                 {formErrors.subjects && <p className="mt-1 text-sm text-red-600">{formErrors.subjects}</p>}
//                             </div>
                            
//                             <div className="mt-6 flex justify-end">
//                                 {editingAssignmentIndex !== null ? (
//                                     <button
//                                         type="button"
//                                         onClick={handleUpdateAssignment}
//                                         className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md"
//                                     >
//                                         Update Assignment
//                                     </button>
//                                 ) : (
//                                     <button
//                                         type="button"
//                                         onClick={handleAddAssignmentToList}
//                                         className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
//                                     >
//                                         Add to List
//                                     </button>
//                                 )}
//                                 <button
//                                     type="button"
//                                     onClick={resetCurrentAssignmentForm}
//                                     className="ml-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition duration-200"
//                                 >
//                                     Clear
//                                 </button>
//                             </div>
//                         </div>
                        
//                         {(assignmentsForSelectedTeacher.length > 0 || newAssignments.length > 0) && (
//                             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-300">
//                                 <h4 className="text-xl font-semibold text-gray-900 mb-4">Assignments to be Saved ({assignmentsForSelectedTeacher.length + newAssignments.length})</h4>
//                                 <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
//                                     {[...assignmentsForSelectedTeacher, ...newAssignments].map((assignment, index) => (
//                                         <li key={`${assignment.type}-${assignment.classNumber || assignment.degreeName}-${index}`} className="p-4 flex justify-between items-center bg-gray-50">
//                                             <div>
//                                                 <p className="text-sm font-medium text-gray-900">
//                                                     {renderAssignmentDetails(assignment)}
//                                                 </p>
//                                                 <p className="text-xs text-gray-500">Subjects: {assignment.subjects.join(", ")}</p>
//                                             </div>
//                                             <div className="flex items-center space-x-2">
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleEditTableAssignment(selectedStaff, index)} // Re-use table edit logic
//                                                     className="text-yellow-600 hover:text-yellow-800 p-1"
//                                                 >
//                                                     <PencilIcon className="h-5 w-5" />
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleDeleteTableAssignment(selectedStaff, index)}
//                                                     className="text-red-600 hover:text-red-800 p-1"
//                                                 >
//                                                     <TrashIcon className="h-5 w-5" />
//                                                 </button>
//                                             </div>
//                                         </li>
//                                     ))}
//                                 </ul>
//                                 <div className="mt-6 flex justify-end">
//                                     <button
//                                         type="submit"
//                                         className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 shadow-md flex items-center"
//                                     >
//                                         <GraduationCapIcon className="h-5 w-5 mr-2" /> Save All Assignments
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </form>
//                 </div>
//             )}

//             <div className="bg-white rounded-lg shadow-md p-6 mt-8">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4">Existing Assigned Classes</h2>
                
//                 {loading ? (
//                     <Loader />
//                 ) : filteredTeachersAndAssignments.length === 0 ? (
//                     <Message type="info" text="No assignments found matching the criteria." />
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-hidden">
//                             <thead className="bg-green-600 text-white rounded-md">
//                                 <tr>
//                                     <th className="p-2">Teacher</th>
//                                     <th className="p-2">Type</th>
//                                     <th className="p-2">Class/Degree</th>
//                                     <th className="p-2">Subjects</th>
//                                     <th className="p-2 text-right">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {filteredTeachersAndAssignments.map((assignment) => (
//                                     <tr key={`${assignment.teacherId}-${assignment.assignmentIndex}`} className="text-center bg-gray-50 hover:bg-gray-200 transition-colors duration-150">
//                                         <td className="border border-white p-2 text-sm font-medium text-gray-900">
//                                             {assignment.teacherName}
//                                         </td>
//                                         <td className="border border-white p-2 text-sm text-gray-500">
//                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.type === 'Class' ? 'bg-blue-100 text-blue-800' : assignment.type === 'BS' ? 'bg-purple-100 text-purple-800' : assignment.type === 'Almiya' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
//                                                 {assignment.type}
//                                             </span>
//                                         </td>
//                                         <td className="border border-white p-2 text-sm text-gray-500">
//                                             {renderAssignmentDetails(assignment)}
//                                         </td>
//                                         <td className="border border-white p-2 text-sm text-gray-500">
//                                             {assignment.subjects.join(", ")}
//                                         </td>
//                                         <td className="border border-white p-2 text-right text-sm font-medium">
//                                             <button
//                                                 onClick={() => handleEditTableAssignment(assignment.teacherId, assignment.assignmentIndex)}
//                                                 className="text-indigo-600 hover:text-indigo-900 mr-2 p-1 rounded-md hover:bg-gray-100"
//                                                 title="Edit Assignment"
//                                             >
//                                                 <PencilIcon className="h-5 w-5" />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleDeleteTableAssignment(assignment.teacherId, assignment.assignmentIndex)}
//                                                 className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
//                                                 title="Delete Assignment"
//                                             >
//                                                 <TrashIcon className="h-5 w-5" />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AssignClasses;



import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from '../api';
import { MagnifyingGlassIcon, PlusIcon, TrashIcon, PencilIcon, XMarkIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Loader from "../components/Loader";
import Message from "../components/Message";
import { toast } from 'react-toastify';

const AssignClasses = () => {
    const [academicStructure, setAcademicStructure] = useState(null);
    const [structureLoading, setStructureLoading] = useState(true);

    const [staffList, setStaffList] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [assignmentsForSelectedTeacher, setAssignmentsForSelectedTeacher] = useState([]);
    const [newAssignments, setNewAssignments] = useState([]); // Array to track assignments added/modified during the session

    const [searchTermTeachers, setSearchTermTeachers] = useState("");
    const [filteredStaffList, setFilteredStaffList] = useState([]);

    const [currentAssignment, setCurrentAssignment] = useState({
        type: "", 
        classNumber: "",
        classIdentifier: "", 
        degreeName: "",
        semester: "",
        subjects: [""] // Always initialize with one empty subject input
    });
    const [formErrors, setFormErrors] = useState({});
    const [editingAssignmentIndex, setEditingAssignmentIndex] = useState(null);
    const [filterType, setFilterType] = useState("All");

    // Helper to get configuration for a slug
    const getAcademicConfig = (slug) => academicStructure?.find(type => type.slug === slug);
    const selectedAcademicType = getAcademicConfig(currentAssignment.type);
    const isClassOrAlmiya = ['Class', 'Almiya'].includes(currentAssignment.type);

    // --- Dynamic Subject Suggestions ---
    const getAvailableSubjects = useMemo(() => {
        let suggestedSubjects = [];
        const currentSubjects = currentAssignment.subjects.filter(s => s.trim()).map(s => s.toLowerCase());

        if (isClassOrAlmiya && currentAssignment.classNumber) {
            const classConfig = selectedAcademicType?.classConfig?.find(c => String(c.classNumber) === String(currentAssignment.classNumber));
            suggestedSubjects = classConfig?.subjects || [];
        } else if (currentAssignment.type === 'BS' && currentAssignment.degreeName && currentAssignment.semester) {
            const degreeConfig = selectedAcademicType?.degreeConfig?.find(d => d.degreeName === currentAssignment.degreeName);
            suggestedSubjects = degreeConfig?.subjectsBySemester.get(String(currentAssignment.semester)) || [];
        } else if (currentAssignment.type === 'Hifaz') {
             suggestedSubjects = ['Hifaz/Quran Memorization'];
        }

        // Filter out subjects already added to the current assignment list
        return suggestedSubjects.filter(sub => !currentSubjects.includes(sub.toLowerCase()));
    }, [currentAssignment, selectedAcademicType]);

    // --- Data Fetching ---

    const fetchAcademicStructure = useCallback(async () => {
        try {
            const { data } = await api.get('/academic-structure');
            setAcademicStructure(data.classTypes);
            if (data.classTypes.length > 0) {
                const defaultType = data.classTypes.find(t => t.slug)?.slug || data.classTypes[0].slug;
                setCurrentAssignment(prev => prev.type ? prev : { ...prev, type: defaultType });
            }
        } catch (err) {
            setError('Failed to load academic structure.');
        } finally {
            setStructureLoading(false);
        }
    }, []);

    const fetchTeachers = useCallback(async () => {
        try {
            const res = await api.get("/staff?staffType=Teacher");
            const teachers = Array.isArray(res.data) ? res.data : res.data.data || [];
            setStaffList(teachers);
            setFilteredStaffList(teachers);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch teacher list.");
        }
    }, []);

    const fetchAssignedTeachers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/staff?staffType=Teacher");
            const teachers = Array.isArray(res.data) ? res.data : res.data.data || [];
            const teachersWithAssignments = teachers.filter(teacher => teacher.assignClasses && teacher.assignClasses.length > 0);
            setAllTeachers(teachersWithAssignments);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch assigned classes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAcademicStructure();
    }, [fetchAcademicStructure]);
    
    useEffect(() => {
        if (!structureLoading) {
            fetchTeachers();
            fetchAssignedTeachers();
        }
    }, [structureLoading, fetchTeachers, fetchAssignedTeachers]);

    useEffect(() => {
        const lowercasedSearchTerm = searchTermTeachers.toLowerCase();
        const filtered = staffList.filter(teacher =>
            teacher.name.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredStaffList(filtered);
    }, [searchTermTeachers, staffList]);

    // --- Assignment Handlers ---

    const handleAssignmentInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentAssignment(prev => {
            const newState = { ...prev, [name]: value };

            if (name === 'type') {
                newState.classNumber = "";
                newState.classIdentifier = "";
                newState.degreeName = "";
                newState.semester = "";
                newState.subjects = [""];
            } else if (name === 'classNumber') {
                const config = getAcademicConfig(newState.type);
                const classObj = config?.classConfig?.find(c => String(c.classNumber) === String(value));
                newState.classIdentifier = classObj?.classIdentifier || "";
                newState.subjects = classObj?.subjects.length > 0 ? classObj.subjects : [""];
            } else if (name === 'degreeName') {
                newState.semester = "";
            }

            return newState;
        });
        setFormErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubjectChange = (value, index) => {
        const updatedSubjects = currentAssignment.subjects.map((s, i) => i === index ? value : s);
        setCurrentAssignment(prev => ({ ...prev, subjects: updatedSubjects }));
        setFormErrors(prev => ({ ...prev, subjects: "" }));
    };

    const handleRemoveSubject = (index) => {
        const updatedSubjects = currentAssignment.subjects.filter((_, i) => i !== index);
        setCurrentAssignment(prev => ({ ...prev, subjects: updatedSubjects }));
    };

    const validateAssignmentForm = (currentAssignmentsList, currentItemIndex = null) => {
        let errors = {};
        let isValid = true;
        
        const assignment = {
            ...currentAssignment,
            subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
        };

        // --- Core Validation ---
        if (!assignment.type) { errors.type = "Type is required."; isValid = false; }
        if (assignment.subjects.length === 0) { errors.subjects = "At least one subject is required."; isValid = false; }

        // --- Type-Specific Validation ---
        const isClassOrAlmiya = ['Class', 'Almiya'].includes(assignment.type);
        
        if (isClassOrAlmiya) {
            if (!assignment.classNumber) {
                errors.classNumber = "Class/Grade is required.";
                isValid = false;
            } else {
                // Check for duplicate classNumber regardless of 'Class' or 'Almiya' slug
                const isDuplicate = currentAssignmentsList.some((a, i) =>
                    i !== currentItemIndex && ['Class', 'Almiya'].includes(a.type) && String(a.classNumber) === String(assignment.classNumber)
                );
                if (isDuplicate) {
                    errors.classNumber = `This class/grade is already assigned to this teacher.`;
                    isValid = false;
                }
            }
        } else if (assignment.type === "BS") {
            if (!assignment.degreeName.trim()) {
                errors.degreeName = "Degree name is required.";
                isValid = false;
            }
            if (!assignment.semester || assignment.semester <= 0) {
                errors.semester = "Semester must be a positive number.";
                isValid = false;
            } else {
                const isDuplicate = currentAssignmentsList.some((a, i) =>
                    i !== currentItemIndex && a.type === "BS" && a.degreeName === assignment.degreeName && String(a.semester) === String(assignment.semester)
                );
                if (isDuplicate) {
                    errors.degreeName = "This BS degree and semester is already assigned to this teacher.";
                    isValid = false;
                }
            }
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleAddAssignmentToList = (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setError(null);

        const currentAssignmentsList = [...assignmentsForSelectedTeacher, ...newAssignments];

        if (!validateAssignmentForm(currentAssignmentsList)) {
            return;
        }
        
        const assignment = {
            ...currentAssignment,
            subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
        };

        setNewAssignments(prev => [...prev, assignment]);
        resetCurrentAssignmentForm();
    };

    const handleUpdateAssignment = (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setError(null);

        const combinedList = [...assignmentsForSelectedTeacher, ...newAssignments];
        if (!validateAssignmentForm(combinedList, editingAssignmentIndex)) {
            return;
        }

        const assignment = {
            ...currentAssignment,
            subjects: currentAssignment.subjects.filter(s => s.trim() !== "")
        };
        
        if (editingAssignmentIndex < assignmentsForSelectedTeacher.length) {
            // Editing an existing assignment
            setAssignmentsForSelectedTeacher(prev => prev.map((a, i) => i === editingAssignmentIndex ? assignment : a));
        } else {
            // Editing a newly added assignment (FIXED logic needed here if newAssignments were modified)
            const newIndex = editingAssignmentIndex - assignmentsForSelectedTeacher.length;
            setNewAssignments(prev => prev.map((a, i) => i === newIndex ? assignment : a));
        }

        resetCurrentAssignmentForm();
    }

    const resetCurrentAssignmentForm = () => {
        const defaultType = academicStructure?.find(t => t.slug)?.slug || 'Class';
        setCurrentAssignment({
            type: defaultType,
            classNumber: "",
            classIdentifier: "",
            degreeName: "",
            semester: "",
            subjects: [""]
        });
        setEditingAssignmentIndex(null);
        setFormErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setError(null);

        if (!selectedStaff) {
            setError("Please select a teacher.");
            return;
        }
        
        const finalAssignments = [...assignmentsForSelectedTeacher, ...newAssignments];
        
        if (finalAssignments.length === 0) {
            setError("Please add at least one assignment to the list.");
            return;
        }

        // The issue where it re-validates and fails on submit is often solved by performing the
        // validation *just before* sending the API request, and ensuring the final payload is clean.
        // We've moved the validation checks inside handleAdd/Update. The final check here is clean.

        try {
            // CRITICAL FIX: The final list is clean. We submit this list.
            await api.put(`/staff/${selectedStaff}/assign-classes`, { assignClasses: finalAssignments });
            toast.success("Assignments updated successfully!");
            resetMainForm();
            fetchAssignedTeachers();
        } catch (err) {
            console.error(err);
            // This error is likely the backend error due to unrecognised Almiya/Hifaz type.
            setError(err.response?.data?.message || "Failed to save assignments.");
        }
    };

    const resetMainForm = () => {
        setSelectedStaff("");
        setAssignmentsForSelectedTeacher([]);
        setNewAssignments([]);
        resetCurrentAssignmentForm();
        setShowAssignmentForm(false);
    };

    const handleEditTableAssignment = (teacherId, assignmentIndex) => {
        setSuccessMessage("");
        setError(null);
        const teacher = allTeachers.find(t => t._id === teacherId);
        if (!teacher) return;
        
        setSelectedStaff(teacherId);
        const assignments = teacher.assignClasses || [];
        setAssignmentsForSelectedTeacher(assignments);
        setNewAssignments([]); // Clear new assignments list when editing an existing assignment
        
        const assignmentToEdit = assignments[assignmentIndex];
        setCurrentAssignment({
            ...assignmentToEdit,
            subjects: assignmentToEdit.subjects.length > 0 ? assignmentToEdit.subjects : [""]
        });
        setEditingAssignmentIndex(assignmentIndex); // Index of the item in assignmentsForSelectedTeacher
        
        setShowAssignmentForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleDeleteTableAssignment = async (teacherId, assignmentIndex) => {
        if (!window.confirm("Are you sure you want to delete this specific assignment?")) return;
    
        try {
            const teacher = allTeachers.find(t => t._id === teacherId);
            if (!teacher) throw new Error("Teacher not found.");
            
            const updatedAssignments = teacher.assignClasses.filter((_, i) => i !== assignmentIndex);
            
            await api.put(`/staff/${teacherId}/assign-classes`, { assignClasses: updatedAssignments });
            toast.success("Assignment deleted successfully!");
            fetchAssignedTeachers();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to delete assignment.");
        }
    };

    // --- Memoized Data ---
    const filteredTeachersAndAssignments = useMemo(() => {
        const allAssignments = allTeachers.flatMap(teacher =>
            (teacher.assignClasses || []).map((assignment, index) => ({
                ...assignment,
                teacherName: teacher.name,
                teacherId: teacher._id,
                assignmentIndex: index
            }))
        );

        return allAssignments.filter(item => {
            const typeMatch = filterType === "All" || item.type === filterType;
            const nameMatch = item.teacherName.toLowerCase().includes(searchTermTeachers.toLowerCase());
            return typeMatch && nameMatch;
        });
    }, [allTeachers, searchTermTeachers, filterType]);

    // Helper to render assignment details
    const renderAssignmentDetails = (assignment) => {
        switch (assignment.type) {
            case 'Class':
                return `Class ${assignment.classNumber}`;
            case 'Almiya':
                // Attempt to find the identifier from the structure
                const almiyaConfig = getAcademicConfig('Almiya');
                const classObj = almiyaConfig?.classConfig?.find(c => String(c.classNumber) === String(assignment.classNumber));
                return classObj ? `${classObj.classIdentifier} (Grade ${assignment.classNumber})` : `Almiya Grade ${assignment.classNumber}`;
            case 'BS':
                return `${assignment.degreeName} (Sem ${assignment.semester})`;
            case 'Hifaz':
                return `Hifaz-ul-Quran (Full Course)`;
            default:
                return 'N/A';
        }
    };
    
    // --- Render Logic ---

    if (structureLoading || loading) return <Loader />;
    if (error) return <Message type="error" text={error} />;
    
    const semesterOptions = selectedAcademicType?.degreeConfig?.find(d => d.degreeName === currentAssignment.degreeName)?.maxSemester || 0;
    

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-indigo-700 mb-8 border-b pb-4">Assign Classes to Teachers</h1>
            {successMessage && <Message type="success" text={successMessage} />}
            {error && <Message type="error" text={error} />}

            <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                    <div className="relative w-full sm:w-1/2 lg:w-2/3">
                        <input
                            type="text"
                            placeholder="Search existing assignments by teacher name..."
                            value={searchTermTeachers}
                            onChange={(e) => setSearchTermTeachers(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="w-full sm:w-auto">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All Types</option>
                            {academicStructure?.map(type => (
                                <option key={type.slug} value={type.slug}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                            className="flex items-center justify-center bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md w-full sm:w-auto"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            {showAssignmentForm ? 'Hide Form' : 'Assign Classes'}
                        </button>
                    </div>
                </div>
            </div>

            {showAssignmentForm && (
                <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border border-indigo-500">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Assignment Form</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200 shadow-inner">
                            <h4 className="text-lg font-semibold text-indigo-800 mb-4 border-b border-indigo-300 pb-2">Teacher Selection</h4>
                            <div>
                                <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">Select Teacher</label>
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search teachers..."
                                        value={searchTermTeachers}
                                        onChange={(e) => setSearchTermTeachers(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    />
                                </div>
                                <select
                                    id="teacher"
                                    value={selectedStaff}
                                    onChange={(e) => { 
                                        setSelectedStaff(e.target.value); 
                                        setAssignmentsForSelectedTeacher(allTeachers.find(t => t._id === e.target.value)?.assignClasses || []);
                                        setNewAssignments([]);
                                        resetCurrentAssignmentForm();
                                    }}
                                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                    required
                                >
                                    <option value="" disabled>Select a teacher</option>
                                    {filteredStaffList.map((staff) => (
                                        <option key={staff._id} value={staff._id}>
                                            {staff.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-md">
                            <h4 className="text-xl font-semibold text-gray-800 mb-4">{editingAssignmentIndex !== null ? "Edit Assignment" : "Add New Assignment"}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div>
                                    <label htmlFor="assignType" className="block text-sm font-medium text-gray-700">Academic Track</label>
                                    <select
                                        id="assignType"
                                        name="type"
                                        value={currentAssignment.type}
                                        onChange={handleAssignmentInputChange}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                        required
                                        disabled={editingAssignmentIndex !== null}
                                    >
                                        <option value="" disabled>Select Track</option>
                                        {academicStructure?.map(type => (
                                            <option key={type.slug} value={type.slug}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {isClassOrAlmiya && selectedAcademicType && (
                                    <div>
                                        <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700">{selectedAcademicType.name} Class/Grade</label>
                                        <select
                                            id="classNumber"
                                            name="classNumber"
                                            value={currentAssignment.classNumber}
                                            onChange={handleAssignmentInputChange}
                                            className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.classNumber ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        >
                                            <option value="">Select Grade</option>
                                            {selectedAcademicType.classConfig?.sort((a, b) => a.classNumber - b.classNumber).map(cls => (
                                                <option key={cls.classNumber} value={cls.classNumber}>
                                                    {cls.classIdentifier} ({cls.classNumber})
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.classNumber && <p className="mt-1 text-sm text-red-600">{formErrors.classNumber}</p>}
                                    </div>
                                )}
                                
                                {currentAssignment.type === "BS" && selectedAcademicType && (
                                    <>
                                        <div>
                                            <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
                                            <select
                                                id="degreeName"
                                                name="degreeName"
                                                value={currentAssignment.degreeName}
                                                onChange={handleAssignmentInputChange}
                                                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.degreeName ? 'border-red-500' : 'border-gray-300'}`}
                                                required
                                            >
                                                <option value="">Select Degree</option>
                                                {selectedAcademicType.degreeConfig?.map(degree => (
                                                    <option key={degree.degreeName} value={degree.degreeName}>{degree.degreeName}</option>
                                                ))}
                                            </select>
                                            {formErrors.degreeName && <p className="mt-1 text-sm text-red-600">{formErrors.degreeName}</p>}
                                        </div>
                                        {currentAssignment.degreeName && (
                                            <div>
                                                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                                                <select
                                                    id="semester"
                                                    name="semester"
                                                    type="number"
                                                    value={currentAssignment.semester}
                                                    onChange={handleAssignmentInputChange}
                                                    className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.semester ? 'border-red-500' : 'border-gray-300'}`}
                                                    required
                                                >
                                                    <option value="">Select Semester</option>
                                                    {Array.from({ length: selectedAcademicType.degreeConfig?.find(d => d.degreeName === currentAssignment.degreeName)?.maxSemester || 0 }, (_, i) => i + 1).map(sem => (
                                                        <option key={sem} value={sem}>{sem}</option>
                                                    ))}
                                                </select>
                                                {formErrors.semester && <p className="mt-1 text-sm text-red-600">{formErrors.semester}</p>}
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {currentAssignment.type === "Hifaz" && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Hifaz Course</label>
                                        <p className="mt-1 block w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg bg-gray-100">
                                            Assigned to teach the complete Hifaz course (30 Juz).
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                                <p className="text-xs text-gray-500 mb-2">
                                    *List subjects the teacher will teach for this specific class/semester. Suggestions pulled from Academic Structure.
                                </p>
                                <div className="space-y-2">
                                    {currentAssignment.subjects.map((subject, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => handleSubjectChange(e.target.value, index)}
                                                className={`block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${formErrors.subjects ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder={`Subject ${index + 1}`}
                                                list={`subjects-list-${currentAssignment.type}-${currentAssignment.classNumber || currentAssignment.degreeName}-${currentAssignment.semester}`}
                                            />
                                            {/* Data List for Subject Suggestions (FIXED) */}
                                            <datalist id={`subjects-list-${currentAssignment.type}-${currentAssignment.classNumber || currentAssignment.degreeName}-${currentAssignment.semester}`}>
                                                {getAvailableSubjects.map(sub => (
                                                    <option key={sub} value={sub} />
                                                ))}
                                            </datalist>
                                            
                                            {currentAssignment.subjects.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubject(index)}
                                                    className="text-red-600 hover:text-red-800 p-1 transition-colors"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentAssignment(prev => ({ ...prev, subjects: [...prev.subjects, ""] }))}
                                    className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" /> Add Subject
                                </button>
                                {formErrors.subjects && <p className="mt-1 text-sm text-red-600">{formErrors.subjects}</p>}
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                {editingAssignmentIndex !== null ? (
                                    <button
                                        type="button"
                                        onClick={handleUpdateAssignment}
                                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md"
                                    >
                                        Update Assignment
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleAddAssignmentToList}
                                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
                                    >
                                        Add to List
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={resetCurrentAssignmentForm}
                                    className="ml-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition duration-200"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        
                        {(assignmentsForSelectedTeacher.length > 0 || newAssignments.length > 0) && (
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-300">
                                <h4 className="text-xl font-semibold text-gray-900 mb-4">Assignments to be Saved ({assignmentsForSelectedTeacher.length + newAssignments.length})</h4>
                                <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                                    {[...assignmentsForSelectedTeacher, ...newAssignments].map((assignment, index) => (
                                        <li key={`${assignment.type}-${assignment.classNumber || assignment.degreeName}-${index}`} className="p-4 flex justify-between items-center bg-gray-50">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {renderAssignmentDetails(assignment)}
                                                </p>
                                                <p className="text-xs text-gray-500">Subjects: {assignment.subjects.join(", ")}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditTableAssignment(selectedStaff, index)} // Re-use table edit logic
                                                    className="text-yellow-600 hover:text-yellow-800 p-1"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTableAssignment(selectedStaff, index)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 shadow-md flex items-center"
                                    >
                                        <AcademicCapIcon className="h-5 w-5 mr-2" /> Save All Assignments
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Existing Assigned Classes</h2>
                
                {loading ? (
                    <Loader />
                ) : filteredTeachersAndAssignments.length === 0 ? (
                    <Message type="info" text="No assignments found matching the criteria." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-separate border-spacing-y-2 border-white shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-green-600 text-white rounded-md">
                                <tr>
                                    <th className="p-2">Teacher</th>
                                    <th className="p-2">Type</th>
                                    <th className="p-2">Class/Degree</th>
                                    <th className="p-2">Subjects</th>
                                    <th className="p-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeachersAndAssignments.map((assignment) => (
                                    <tr key={`${assignment.teacherId}-${assignment.assignmentIndex}`} className="text-center bg-gray-50 hover:bg-gray-200 transition-colors duration-150">
                                        <td className="border border-white p-2 text-sm font-medium text-gray-900">
                                            {assignment.teacherName}
                                        </td>
                                        <td className="border border-white p-2 text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.type === 'Class' ? 'bg-blue-100 text-blue-800' : assignment.type === 'BS' ? 'bg-purple-100 text-purple-800' : assignment.type === 'Almiya' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {assignment.type}
                                            </span>
                                        </td>
                                        <td className="border border-white p-2 text-sm text-gray-500">
                                            {renderAssignmentDetails(assignment)}
                                        </td>
                                        <td className="border border-white p-2 text-sm text-gray-500">
                                            {assignment.subjects.join(", ")}
                                        </td>
                                        <td className="border border-white p-2 text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditTableAssignment(assignment.teacherId, assignment.assignmentIndex)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-2 p-1 rounded-md hover:bg-gray-100"
                                                title="Edit Assignment"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTableAssignment(assignment.teacherId, assignment.assignmentIndex)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
                                                title="Delete Assignment"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignClasses;