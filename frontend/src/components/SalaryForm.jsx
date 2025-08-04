// // src/components/SalaryForm.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import api from '../api';
// import Message from './Message';
// import Loader from './Loader';
// import { CurrencyDollarIcon, UserIcon, CalendarDaysIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/outline';

// const SalaryForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [staffList, setStaffList] = useState([]);
//   const [selectedStaff, setSelectedStaff] = useState('');
//   const [salaryPerMonth, setSalaryPerMonth] = useState('');
//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [status, setStatus] = useState('Unpaid');
//   const [paidAmount, setPaidAmount] = useState('');
//   const [paidAs, setPaidAs] = useState('Cash');
//   const [bonus, setBonus] = useState(0);
//   const [overtime, setOvertime] = useState(0);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   const years = [...Array(10).keys()].map(i => new Date().getFullYear() - i);

//   useEffect(() => {
//     const fetchStaff = async () => {
//       setLoading(true);
//       try {
//         const { data } = await api.get('/salary/staff');
//         setStaffList(data);
//         if (data.length > 0) {
//           setSelectedStaff(data[0]._id);
//         }
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch staff list.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStaff();
//   }, []);

//   useEffect(() => {
//     if (id) {
//       const fetchSalaryDetails = async () => {
//         setLoading(true);
//         try {
//           const { data } = await api.get(`/salary/${id}`);
//           setSelectedStaff(data.staff);
//           setSalaryPerMonth(data.salaryPerMonth);
//           setMonth(data.month);
//           setYear(data.year);
//           setStatus(data.status);
//           setPaidAmount(data.paidAmount);
//           setPaidAs(data.paidAs);
//           setBonus(data.bonus);
//           setOvertime(data.overtime);
//         } catch (err) {
//           setError(err.response?.data?.message || 'Failed to fetch salary details.');
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchSalaryDetails();
//     }
//   }, [id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');
//     try {
//       const salaryData = {
//         staffId: selectedStaff,
//         salaryPerMonth,
//         month,
//         year,
//         status,
//         paidAmount,
//         paidAs,
//         bonus,
//         overtime,
//       };

//       await api.post('/salary', salaryData);
//       setSuccess('Salary record created/updated successfully!');
//       setTimeout(() => navigate('/salaries'), 2000);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to save salary record.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-4xl">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
//         {id ? 'Edit Staff Salary' : 'Add Staff Salary'}
//       </h2>

//       {loading && <Loader />}
//       {error && <Message type="error">{error}</Message>}
//       {success && <Message type="success">{success}</Message>}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label htmlFor="staff" className="block text-sm font-medium text-gray-700 flex items-center">
//             <UserIcon className="h-4 w-4 mr-2" /> Staff Member
//           </label>
//           <select
//             id="staff"
//             value={selectedStaff}
//             onChange={(e) => setSelectedStaff(e.target.value)}
//             required
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           >
//             {staffList.map((staff) => (
//               <option key={staff._id} value={staff._id}>
//                 {staff.name} - {staff.cnic} ({staff.role})
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="salaryPerMonth" className=" text-sm font-medium text-gray-700 flex items-center">
//               <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Salary Per Month
//             </label>
//             <input
//               type="number"
//               id="salaryPerMonth"
//               value={salaryPerMonth}
//               onChange={(e) => setSalaryPerMonth(e.target.value)}
//               required
//               className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>

