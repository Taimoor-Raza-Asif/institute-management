// src/pages/FeeStructurePanel.jsx
import React, { useState, useEffect, useCallback, useContext, useRef, memo } from 'react';
import api from '../api';
import { UserContext } from '../App';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';
import {
    BanknotesIcon, PlusIcon, ArrowPathIcon, BookmarkSquareIcon,
    CheckCircleIcon, ArrowDownTrayIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// ─── Uncontrolled numeric input (prevents focus loss on re-render) ────────────
const FeeInput = memo(({ initialValue, onCommit, disabled }) => {
    const [localValue, setLocalValue] = useState(String(initialValue ?? 0));
    useEffect(() => { setLocalValue(String(initialValue ?? 0)); }, [initialValue]);

    const handleBlur = () => {
        const parsed = parseInt(localValue, 10);
        const safe = isNaN(parsed) || parsed < 0 ? 0 : parsed;
        if (safe !== initialValue) onCommit(safe);
        setLocalValue(String(safe));
    };

    return (
        <input
            type="number"
            min="0"
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="0"
        />
    );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const FeeStructurePanel = () => {
    const { currentUser: user } = useContext(UserContext);
    const { currentTheme } = useTheme();

    const [feeStructure, setFeeStructure] = useState(null);
    const [academicStructure, setAcademicStructure] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('');

    // ── Fetch both structures ────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [feeRes, academicRes] = await Promise.all([
                api.get('/fee-structure'),
                api.get('/academic-structure'),
            ]);

            const fee = feeRes.data || { feeTypes: [] };
            const academic = academicRes.data || { classTypes: [] };

            setFeeStructure(fee);
            setAcademicStructure(academic);

            // Set initial active tab
            if (fee.feeTypes?.length > 0) {
                setActiveTab(fee.feeTypes[0].slug);
            } else if (academic.classTypes?.length > 0) {
                setActiveTab(academic.classTypes[0].slug);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to load fee structure.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'admin') fetchData();
        else {
            setError('You are not authorized to access this panel.');
            setLoading(false);
        }
    }, [user, fetchData]);

    // ── Sync from academic structure ────────────────────────────────────────
    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const { data } = await api.post('/fee-structure/sync');
            setFeeStructure(data.feeStructure);
            const slugs = data.feeStructure?.feeTypes;
            if (slugs?.length > 0) setActiveTab(slugs[0].slug);
            toast.success(data.message || 'Synced successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Sync failed.');
        } finally {
            setIsSyncing(false);
        }
    };

    // ── Save ────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!feeStructure?.feeTypes) return;
        setIsSaving(true);
        try {
            const { data } = await api.put('/fee-structure', { feeTypes: feeStructure.feeTypes });
            setFeeStructure(data.feeStructure);
            toast.success('Fee structure saved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save.');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Update helpers ───────────────────────────────────────────────────────
    const updateClassFee = (slug, classIdentifier, newFee) => {
        setFeeStructure(prev => ({
            ...prev,
            feeTypes: prev.feeTypes.map(ft =>
                ft.slug === slug
                    ? {
                        ...ft,
                        classFees: ft.classFees.map(cf =>
                            cf.classIdentifier === classIdentifier ? { ...cf, feePerMonth: newFee } : cf
                        )
                    }
                    : ft
            )
        }));
    };

    const updateDegreeFee = (slug, degreeName, newFee) => {
        setFeeStructure(prev => ({
            ...prev,
            feeTypes: prev.feeTypes.map(ft =>
                ft.slug === slug
                    ? {
                        ...ft,
                        degreeFees: ft.degreeFees.map(df =>
                            df.degreeName === degreeName ? { ...df, feePerMonth: newFee } : df
                        )
                    }
                    : ft
            )
        }));
    };

    const updateFlatFee = (slug, newFee) => {
        setFeeStructure(prev => ({
            ...prev,
            feeTypes: prev.feeTypes.map(ft =>
                ft.slug === slug ? { ...ft, flatFee: newFee } : ft
            )
        }));
    };

    const setBulkFee = (slug, fee) => {
        setFeeStructure(prev => ({
            ...prev,
            feeTypes: prev.feeTypes.map(ft => {
                if (ft.slug !== slug) return ft;
                if (ft.classFees) return { ...ft, classFees: ft.classFees.map(cf => ({ ...cf, feePerMonth: fee })) };
                if (ft.degreeFees) return { ...ft, degreeFees: ft.degreeFees.map(df => ({ ...df, feePerMonth: fee })) };
                if (ft.flatFee !== undefined) return { ...ft, flatFee: fee };
                return ft;
            })
        }));
        toast.info(`Bulk fee PKR ${fee.toLocaleString()} applied. Click Save to confirm.`);
    };

    // ── Render ───────────────────────────────────────────────────────────────
    if (loading) return <div className="flex items-center justify-center h-64"><Loader /></div>;

    if (error) return (
        <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl">
            <p className="text-lg font-semibold">{error}</p>
        </div>
    );

    const activeFeeType = feeStructure?.feeTypes?.find(ft => ft.slug === activeTab);
    const academicTypes = academicStructure?.classTypes || [];

    // Tabs: merge academic and fee slugs so tabs always match academic structure
    const tabSlugs = academicTypes.map(at => at.slug);

    return (
        <div className="space-y-6">
            {/* ── Hero Banner ── */}
            <div className={`relative rounded-2xl p-8 ${currentTheme?.heroBg || 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'} ${currentTheme?.shadow || 'shadow-lg'} mb-0 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <BanknotesIcon className={`h-8 w-8 ${currentTheme?.iconText || 'text-emerald-700'}`} />
                        <div>
                            <h1 className={`text-3xl sm:text-4xl font-extrabold ${currentTheme?.heroTitle || 'text-emerald-800'}`}>Fee Structure Panel</h1>
                            <p className={`text-sm mt-1 ${currentTheme?.heroSubtitle || 'text-emerald-700'}`}>Set monthly fee templates for each class, degree, and programme.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        id="fee-structure-save-btn"
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} shadow-lg transition disabled:opacity-60`}
                    >
                        <BookmarkSquareIcon className="h-5 w-5" />
                        {isSaving ? 'Saving…' : 'Save Configuration'}
                    </button>
                </div>
            </div>

            {/* ── Info Banner ── */}
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm ${currentTheme?.panelBg || 'bg-blue-50'} border ${currentTheme?.panelBorder || 'border-blue-200'} ${currentTheme?.subtitle || 'text-blue-800'}`}>
                <InformationCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p>
                    Configure the monthly fee for each class or degree. Click <strong>Sync from Academic Structure</strong> first if you haven't yet — it creates fee entries matching your current class list. Then set the amounts and click <strong>Save Configuration</strong>.
                </p>
            </div>

            {/* ── Toolbar: Tabs + Sync ── */}
            <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} rounded-xl p-4`}>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Tabs */}
                    {feeStructure?.feeTypes?.length > 0 ? (
                        feeStructure.feeTypes.map(ft => (
                            <button
                                key={ft.slug}
                                onClick={() => setActiveTab(ft.slug)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    activeTab === ft.slug
                                        ? `${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} shadow-md`
                                        : `${currentTheme?.mutedBg || 'bg-gray-100'} ${currentTheme?.mutedText || 'text-gray-600'} hover:bg-gray-200`
                                }`}
                            >
                                <BanknotesIcon className="h-4 w-4" />
                                {ft.name}
                            </button>
                        ))
                    ) : (
                        <span className={`text-sm italic ${currentTheme?.mutedText || 'text-gray-500'}`}>
                            No fee types yet. Click "Sync from Academic Structure" to get started.
                        </span>
                    )}

                    {/* Sync button */}
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        id="fee-structure-sync-btn"
                        className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${currentTheme?.btnSecondaryBg || 'bg-gray-100'} ${currentTheme?.btnSecondaryText || 'text-gray-700'} hover:bg-gray-200 disabled:opacity-60`}
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing…' : 'Sync from Academic Structure'}
                    </button>
                </div>
            </div>

            {/* ── Active Fee Type Editor ── */}
            {activeFeeType ? (
                <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} rounded-xl p-6`}>
                    {/* Section header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className={`text-xl font-bold ${currentTheme?.heroTitle || 'text-green-700'}`}>
                                {activeFeeType.name}
                            </h2>
                            <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'} mt-1`}>
                                Set the monthly fee (PKR) for each {activeFeeType.slug === 'BS' ? 'degree' : 'class'} below.
                            </p>
                        </div>
                        {/* Quick Bulk-Set */}
                        <BulkSetControl slug={activeFeeType.slug} onApply={setBulkFee} currentTheme={currentTheme} />
                    </div>

                    {/* ── Class / Almiya Layout ── */}
                    {activeFeeType.classFees && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {activeFeeType.classFees.map(cf => (
                                <div
                                    key={cf.classIdentifier}
                                    className={`rounded-xl p-4 border ${currentTheme?.cardBorder || 'border-green-100'} ${currentTheme?.panelBg || 'bg-green-50'} hover:shadow-md transition-shadow`}
                                >
                                    <div className={`font-bold text-sm mb-3 ${currentTheme?.heroTitle || 'text-green-800'} truncate`} title={cf.classIdentifier}>
                                        {cf.classIdentifier}
                                    </div>
                                    <label className={`block text-xs font-semibold mb-1.5 ${currentTheme?.subtitle || 'text-gray-600'}`}>
                                        Fee / Month (PKR)
                                    </label>
                                    <FeeInput
                                        initialValue={cf.feePerMonth}
                                        onCommit={val => updateClassFee(activeFeeType.slug, cf.classIdentifier, val)}
                                    />
                                    {cf.feePerMonth > 0 && (
                                        <p className="mt-1.5 text-xs text-green-700 font-medium">
                                            PKR {cf.feePerMonth.toLocaleString()}/mo
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── BS / Degree Layout ── */}
                    {activeFeeType.degreeFees && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeFeeType.degreeFees.map(df => (
                                <div
                                    key={df.degreeName}
                                    className={`rounded-xl p-4 border ${currentTheme?.cardBorder || 'border-green-100'} ${currentTheme?.panelBg || 'bg-green-50'} hover:shadow-md transition-shadow`}
                                >
                                    <div className={`font-bold text-sm mb-3 ${currentTheme?.heroTitle || 'text-green-800'} truncate`} title={df.degreeName}>
                                        🎓 {df.degreeName}
                                    </div>
                                    <label className={`block text-xs font-semibold mb-1.5 ${currentTheme?.subtitle || 'text-gray-600'}`}>
                                        Fee / Month (PKR)
                                    </label>
                                    <FeeInput
                                        initialValue={df.feePerMonth}
                                        onCommit={val => updateDegreeFee(activeFeeType.slug, df.degreeName, val)}
                                    />
                                    {df.feePerMonth > 0 && (
                                        <p className="mt-1.5 text-xs text-green-700 font-medium">
                                            PKR {df.feePerMonth.toLocaleString()}/mo
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Hifaz Flat Fee Layout ── */}
                    {activeFeeType.flatFee !== undefined && activeFeeType.flatFee !== null && !activeFeeType.classFees && !activeFeeType.degreeFees && (
                        <div className="max-w-sm">
                            <div className={`rounded-xl p-6 border ${currentTheme?.cardBorder || 'border-green-100'} ${currentTheme?.panelBg || 'bg-green-50'}`}>
                                <div className={`font-bold text-sm mb-3 ${currentTheme?.heroTitle || 'text-green-800'}`}>
                                    📖 All Hifaz-ul-Quran Students
                                </div>
                                <label className={`block text-xs font-semibold mb-1.5 ${currentTheme?.subtitle || 'text-gray-600'}`}>
                                    Monthly Fee (PKR) — applies to all Hifaz students
                                </label>
                                <FeeInput
                                    initialValue={activeFeeType.flatFee}
                                    onCommit={val => updateFlatFee(activeFeeType.slug, val)}
                                />
                                {activeFeeType.flatFee > 0 && (
                                    <p className="mt-2 text-xs text-green-700 font-medium">
                                        PKR {activeFeeType.flatFee.toLocaleString()}/mo for all Hifaz students
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty state for a type */}
                    {!activeFeeType.classFees?.length && !activeFeeType.degreeFees?.length && activeFeeType.flatFee === undefined && (
                        <div className="text-center py-12 text-gray-400">
                            <BanknotesIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No entries for this type. Sync from Academic Structure to populate.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Empty overall state */
                <div className={`${currentTheme?.cardBg || 'bg-white'} ${currentTheme?.shadow || 'shadow-md'} rounded-xl p-12 text-center`}>
                    <BanknotesIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className={`text-lg font-bold ${currentTheme?.heroTitle || 'text-gray-600'} mb-2`}>No Fee Structure Configured</h3>
                    <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-400'} mb-6`}>
                        Sync from your Academic Structure to auto-create fee template entries.
                    </p>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} shadow-lg transition`}
                    >
                        <ArrowPathIcon className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing…' : 'Sync from Academic Structure'}
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Bulk Set Control (outside main component to avoid re-mount) ──────────────
const BulkSetControl = memo(({ slug, onApply, currentTheme }) => {
    const [bulkVal, setBulkVal] = useState('');

    const handleApply = () => {
        const fee = parseInt(bulkVal, 10);
        if (isNaN(fee) || fee < 0) { toast.error('Please enter a valid amount.'); return; }
        onApply(slug, fee);
        setBulkVal('');
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold ${currentTheme?.subtitle || 'text-gray-500'} whitespace-nowrap`}>
                Quick set all:
            </span>
            <input
                type="number"
                min="0"
                value={bulkVal}
                onChange={e => setBulkVal(e.target.value)}
                placeholder="PKR amount"
                className="w-28 px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
                onClick={handleApply}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'} ${currentTheme?.btnPrimaryHover || 'hover:bg-green-700'} transition`}
            >
                <CheckCircleIcon className="h-4 w-4" />
                Apply to All
            </button>
        </div>
    );
});

export default FeeStructurePanel;
