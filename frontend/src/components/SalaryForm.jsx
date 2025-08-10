// // src/components/SalaryForm.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import api from '../api';
// import Message from './Message';
// import Loader from './Loader';
// import { CurrencyDollarIcon, UserIcon, CalendarDaysIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
// import { UserContext } from '../App';
// const SalaryForm = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();

//     const [staffList, setStaffList] = useState([]);
//     const [selectedStaff, setSelectedStaff] = useState('');
//     const [salaryPerMonth, setSalaryPerMonth] = useState('');
//     const [month, setMonth] = useState(new Date().getMonth() + 1);
//     const [year, setYear] = useState(new Date().getFullYear());
//     const [status, setStatus] = useState('Unpaid');
//     const [paidAmount, setPaidAmount] = useState('');
//     const [paidAs, setPaidAs] = useState('Cash');
//     const [bonus, setBonus] = useState(0);
//     const [overtime, setOvertime] = useState(0);

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//     const years = [...Array(10).keys()].map(i => new Date().getFullYear() - i);

//     useEffect(() => {
//         const fetchStaff = async () => {
//             setLoading(true);
//             try {
//                 const { data } = await api.get('/salary/staff');
//                 setStaffList(data);
//                 if (data.length > 0) {
//                     setSelectedStaff(data[0]._id);
//                     setSalaryPerMonth(data[0].salary);
//                 }
//             } catch (err) {
//                 setError(err.response?.data?.message || 'Failed to fetch staff list.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchStaff();
//     }, []);

//     useEffect(() => {
//         if (id) {
//             const fetchSalaryDetails = async () => {
//                 setLoading(true);
//                 try {
//                     const { data } = await api.get(`/salary/${id}`);
//                     setSelectedStaff(data.staff);
//                     setSalaryPerMonth(data.salaryPerMonth);
//                     setMonth(data.month);
//                     setYear(data.year);
//                     setStatus(data.status);
//                     setPaidAmount(data.paidAmount);
//                     setPaidAs(data.paidAs);
//                     setBonus(data.bonus);
//                     setOvertime(data.overtime);
//                 } catch (err) {
//                     setError(err.response?.data?.message || 'Failed to fetch salary details.');
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             fetchSalaryDetails();
//         }
//     }, [id]);

// const handleStaffChange = (e) => {
//     const staffId = e.target.value;
//     setSelectedStaff(staffId);
//     const staff = staffList.find(s => s._id === staffId);
//     if (staff) {
//         setSalaryPerMonth(staff.salary);
//     }
// };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         setSuccess('');
//         try {
//             const salaryData = {
//                 staffId: selectedStaff,
//                 month,
//                 year,
//                 status,
//                 paidAmount,
//                 paidAs,
//                 bonus,
//                 overtime,
//             };

//             await api.post('/salary', salaryData);
//             setSuccess('Salary record created/updated successfully!');
//             setTimeout(() => navigate('/salaries'), 2000);
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to save salary record.');
//         } finally {
//             setLoading(false);
//         }

//         //   setTimeout(() => navigate('/salaries'), 2000);
//         // } catch (err) {
//         //   setError(err.response?.data?.message || 'Failed to save salary record.');
//         // } finally {
//         //   setLoading(false);
//         // }
//     };

// const handleCancel = () => {
//     navigate('/salaries');
// };

//     return (
//         <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg my-8 max-w-4xl">
//             <div className="flex justify-between items-center mb-6 border-b pb-4">
//                 <h2 className="text-3xl font-bold text-gray-800">
//                     {id ? 'Edit Staff Salary' : 'Add Staff Salary'}
//                 </h2>
//                 {id && (
//                     <button onClick={handleCancel} className="text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200">
//                         <XMarkIcon className="h-6 w-6" />
//                     </button>
//                 )}
//             </div>

