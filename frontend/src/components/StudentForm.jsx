// // src/components/StudentForm.jsx
// import React, { useState, useEffect } from 'react';
// import api from '../api'; // Use your configured API instance

// // Define initialState outside the component to prevent re-creation on every render
// const initialState = {
//     name: '',
//     fatherName: '',
//     cnic: '',
//     address: '',
//     guardianContact: '',
//     class: '',
//     feePerMonth: '',
//     siblings: [{ name: '', cnic: '' }],
// };

// const StudentForm = ({ editingStudent, setEditingStudent, fetchStudents, onClose }) => {
//     // Initialize student state based on editingStudent or initialState
//     // This ensures that when editingStudent is available, it's used immediately
//     const [student, setStudent] = useState(editingStudent || initialState);
//     const [error, setError] = useState('');

//     // useEffect to update form fields if editingStudent changes *after* initial render
//     // or if a new student is selected for editing while the form is open
//     useEffect(() => {
//         setStudent(editingStudent || initialState);
//         setError(''); // Clear any previous errors when editingStudent changes
//     }, [editingStudent]); // Dependency on editingStudent

//     const handleChange = (e, index) => {
//         const { name, value } = e.target;
//         if (name.startsWith('sibling')) {
//             const newSiblings = [...student.siblings];
//             // Ensure the sibling object exists before trying to assign a property
//             if (!newSiblings[index]) {
//                 newSiblings[index] = { name: '', cnic: '' };
//             }
//             newSiblings[index][name.split('.')[1]] = value;
//             setStudent({ ...student, siblings: newSiblings });
//         } else {
//             setStudent({ ...student, [name]: value });
//         }
//     };

//     // This function will add a new empty sibling input row
//     const addSibling = () => {
//         setStudent(prevStudent => ({
//             ...prevStudent,
//             siblings: [...prevStudent.siblings, { name: '', cnic: '' }]
//         }));
//     };

//     // This function will remove a sibling input row
//     const removeSibling = (indexToRemove) => {
//         setStudent(prevStudent => ({
//             ...prevStudent,
//             siblings: prevStudent.siblings.filter((_, index) => index !== indexToRemove)
//         }));
//     };

//     const validate = () => {
//         if (!student.name || !student.fatherName || !student.cnic || !student.address || !student.guardianContact || !student.class || student.feePerMonth === '' || student.feePerMonth === null) {
//             return 'All core fields are required (Name, Father, CNIC, Address, Contact, Class, Fee)';
//         }
//         if (student.cnic.length !== 13) return 'CNIC must be 13 digits';
//         if (student.guardianContact.length !== 11) return 'Guardian contact must be 11 digits';
//         if (parseFloat(student.feePerMonth) < 0) return 'Fee cannot be negative';

//         // Validate siblings
//         for (const sib of student.siblings) {
//             if (sib.name && sib.cnic && sib.cnic.length !== 13) {
//                 return 'Sibling CNIC must be 13 digits if provided';
//             }
//         }
//         return '';
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const validationError = validate();
//         if (validationError) {
//             setError(validationError);
//             return;
//         }

//         setError(''); // Clear error before submission
//         try {
//             if (editingStudent) {
//                 await api.put(`/students/${editingStudent._id}`, student);
//             } else {
//                 await api.post('/students', student);
//             }
//             fetchStudents(); // Refresh the student list
//             onClose(); // Close the modal
//             // setStudent(initialState); // No longer needed here, onClose handles resetting editingStudent and modal state
//             // setEditingStudent(null); // No longer needed here, onClose handles resetting editingStudent and modal state
//         } catch (err) {
//             console.error("Submission error:", err);
//             setError('Failed to submit student data. Please check your input and try again.');
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="space-y-4">
//             <h2 className="text-2xl font-bold mb-4">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
//             {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</p>}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input type="text" name="name" placeholder="Name" value={student.name} onChange={handleChange} className="input p-2 border rounded" />
//                 <input type="text" name="fatherName" placeholder="Father's Name" value={student.fatherName} onChange={handleChange} className="input p-2 border rounded" />
//                 <input type="text" name="cnic" placeholder="CNIC (13 digits)" value={student.cnic} onChange={handleChange} className="input p-2 border rounded" maxLength="13" />
//                 <input type="text" name="guardianContact" placeholder="Guardian Contact (11 digits)" value={student.guardianContact} onChange={handleChange} className="input p-2 border rounded" maxLength="11" />
//                 <input type="text" name="class" placeholder="Class" value={student.class} onChange={handleChange} className="input p-2 border rounded" />
//                 <input type="number" name="feePerMonth" placeholder="Fee per Month" value={student.feePerMonth} onChange={handleChange} className="input p-2 border rounded" min="0" />
//             </div>
//             <textarea name="address" placeholder="Address" value={student.address} onChange={handleChange} className="input w-full p-2 border rounded"></textarea>
            