//           <div>
//             <label htmlFor="paidAmount" className=" text-sm font-medium text-gray-700 flex items-center">
//               <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Paid Amount
//             </label>
//             <input
//               type="number"
//               id="paidAmount"
//               value={paidAmount}
//               onChange={(e) => setPaidAmount(e.target.value)}
//               className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label htmlFor="month" className=" text-sm font-medium text-gray-700 flex items-center">
//               <CalendarDaysIcon className="h-4 w-4 mr-2" /> Month
//             </label>
//             <select
//               id="month"
//               value={month}
//               onChange={(e) => setMonth(e.target.value)}
//               required
//               className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               {months.map((m, index) => (
//                 <option key={index + 1} value={index + 1}>{m}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="year" className=" text-sm font-medium text-gray-700 flex items-center">
//               <CalendarDaysIcon className="h-4 w-4 mr-2" /> Year
//             </label>
//             <select
//               id="year"
//               value={year}
//               onChange={(e) => setYear(e.target.value)}
//               required
//               className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               {years.map((y) => (
//                 <option key={y} value={y}>{y}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="status" className=" text-sm font-medium text-gray-700 flex items-center">
//               <CheckIcon className="h-4 w-4 mr-2" /> Status
//             </label>
//             <select
//               id="status"
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="Unpaid">Unpaid</option>
//               <option value="Paid">Paid</option>
//               <option value="Partial Paid">Partial Paid</option>
//             </select>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label htmlFor="paidAs" className=" text-sm font-medium text-gray-700 flex items-center">
//               <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Paid As
//             </label>
//             <select
//               id="paidAs"
//               value={paidAs}
//               onChange={(e) => setPaidAs(e.target.value)}
//               className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="Cash">Cash</option>
//               <option value="Online Wallet">Online Wallet</option>
//               <option value="Bank Transfer">Bank Transfer</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>
//           <div>
//             <label htmlFor="bonus" className=" text-sm font-medium text-gray-700 flex items-center">
//               <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Bonus
//             </label>
//             <input
//               type="number"
//               id="bonus"
//               value={bonus}
//               onChange={(e) => setBonus(e.target.value)}
//               className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div>
//             <label htmlFor="overtime" className=" text-sm font-medium text-gray-700 flex items-center">
//               <ClockIcon className="h-4 w-4 mr-2" /> Overtime
//             </label>
//             <input
//               type="number"
//               id="overtime"
//               value={overtime}
//               onChange={(e) => setOvertime(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm flex items-center justify-center"
//           disabled={loading}
//         >
//           {id ? 'Update Salary' : 'Add Salary'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SalaryForm;




// // src/components/SalaryForm.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import api from '../api';
// import Message from './Message';
// import Loader from './Loader';
// import { CurrencyDollarIcon, UserIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';

// const SalaryForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [staffList, setStaffList] = useState([]);
//   const [selectedStaff, setSelectedStaff] = useState('');
//   const [salaryPerMonth, setSalaryPerMonth] = useState(''); // This will now be populated automatically
//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [status, setStatus] = useState('Unpaid');
//   const [paidAmount, setPaidAmount] = useState('');
//   const [paidAs, setPaidAs] = useState('Cash');
//   const [bonus, setBonus] = useState(0);
//   const [overtime, setOvertime] = useState(0);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//   const years = [...Array(10).keys()].map(i => new Date().getFullYear() - i);

//   useEffect(() => {
//     const fetchStaff = async () => {
//       setLoading(true);
//       try {
//         const { data } = await api.get('/salary/staff');
//         setStaffList(data);
//         if (data.length > 0) {
//           setSelectedStaff(data[0]._id);
//           setSalaryPerMonth(data[0].salary); // Auto-populate salary
//         }
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch staff list.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStaff();
//   }, []);

//   useEffect(() => {
//     if (id) {
//       const fetchSalaryDetails = async () => {
//         setLoading(true);
//         try {
//           const { data } = await api.get(`/salary/${id}`);
//           setSelectedStaff(data.staff);
//           setSalaryPerMonth(data.salaryPerMonth);
//           setMonth(data.month);
//           setYear(data.year);
//           setStatus(data.status);
//           setPaidAmount(data.paidAmount);
//           setPaidAs(data.paidAs);
//           setBonus(data.bonus);
//           setOvertime(data.overtime);
//         } catch (err) {
//           setError(err.response?.data?.message || 'Failed to fetch salary details.');
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchSalaryDetails();
//     }
//   }, [id]);

//   // Handle staff selection to auto-populate salary
//   const handleStaffChange = (e) => {
//     const staffId = e.target.value;
//     setSelectedStaff(staffId);
//     const staff = staffList.find(s => s._id === staffId);
//     if (staff) {
//       setSalaryPerMonth(staff.salary);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccess('');
//     try {
//       const salaryData = {
//         staffId: selectedStaff,
//         month,
//         year,
//         status,
//         paidAmount,
//         paidAs,
//         bonus,
//         overtime,
//       };

