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
                    setSalaryPerMonth(defaultStaff.salary);
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
                    setDeduction(data.deduction || 0);
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to fetch salary details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchSalaryDetails();
        } else if (salaryToEdit) {
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
            setDeduction(salaryToEdit.deduction || 0);
        }
    }, [id, salaryToEdit]);

    const handleCancel = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/salaries');
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
                    params: { role: '', month, year },
                });
                const duplicate = allSalaries.find(s => s.staff === selectedStaff || s.staff?._id === selectedStaff);
                if (duplicate && !id && !salaryToEdit) {
                    setError(`Salary record for this staff for ${months[month - 1]} ${year} already exists.`);
                    setLoading(false);
                    return;
                }
            } catch (fetchErr) {
                console.warn('Duplicate check failed:', fetchErr);
            }

            await api.post('/salary', salaryData);
            setSuccess('Salary record saved successfully!');
            if (onAdd) onAdd();
            if (onEdit) onEdit();
            setTimeout(() => navigate('/salaries'), 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save salary record.');
        } finally {
            setLoading(false);
        }
    };
    const inputBase = 'w-full rounded-lg border border-gray-200 bg-white/80 px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';
    const labelBase = 'text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1';
    const sectionBase = 'p-4 md:p-5 bg-gray-50/70 border border-gray-100 rounded-xl space-y-4';
    const titleText = isViewMode ? 'Salary Details' : (id || salaryToEdit ? 'Edit Staff Salary' : 'Add Staff Salary');
    const showHero = !isViewMode; // Hide hero when modal view already supplies a title

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur shadow-2xl border border-emerald-50 p-6 sm:p-8">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-100/50 via-white to-teal-50/40" aria-hidden />
            <div className="relative">
                {showHero && (
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Payroll</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-green-800 mt-1">{titleText}</h2>
                            <p className="text-sm text-gray-500 mt-2">Record payouts, adjustments, and status in one streamlined view.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : status === 'Partial Paid' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                {status || 'Status'}
                            </span>
                            {loading && <FontAwesomeIcon icon={faSpinner} className="h-5 w-5 text-emerald-600 animate-spin" />}
                        </div>
                    </div>
                )}

                {error && <Message type="error">{error}</Message>}
                {success && <Message type="success">{success}</Message>}
                {loading && !success && !error && <div className="mb-4"><Loader /></div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className={sectionBase}>
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-emerald-600" /> Staff & Compensation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            <div className="space-y-1">
                                <label htmlFor="staff" className={labelBase}>
                                    <UserIcon className="h-4 w-4 text-emerald-600" /> Staff Member
                                </label>
                                <select
                                    id="staff"
                                    value={selectedStaff}
                                    onChange={handleStaffChange}
                                    required
                                    disabled={isViewMode || id || salaryToEdit}
                                    className={inputBase}
                                >
                                    {staffList.length === 0 && <option value="">No staff found</option>}
                                    {staffList.map((staff) => (
                                        <option key={staff._id} value={staff._id}>
                                            {staff.name} - {staff.cnic} ({staff.staffType})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="salaryPerMonth" className={labelBase}>
                                    <CurrencyDollarIcon className="h-4 w-4 text-emerald-600" /> Salary Per Month
                                </label>
                                <input
                                    type="number"
                                    id="salaryPerMonth"
                                    value={salaryPerMonth}
                                    onChange={(e) => setSalaryPerMonth(e.target.value)}
                                    required
                                    disabled={isViewMode}
                                    className={inputBase}
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="paidAmount" className={labelBase}>
                                    <CurrencyDollarIcon className="h-4 w-4 text-emerald-600" /> Paid Amount
                                </label>
                                <input
                                    type="number"
                                    id="paidAmount"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(e.target.value)}
                                    disabled={isViewMode}
                                    className={inputBase}
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="paidAs" className={labelBase}>
                                    <CurrencyDollarIcon className="h-4 w-4 text-emerald-600" /> Paid As
                                </label>
                                <select
                                    id="paidAs"
                                    value={paidAs}
                                    onChange={(e) => setPaidAs(e.target.value)}
                                    disabled={isViewMode}
                                    className={inputBase}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Online Wallet">Online Wallet</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={sectionBase}>
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <CurrencyDollarIcon className="h-5 w-5 text-emerald-600" /> Adjustments
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            <div className="space-y-1">
                                <label htmlFor="advancedSalary" className={labelBase}>Advanced Salary</label>
                                <input
                                    type="number"
                                    id="advancedSalary"
                                    value={advancedSalary}
                                    onChange={(e) => setAdvancedSalary(e.target.value)}
                                    disabled={isViewMode}
                                    className={inputBase}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="deduction" className={labelBase}>Deduction</label>
                                <input
                                    type="number"
                                    id="deduction"
                                    value={deduction}
                                    readOnly
                                    className={`${inputBase} bg-gray-100`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={sectionBase}>
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <CalendarDaysIcon className="h-5 w-5 text-emerald-600" /> Schedule & Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                            <div className="space-y-1">
                                <label htmlFor="month" className={labelBase}>
                                    <CalendarDaysIcon className="h-4 w-4 text-emerald-600" /> Month
                                </label>
                                <select
                                    id="month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    required
                                    disabled={isViewMode || id || salaryToEdit}
                                    className={inputBase}
                                >
                                    {months.map((m, index) => (
                                        <option key={index + 1} value={index + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="year" className={labelBase}>
                                    <CalendarDaysIcon className="h-4 w-4 text-emerald-600" /> Year
                                </label>
                                <select
                                    id="year"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    required
                                    disabled={isViewMode || id || salaryToEdit}
                                    className={inputBase}
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="status" className={labelBase}>
                                    <CheckIcon className="h-4 w-4 text-emerald-600" /> Status
                                </label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={isViewMode}
                                    className={inputBase}
                                >
                                    {salaryStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={sectionBase}>
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <ClockIcon className="h-5 w-5 text-emerald-600" /> Extras
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            <div className="space-y-1">
                                <label htmlFor="bonus" className={labelBase}>Bonus</label>
                                <input
                                    type="number"
                                    id="bonus"
                                    value={bonus}
                                    onChange={(e) => setBonus(e.target.value)}
                                    disabled={isViewMode}
                                    className={inputBase}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="overtime" className={labelBase}>Overtime</label>
                                <input
                                    type="number"
                                    id="overtime"
                                    value={overtime}
                                    onChange={(e) => setOvertime(e.target.value)}
                                    disabled={isViewMode}
                                    className={inputBase}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        {!isViewMode && (
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition disabled:from-emerald-400 disabled:to-emerald-400"
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
        </div>
    );
};

export default SalaryForm;