//             <div>
//                 <h3 className="font-semibold mb-2">Siblings</h3>
//                 {student.siblings.length === 0 && (
//                     <p className="text-gray-500 text-sm">No siblings added yet. Click "Add Sibling" below.</p>
//                 )}
//                 {Array.isArray(student.siblings) && student.siblings.map((sib, i) => (
//                     <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-center">
//                         <input type="text" name="sibling.name" value={sib.name || ''} onChange={(e) => handleChange(e, i)} placeholder="Sibling Name" className="input p-2 border rounded col-span-1 sm:col-span-1" />
//                         <input type="text" name="sibling.cnic" value={sib.cnic || ''} onChange={(e) => handleChange(e, i)} placeholder="Sibling CNIC (13 digits)" className="input p-2 border rounded col-span-1 sm:col-span-1" maxLength="13" />
//                         {student.siblings.length > 0 && (
//                             <button type="button" onClick={() => removeSibling(i)} className="bg-red-500 text-white px-3 py-2 rounded text-sm self-stretch sm:self-auto">Remove</button>
//                         )}
//                     </div>
//                 ))}
//                 <button type="button" onClick={addSibling} className="bg-purple-600 text-white px-4 py-2 rounded text-sm mt-2">Add Sibling</button>
//             </div>

//             <div className="flex justify-end space-x-2">
//                 <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200">Cancel</button>
//                 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200">
//                     {editingStudent ? 'Update Student' : 'Add Student'}
//                 </button>
//             </div>
//         </form>
//     );
// };

// export default StudentForm;



// src/components/StudentForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