//   await api.post('/salary', salaryData);
//   setSuccess('Salary record created/updated successfully!');
//   setTimeout(() => navigate('/salaries'), 2000);
// } catch (err) {
//   setError(err.response?.data?.message || 'Failed to save salary record.');
// } finally {
//   setLoading(false);
// }
//   };

//   return (
//     <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-4xl">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
//         {id ? 'Edit Staff Salary' : 'Add Staff Salary'}
//       </h2>

//       {loading && <Loader />}
//       {error && <Message type="error">{error}</Message>}
//       {success && <Message type="success">{success}</Message>}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label htmlFor="staff" className="block text-sm font-medium text-gray-700 flex items-center">
//             <UserIcon className="h-4 w-4 mr-2" /> Staff Member
//           </label>
//           <select
//             id="staff"
//             value={selectedStaff}
//             onChange={handleStaffChange} // Use the new handler
//             required
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           >
//             {staffList.map((staff) => (
//               <option key={staff._id} value={staff._id}>
//                 {staff.name} - {staff.cnic} ({staff.staffType})
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="salaryPerMonth" className="block text-sm font-medium text-gray-700 flex items-center">
//               <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Salary Per Month
//             </label>
//             <input
//               type="number"
//               id="salaryPerMonth"
//               value={salaryPerMonth}
//               readOnly // This input is now read-only
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
//             />
//           </div>

//           <div>
//             <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 flex items-center">
//               <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Paid Amount
//             </label>
//             <input
//               type="number"
//               id="paidAmount"
//               value={paidAmount}
//               onChange={(e) => setPaidAmount(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//         </div>