//             {loading && <Loader />}
//             {error && <Message type="error">{error}</Message>}
//             {success && <Message type="success">{success}</Message>}

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <div>
//                     <label htmlFor="staff" className="block text-sm font-medium text-gray-700 flex items-center">
//                         <UserIcon className="h-4 w-4 mr-2" /> Staff Member
//                     </label>
//                     <select
//                         id="staff"
//                         value={selectedStaff}
//                         onChange={handleStaffChange}
//                         required
//                         disabled={!!id} // Disable selection in edit mode
//                         className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm
//               ${id ? 'bg-gray-100 text-gray-500' : 'focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'}`}
//                     >
//                         {staffList.map((staff) => (
//                             <option key={staff._id} value={staff._id}>
//                                 {staff.name} - {staff.cnic} ({staff.staffType})
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                         <label htmlFor="salaryPerMonth" className="block text-sm font-medium text-gray-700 flex items-center">
//                             <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Salary Per Month
//                         </label>
//                         <input
//                             type="number"
//                             id="salaryPerMonth"
//                             value={salaryPerMonth}
//                             readOnly
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 flex items-center">
//                             <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Paid Amount
//                         </label>
//                         <input
//                             type="number"
//                             id="paidAmount"
//                             value={paidAmount}
//                             onChange={(e) => setPaidAmount(e.target.value)}
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                         />
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div>
//                         <label htmlFor="month" className="block text-sm font-medium text-gray-700 flex items-center">
//                             <CalendarDaysIcon className="h-4 w-4 mr-2" /> Month
//                         </label>
//                         <select
//                             id="month"
//                             value={month}
//                             onChange={(e) => setMonth(e.target.value)}
//                             required
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                         >
//                             {months.map((m, index) => (
//                                 <option key={index + 1} value={index + 1}>{m}</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <label htmlFor="year" className="block text-sm font-medium text-gray-700 flex items-center">
//                             <CalendarDaysIcon className="h-4 w-4 mr-2" /> Year
//                         </label>
//                         <select
//                             id="year"
//                             value={year}
//                             onChange={(e) => setYear(e.target.value)}
//                             required
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                         >
//                             {years.map((y) => (
//                                 <option key={y} value={y}>{y}</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center">
//                             <ClockIcon className="h-4 w-4 mr-2" /> Status
//                         </label>
//                         <select
//                             id="status"
//                             value={status}
//                             onChange={(e) => setStatus(e.target.value)}
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                         >
//                             <option value="Unpaid">Unpaid</option>
//                             <option value="Paid">Paid</option>
//                             <option value="Partial Paid">Partial Paid</option>
//                         </select>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div>
//                         <label htmlFor="paidAs" className="block text-sm font-medium text-gray-700 flex items-center">
//                             <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Paid As
//                         </label>
//                         <select
//                             id="paidAs"
//                             value={paidAs}
//                             onChange={(e) => setPaidAs(e.target.value)}
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                         >
//                             <option value="Cash">Cash</option>
//                             <option value="Online Wallet">Online Wallet</option>
//                             <option value="Bank Transfer">Bank Transfer</option>
//                             <option value="Other">Other</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label htmlFor="bonus" className="block text-sm font-medium text-gray-700 flex items-center">
//                             <CurrencyDollarIcon className="h-4 w-4 mr-2" /> Bonus
//                         </label>
//                         <input
//                             type="number"
//                             id="bonus"
//                             value={bonus}
//                             onChange={(e) => setBonus(e.target.value)}
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="overtime" className="block text-sm font-medium text-gray-700 flex items-center">
//                             <ClockIcon className="h-4 w-4 mr-2" /> Overtime
//                         </label>
//                         <input
//                             type="number"
//                             id="overtime"
//                             value={overtime}
//                             onChange={(e) => setOvertime(e.target.value)}
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                         />
//                     </div>
//                 </div>

//                 <div className="flex justify-end space-x-4">
{
    // id ? (
    //     <>
    //         <button
    //             type="button"
    //             onClick={handleCancel}
    //             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200 shadow-sm"
    //         >
    //             Cancel
    //         </button>
    //         <button
    //             type="submit"
    //             className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm"
    //             disabled={loading}
    //         >
    //             Update Salary
    //         </button>
    //     </>
    // ) : (
    //     <button
    //         type="submit"
    //         className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 shadow-sm"
    //         disabled={loading}
    //     >
    //         Add Salary
    //     </button>
    // )
}
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default SalaryForm;