const StudentForm = ({ editingStudent, fetchStudents, onClose }) => {
  const initialState = {
    name: '',
    fatherName: '',
    cnic: '',
    address: '',
    guardianContact: '',
    class: '', // Initial class type
    majorSubject: 'N/A', // Default to N/A
    degreeName: 'N/A',   // Default to N/A
    semester: null,      // Default to null
    feePerMonth: '',
    siblings: [], // Assuming simplified sibling handling for now
  };

  const [student, setStudent] = useState(initialState);
  const [error, setError] = useState('');
  const [currentDegreeYears, setCurrentDegreeYears] = useState(null);

  // Degree years mapping
  const degreeYearsMap = {
    'Islamiyat': 4,
    'Software Engineering': 4,
    'Honors': 2,
    'N/A': null
  };

  useEffect(() => {
    if (editingStudent) {
      setStudent({
        name: editingStudent.name || '',
        fatherName: editingStudent.fatherName || '',
        cnic: editingStudent.cnic || '',
        address: editingStudent.address || '',
        guardianContact: editingStudent.guardianContact || '',
        class: editingStudent.class || '',
        majorSubject: editingStudent.majorSubject || 'N/A',
        degreeName: editingStudent.degreeName || 'N/A',
        semester: editingStudent.semester || null,
        feePerMonth: editingStudent.feePerMonth || '',
        siblings: editingStudent.siblings || [],
      });
      setCurrentDegreeYears(degreeYearsMap[editingStudent.degreeName] || null);
    } else {
      setStudent(initialState);
      setCurrentDegreeYears(null);
    }
    setError('');
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prevStudent => {
      const updatedStudent = { ...prevStudent, [name]: value };

      // Reset conditional fields when class type changes
      if (name === 'class') {
        if (value !== 'BS') {
          updatedStudent.degreeName = 'N/A';
          updatedStudent.semester = null;
          setCurrentDegreeYears(null);
        } else { // If BS is selected, reset majorSubject
          updatedStudent.majorSubject = 'N/A';
        }
      }
      // Update degree years display when degree name changes
      if (name === 'degreeName') {
        setCurrentDegreeYears(degreeYearsMap[value] || null);
      }
      return updatedStudent;
    });
  };

  const validate = () => {
    // Basic validation
    if (!student.name || !student.fatherName || !student.cnic || !student.address || !student.guardianContact || !student.class || !student.feePerMonth) {
      return 'All required fields must be filled.';
    }
    if (student.cnic.length !== 13) {
      return 'CNIC must be 13 digits.';
    }
    if (student.guardianContact.length !== 11) {
      return 'Guardian contact must be 11 digits.';
    }
    if (student.class === 'BS' && (!student.degreeName || student.degreeName === 'N/A' || !student.semester)) {
        return 'For BS level, Degree Name and Semester are required.';
    }
    if (student.class !== 'BS' && student.majorSubject === 'N/A') {
        return 'For Class level, Major Subject is required.';
    }
    return '';
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, student);
      } else {
        await api.post('/students', student);
      }
      fetchStudents();
      onClose();
    } catch (err) {
      console.error("Submission error:", err.response ? err.response.data : err.message);
      setError('Failed to submit student record. Check CNIC uniqueness or server issues.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
      {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" name="name" id="name" value={student.name} onChange={handleChange} className="input p-2 border rounded w-full" required />
        </div>
        <div>
          <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">Father's Name</label>
          <input type="text" name="fatherName" id="fatherName" value={student.fatherName} onChange={handleChange} className="input p-2 border rounded w-full" required />
        </div>
        <div>
          <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">CNIC (13 Digits)</label>
          <input type="text" name="cnic" id="cnic" value={student.cnic} onChange={handleChange} className="input p-2 border rounded w-full" maxLength="13" required />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <input type="text" name="address" id="address" value={student.address} onChange={handleChange} className="input p-2 border rounded w-full" required />
        </div>
        <div>
          <label htmlFor="guardianContact" className="block text-sm font-medium text-gray-700">Guardian Contact (11 Digits)</label>
          <input type="text" name="guardianContact" id="guardianContact" value={student.guardianContact} onChange={handleChange} className="input p-2 border rounded w-full" maxLength="11" required />
        </div>
        <div>
          <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class Level</label>
          <select name="class" id="class" value={student.class} onChange={handleChange} className="input p-2 border rounded w-full" required>
            <option value="">Select Class Level</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={`${i + 1}th`}>{`${i + 1}th`}</option>
            ))}
            <option value="BS">BS Level</option>
          </select>
        </div>

        {student.class !== 'BS' && student.class !== '' && (
          <div>
            <label htmlFor="majorSubject" className="block text-sm font-medium text-gray-700">Major Subject</label>
            <select name="majorSubject" id="majorSubject" value={student.majorSubject} onChange={handleChange} className="input p-2 border rounded w-full" required>
              <option value="N/A">Select Subject</option>
              <option value="Arts">Arts</option>
              <option value="Science">Science</option>
            </select>
          </div>
        )}

        {student.class === 'BS' && (
          <>
            <div>
              <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700">Degree Name</label>
              <select name="degreeName" id="degreeName" value={student.degreeName} onChange={handleChange} className="input p-2 border rounded w-full" required>
                <option value="N/A">Select Degree</option>
                <option value="Islamiyat">Islamiyat</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Honors">Honors</option>
              </select>
            </div>
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester Number</label>
              <select name="semester" id="semester" value={student.semester || ''} onChange={handleChange} className="input p-2 border rounded w-full" required>
                <option value="">Select Semester</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
            {currentDegreeYears && (
              <div>
                <p className="block text-sm font-medium text-gray-700">Degree Years:</p>
                <p className="mt-1 p-2 text-gray-900 font-bold">{currentDegreeYears} years</p>
              </div>
            )}
          </>
        )}

        <div>
          <label htmlFor="feePerMonth" className="block text-sm font-medium text-gray-700">Fee Per Month</label>
          <input type="number" name="feePerMonth" id="feePerMonth" value={student.feePerMonth} onChange={handleChange} className="input p-2 border rounded w-full" required min="0" />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200">Cancel</button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-200">
          {editingStudent ? 'Update Student' : 'Add Student'}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;