//         {/* ... (rest of the form remains the same) */}

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label htmlFor="month" className="block text-sm font-medium text-gray-700 flex items-center">
//               <CalendarDaysIcon className="h-4 w-4 mr-2" /> Month
//             </label>
//             <select
//               id="month"
//               value={month}
//               onChange={(e) => setMonth(e.target.value)}
//               required
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               {months.map((m, index) => (
//                 <option key={index + 1} value={index + 1}>{m}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="year" className="block text-sm font-medium text-gray-700 flex items-center">
//               <CalendarDaysIcon className="h-4 w-4 mr-2" /> Year
//             </label>
//             <select
//               id="year"
//               value={year}
//               onChange={(e) => setYear(e.target.value)}
//               required
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               {years.map((y) => (
//                 <option key={y} value={y}>{y}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center">
//               <ClockIcon className="h-4 w-4 mr-2" /> Status
//             </label>
//             <select
//               id="status"
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="Unpaid">Unpaid</option>
//               <option value="Paid">Paid</option>
//               <option value="Partial Paid">Partial Paid</option>
//             </select>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label htmlFor="paidAs" className="block text-sm font-medium text-gray-700 flex items-center">
//               <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Paid As
//             </label>
//             <select
//               id="paidAs"
//               value={paidAs}
//               onChange={(e) => setPaidAs(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="Cash">Cash</option>
//               <option value="Online Wallet">Online Wallet</option>
//               <option value="Bank Transfer">Bank Transfer</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>
//           <div>
//             <label htmlFor="bonus" className="block text-sm font-medium text-gray-700 flex items-center">
//               <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Bonus
//             </label>
//             <input
//               type="number"
//               id="bonus"
//               value={bonus}
//               onChange={(e) => setBonus(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div>
//             <label htmlFor="overtime" className="block text-sm font-medium text-gray-700 flex items-center">
//               <ClockIcon className="h-4 w-4 mr-2" /> Overtime
//             </label>
//             <input
//               type="number"
//               id="overtime"
//               value={overtime}
//               onChange={(e) => setOvertime(e.target.value)}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm flex items-center justify-center"
//           disabled={loading}
//         >
//           {id ? 'Update Salary' : 'Add Salary'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SalaryForm;


// src/components/SalaryForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Message from './Message';
import Loader from './Loader';
import { CurrencyDollarIcon, UserIcon, CalendarDaysIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserContext } from '../App';
const SalaryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [salaryPerMonth, setSalaryPerMonth] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [status, setStatus] = useState('Unpaid');
    const [paidAmount, setPaidAmount] = useState('');
    const [paidAs, setPaidAs] = useState('Cash');
    const [bonus, setBonus] = useState(0);
    const [overtime, setOvertime] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [...Array(10).keys()].map(i => new Date().getFullYear() - i);

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/salary/staff');
                setStaffList(data);
                if (data.length > 0) {
                    setSelectedStaff(data[0]._id);
                    setSalaryPerMonth(data[0].salary);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch staff list.');
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchSalaryDetails = async () => {
                setLoading(true);
                try {
                    const { data } = await api.get(`/salary/${id}`);
                    setSelectedStaff(data.staff);
                    setSalaryPerMonth(data.salaryPerMonth);
                    setMonth(data.month);
                    setYear(data.year);
                    setStatus(data.status);
                    setPaidAmount(data.paidAmount);
                    setPaidAs(data.paidAs);
                    setBonus(data.bonus);
                    setOvertime(data.overtime);
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to fetch salary details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchSalaryDetails();
        }
    }, [id]);

    const handleStaffChange = (e) => {
        const staffId = e.target.value;
        setSelectedStaff(staffId);
        const staff = staffList.find(s => s._id === staffId);
        if (staff) {
            setSalaryPerMonth(staff.salary);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const salaryData = {
                staffId: selectedStaff,
                month,
                year,
                status,
                paidAmount,
                paidAs,
                bonus,
                overtime,
            };

            await api.post('/salary', salaryData);
            setSuccess('Salary record created/updated successfully!');
            setTimeout(() => navigate('/salaries'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save salary record.');
        } finally {
            setLoading(false);
        }

        //   setTimeout(() => navigate('/salaries'), 2000);
        // } catch (err) {
        //   setError(err.response?.data?.message || 'Failed to save salary record.');
        // } finally {
        //   setLoading(false);
        // }
    };

    const handleCancel = () => {
        navigate('/salaries');
    };

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-3xl font-bold text-gray-800">
                    {id ? 'Edit Staff Salary' : 'Add Staff Salary'}
                </h2>
                {id && (
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                )}
            </div>

            {loading && <Loader />}
            {error && <Message type="error">{error}</Message>}
            {success && <Message type="success">{success}</Message>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="staff" className="block text-sm font-medium text-gray-700 flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" /> Staff Member
                    </label>
                    <select
                        id="staff"
                        value={selectedStaff}
                        onChange={handleStaffChange}
                        required
                        disabled={!!id} // Disable selection in edit mode
                        className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm
              ${id ? 'bg-gray-100 text-gray-500' : 'focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'}`}
                    >
                        {staffList.map((staff) => (
                            <option key={staff._id} value={staff._id}>
                                {staff.name} - {staff.cnic} ({staff.staffType})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="salaryPerMonth" className="block text-sm font-medium text-gray-700 flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Salary Per Month
                        </label>
                        <input
                            type="number"
                            id="salaryPerMonth"
                            value={salaryPerMonth}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Paid Amount
                        </label>
                        <input
                            type="number"
                            id="paidAmount"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="month" className="block text-sm font-medium text-gray-700 flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-2" /> Month
                        </label>
                        <select
                            id="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            {months.map((m, index) => (
                                <option key={index + 1} value={index + 1}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-2" /> Year
                        </label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2" /> Status
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                            <option value="Partial Paid">Partial Paid</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="paidAs" className="block text-sm font-medium text-gray-700 flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Paid As
                        </label>
                        <select
                            id="paidAs"
                            value={paidAs}
                            onChange={(e) => setPaidAs(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Online Wallet">Online Wallet</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bonus" className="block text-sm font-medium text-gray-700 flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Bonus
                        </label>
                        <input
                            type="number"
                            id="bonus"
                            value={bonus}
                            onChange={(e) => setBonus(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="overtime" className="block text-sm font-medium text-gray-700 flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2" /> Overtime
                        </label>
                        <input
                            type="number"
                            id="overtime"
                            value={overtime}
                            onChange={(e) => setOvertime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    {id ? (
                        <>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm"
                                disabled={loading}
                            >
                                Update Salary
                            </button>
                        </>
                    ) : (
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm"
                            disabled={loading}
                        >
                            Add Salary
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SalaryForm;