// src/components/SalaryForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Message from './Message';
import Loader from './Loader';
import { CurrencyDollarIcon, UserIcon, CalendarDaysIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const SalaryForm = ({ salaryToEdit, isViewMode, onAdd, onEdit, onClose }) => {
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

    const [advancedSalary, setAdvancedSalary] = useState(0);
    const [deduction, setDeduction] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [...Array(10).keys()].map(i => new Date().getFullYear() - i);
    const salaryStatuses = ['Paid', 'Unpaid', 'Partial Paid'];

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/salary/staff');
                setStaffList(data);
                if (data.length > 0 && !id && !salaryToEdit) {
                    const defaultStaff = data[0];
                    setSelectedStaff(defaultStaff._id);
                    setSalaryPerMonth(defaultStaff.salary); // <-- fix here!
                }

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch staff list.');
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [id, salaryToEdit]);

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
                    setAdvancedSalary(data.advancedSalary);
                    setDeduction(data.deduction);
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to fetch salary details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchSalaryDetails();
        } else if (salaryToEdit) {
            // Logic for modal view/edit
            setSelectedStaff(salaryToEdit.staff);
            setSalaryPerMonth(salaryToEdit.salaryPerMonth);
            setMonth(salaryToEdit.month);
            setYear(salaryToEdit.year);
            setStatus(salaryToEdit.status);
            setPaidAmount(salaryToEdit.paidAmount);
            setPaidAs(salaryToEdit.paidAs);
            setBonus(salaryToEdit.bonus);
            setOvertime(salaryToEdit.overtime);
            setAdvancedSalary(salaryToEdit.advancedSalary);
        }
    }, [id, salaryToEdit]);

    const handleCancel = () => {
        if (onClose) {
            onClose(); // for modal (view mode)
        } else {
            navigate('/salaries'); // for standalone edit route
        }
    };

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
                salaryPerMonth,
                month,
                year,
                status,
                paidAmount,
                paidAs,
                bonus,
                overtime,
                advancedSalary: parseFloat(advancedSalary),
            };
            try {
                const { data: allSalaries } = await api.get('/salary/all', {
                    params: {
                        role: '', // or remove
                        month,
                        year,
                    }
                });

                const duplicate = allSalaries.find(s =>
                    s.staff === selectedStaff ||
                    s.staff._id === selectedStaff // in case staff is populated object
                );

                if (duplicate && !id && !salaryToEdit) {
                    setError(`Salary record for this staff for ${months[month - 1]} ${year} already exists.`);
                    setLoading(false);
                    return;
                }
            } catch (fetchErr) {
                console.warn("Duplicate check failed:", fetchErr);
            }
            await api.post('/salary', salaryData);
            setTimeout(() => navigate('/salaries'), 800);
            setSuccess('Salary record saved successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save salary record.');
            return; // prevent running onEdit/onClose if save failed
        }
    };

    return (
        <div className={`p-6 ${!isViewMode ? 'bg-white shadow-lg rounded-lg' : ''}`}>
            {!isViewMode && (
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                    {id || salaryToEdit ? 'Edit Staff Salary' : 'Add Staff Salary'}
                </h2>
            )}

            {loading && <Loader />}
            {error && <Message type="error">{error}</Message>}
            {success && <Message type="success">{success}</Message>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="staff" className="block text-sm font-medium text-gray-700">
                        <UserIcon className="h-4 w-4 inline-block mr-2" /> Staff Member
                    </label>
                    <select
                        id="staff"
                        value={selectedStaff}
                        onChange={handleStaffChange}
                        required
                        readOnly={isViewMode}
                        disabled={isViewMode || id || salaryToEdit}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                        <label htmlFor="salaryPerMonth" className="block text-sm font-medium text-gray-700">
                            <CurrencyDollarIcon className="h-4 w-4 inline-block mr-2" /> Salary Per Month
                        </label>
                        <input
                            type="number"
                            id="salaryPerMonth"
                            value={salaryPerMonth}
                            onChange={(e) => setSalaryPerMonth(e.target.value)}
                            required
                            readOnly={isViewMode}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700">
                            <CurrencyDollarIcon className="h-4 w-4 inline-block mr-2" /> Paid Amount
                        </label>
                        <input
                            type="number"
                            id="paidAmount"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            readOnly={isViewMode}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Advanced Salary */}
                    <div>
                        <label htmlFor="advancedSalary" className="block text-sm font-medium text-gray-700">Advanced Salary</label>
                        <input
                            type="number"
                            id="advancedSalary"
                            value={advancedSalary}
                            onChange={(e) => setAdvancedSalary(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    {/* Deduction (Display only) */}
                    <div>
                        <label htmlFor="deduction" className="block text-sm font-medium text-gray-700">Deduction</label>
                        <input
                            type="number"
                            id="deduction"
                            value={deduction}
                            readOnly
                            className="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                            <CalendarDaysIcon className="h-4 w-4 inline-block mr-2" /> Month
                        </label>
                        <select
                            id="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            required
                            readOnly={isViewMode}
                            disabled={isViewMode || id || salaryToEdit}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        >
                            {months.map((m, index) => (
                                <option key={index + 1} value={index + 1}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                            <CalendarDaysIcon className="h-4 w-4 inline-block mr-2" /> Year
                        </label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            required
                            readOnly={isViewMode}
                            disabled={isViewMode || id || salaryToEdit}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            <CheckIcon className="h-4 w-4 inline-block mr-2" /> Status
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            readOnly={isViewMode}
                            disabled={isViewMode}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        >
                            {salaryStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="paidAs" className="block text-sm font-medium text-gray-700">
                            <CurrencyDollarIcon className="h-4 w-4 inline-block mr-2" /> Paid As
                        </label>
                        <select
                            id="paidAs"
                            value={paidAs}
                            onChange={(e) => setPaidAs(e.target.value)}
                            readOnly={isViewMode}
                            disabled={isViewMode}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Online Wallet">Online Wallet</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bonus" className="block text-sm font-medium text-gray-700">
                            <CurrencyDollarIcon className="h-4 w-4 inline-block mr-2" /> Bonus
                        </label>
                        <input
                            type="number"
                            id="bonus"
                            value={bonus}
                            onChange={(e) => setBonus(e.target.value)}
                            readOnly={isViewMode}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="overtime" className="block text-sm font-medium text-gray-700">
                            <ClockIcon className="h-4 w-4 inline-block mr-2" /> Overtime
                        </label>
                        <input
                            type="number"
                            id="overtime"
                            value={overtime}
                            onChange={(e) => setOvertime(e.target.value)}
                            readOnly={isViewMode}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-4 mr-5">
                    <>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200 shadow-sm"
                        >
                            Cancel
                        </button>
                    </>
                    {!isViewMode && (
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="flex items-center justify-center px-6 py-2 ml-8 text-sm font-medium text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 disabled:bg-green-400 transition duration-150"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                id || salaryToEdit ? 'Update Salary' : 'Add Salary'
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SalaryForm;