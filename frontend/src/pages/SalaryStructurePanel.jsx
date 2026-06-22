// src/pages/SalaryStructurePanel.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import {
  BanknotesIcon, BookmarkSquareIcon, ArrowPathIcon, CalculatorIcon,
  UserGroupIcon, PlusCircleIcon, TrashIcon, XMarkIcon, CheckCircleIcon,
  InformationCircleIcon, AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';

// ─── Default staff types ───────────────────────────────────────────────────────
const DEFAULT_STAFF_TYPES = ['Teacher', 'Admin', 'Accountant', 'Cook', 'Cleaner'];

const buildDefaultRule = (staffType) => ({
  staffType,
  baseSalary: 0,
  incrementEnabled: false,
  incrementMode: 'percentage',
  percentageIncrement: 0,
  fixedIncrement: 0,
  incrementFrequencyYears: 1,
  incrementFrequencyUnit: 'years',
  serviceMilestones: [],
});

// ─── Uncontrolled number input (no focus loss on re-render) ──────────────────
const NumInput = memo(({ value, onChange, min = 0, className = '' }) => {
  const [local, setLocal] = useState(String(value ?? 0));
  useEffect(() => setLocal(String(value ?? 0)), [value]);
  const commit = () => {
    const v = parseFloat(local);
    const safe = isNaN(v) || v < min ? min : v;
    setLocal(String(safe));
    if (safe !== value) onChange(safe);
  };
  return (
    <input
      type="number"
      min={min}
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit}
      className={className}
    />
  );
});

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, theme }) => (
  <label className="flex items-center cursor-pointer gap-3">
    <div className="relative" onClick={() => onChange(!checked)}>
      <div className={`block w-12 h-7 rounded-full transition-colors duration-200 ${checked ? theme?.btnPrimaryBg || 'bg-green-500' : 'bg-gray-300'}`} />
      <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <span className={`text-sm font-semibold ${theme?.subtitle || 'text-gray-700'}`}>
      {checked ? 'Enabled' : 'Disabled'}
    </span>
  </label>
);

// ─── Staff type accent colors (fixed, not theme-dependent for visual variety) ─
const TYPE_COLORS = {
  Teacher:    { pill: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-500'   },
  Admin:      { pill: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  Accountant: { pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Cook:       { pill: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  Cleaner:    { pill: 'bg-rose-100 text-rose-700 border-rose-200',    dot: 'bg-rose-500'   },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SalaryStructurePanel = () => {
  const { currentTheme: t } = useTheme();
  const [rules, setRules] = useState([]);
  const [activeTab, setActiveTab] = useState(DEFAULT_STAFF_TYPES[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/salary-structure');
      const incoming = data?.staffTypeRules || [];
      const merged = DEFAULT_STAFF_TYPES.map(type => {
        const found = incoming.find(r => r.staffType === type);
        return found ? { ...buildDefaultRule(type), ...found } : buildDefaultRule(type);
      });
      setRules(merged);
    } catch (err) {
      toast.error('Failed to load salary structure.');
      setRules(DEFAULT_STAFF_TYPES.map(buildDefaultRule));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateRule = (staffType, field, value) => {
    setRules(prev => prev.map(r => r.staffType === staffType ? { ...r, [field]: value } : r));
  };

  const addMilestone = (staffType) => {
    setRules(prev => prev.map(r =>
      r.staffType === staffType
        ? { ...r, serviceMilestones: [...(r.serviceMilestones || []), { yearsOfService: 1, incrementAmount: 0 }] }
        : r
    ));
  };

  const updateMilestone = (staffType, idx, field, value) => {
    setRules(prev => prev.map(r => {
      if (r.staffType !== staffType) return r;
      const ms = [...(r.serviceMilestones || [])];
      ms[idx] = { ...ms[idx], [field]: Number(value) };
      return { ...r, serviceMilestones: ms };
    }));
  };

  const removeMilestone = (staffType, idx) => {
    setRules(prev => prev.map(r =>
      r.staffType === staffType
        ? { ...r, serviceMilestones: (r.serviceMilestones || []).filter((_, i) => i !== idx) }
        : r
    ));
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/salary-structure', { staffTypeRules: rules });
      toast.success('Salary structure saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  // ── Preview ────────────────────────────────────────────────────────────────
  const handlePreviewOpen = async () => {
    setShowPreview(true);
    setPreviewLoading(true);
    try {
      const { data } = await api.get('/salary-structure/preview');
      setPreviewData(data?.staffPreview || []);
    } catch (err) {
      toast.error('Failed to load preview.');
      setPreviewData([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApply = async () => {
    if (!window.confirm('Apply this structure to ALL staff members? Individual overrides remain possible afterwards.')) return;
    try {
      setApplying(true);
      const { data } = await api.post('/salary-structure/apply', {});
      toast.success(data.message || 'Applied successfully!');
      setShowPreview(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  const activeRule = rules.find(r => r.staffType === activeTab) || buildDefaultRule(activeTab);
  const typeColor = TYPE_COLORS[activeTab] || { pill: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };

  // ── Common classes ─────────────────────────────────────────────────────────
  const inputCls = `w-full px-3 py-2 border ${t?.inputBorder || 'border-gray-300'} rounded-lg text-sm outline-none transition ${t?.inputRing || 'focus:ring-2 focus:ring-blue-500'} ${t?.inputBg || 'bg-white'} ${t?.inputText || 'text-gray-900'}`;

  if (loading) return (
    <div className={`${t?.mainBg || 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
      <Loader />
    </div>
  );

  return (
    <div className={`${t?.mainBg || 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-6xl mx-auto p-6 space-y-5">

        {/* ── Hero Banner ── */}
        <div className={`relative rounded-2xl p-7 ${t?.heroBg || 'bg-gradient-to-br from-emerald-200 via-emerald-50 to-emerald-500'} shadow-lg overflow-hidden`}>
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white opacity-5" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white opacity-5" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white bg-opacity-20`}>
                <BanknotesIcon className={`h-8 w-8 ${t?.heroIcon || 'text-emerald-700'}`} />
              </div>
              <div>
                <h1 className={`text-3xl sm:text-4xl font-extrabold ${t?.heroTitle || 'text-green-800'}`}>
                  Salary Structure
                </h1>
                <p className={`text-sm mt-1 ${t?.heroSubtitle || 'text-gray-700'}`}>
                  Define base salary &amp; increment rules per staff type
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition disabled:opacity-60 ${t?.btnPrimaryBg || 'bg-emerald-600'} ${t?.btnPrimaryText || 'text-white'} ${t?.btnPrimaryHover || 'hover:bg-emerald-700'}`}
            >
              {saving ? <ArrowPathIcon className="animate-spin w-5 h-5" /> : <BookmarkSquareIcon className="w-5 h-5" />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* ── Info Banner ── */}
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm ${t?.alertInfoBg || 'bg-blue-50'} border ${t?.alertInfoBorder || 'border-blue-200'} ${t?.alertInfoText || 'text-blue-800'}`}>
          <InformationCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0 shrink-0" />
          <p>
            Set a <strong>base salary</strong> for each staff type and optionally enable <strong>increments</strong>
            (percentage, fixed, or service-time milestones). Click <strong>Preview &amp; Apply</strong> to push these
            settings to all matching staff. Individual salary overrides remain possible at any time.
          </p>
        </div>

        {/* ── Staff Type Tab Bar ── */}
        <div className={`${t?.cardBg || 'bg-white'} ${t?.cardShadow || 'shadow-md'} rounded-xl p-4`}>
          <div className="flex flex-wrap items-center gap-2">
            {DEFAULT_STAFF_TYPES.map(type => {
              const col = TYPE_COLORS[type];
              const isActive = activeTab === type;
              return (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border transition-all duration-200 ${
                    isActive
                      ? `${t?.btnPrimaryBg || 'bg-emerald-600'} ${t?.btnPrimaryText || 'text-white'} border-transparent shadow-md`
                      : `${col.pill} border hover:opacity-90`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-white' : col.dot}`} />
                  <UserGroupIcon className="w-4 h-4" />
                  {type}
                </button>
              );
            })}

            <button
              onClick={handlePreviewOpen}
              className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border transition ${t?.btnSecondaryBg || 'bg-white'} ${t?.btnSecondaryText || 'text-emerald-700'} ${t?.btnSecondaryBorder || 'border-emerald-200'} ${t?.btnSecondaryHover || 'hover:bg-emerald-50'}`}
            >
              <CalculatorIcon className="w-4 h-4" />
              Preview &amp; Apply
            </button>
          </div>
        </div>

        {/* ── Active Staff Type Card ── */}
        <div className={`${t?.cardBg || 'bg-white'} ${t?.cardShadow || 'shadow-md'} rounded-2xl overflow-hidden`}>

          {/* Card Header */}
          <div className={`px-6 py-4 flex items-center gap-3 border-b ${t?.cardBorder || 'border-gray-200'}`}>
            <div className={`p-2.5 rounded-xl border ${typeColor.pill}`}>
              <UserGroupIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${t?.headerText || 'text-green-800'}`}>
                {activeTab} — Salary Settings
              </h2>
              <p className={`text-xs ${t?.mutedText || 'text-gray-600'}`}>
                Configure the standard salary and increment policy for all {activeTab}s
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Base Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${t?.subtitle || 'text-gray-600'}`}>
                  Base Salary (PKR / month)
                </label>
                <NumInput
                  value={activeRule.baseSalary}
                  onChange={val => updateRule(activeTab, 'baseSalary', val)}
                  className={inputCls}
                />
                {activeRule.baseSalary > 0 && (
                  <p className={`mt-1.5 text-xs font-semibold ${t?.kpiGood || 'text-emerald-600'}`}>
                    PKR {activeRule.baseSalary.toLocaleString()} / month
                  </p>
                )}
              </div>
            </div>

            {/* Increment Section */}
            <div className={`rounded-xl border ${t?.cardBorder || 'border-gray-200'} overflow-hidden`}>

              {/* Increment Header + Toggle */}
              <div className={`px-5 py-3.5 flex items-center justify-between ${t?.tableStripedBg || 'bg-gray-50'} border-b ${t?.cardBorder || 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className={`w-5 h-5 ${t?.btnPrimaryBg?.replace('bg-', 'text-') || 'text-emerald-600'}`} />
                  <span className={`font-bold text-sm ${t?.subtitle || 'text-gray-700'}`}>Increment Policy</span>
                </div>
                <Toggle
                  checked={activeRule.incrementEnabled}
                  onChange={val => updateRule(activeTab, 'incrementEnabled', val)}
                  theme={t}
                />
              </div>

              {activeRule.incrementEnabled && (
                <div className="p-5 space-y-5">

                  {/* Mode Selector */}
                  <div>
                    <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${t?.subtitle || 'text-gray-600'}`}>
                      Increment Mode
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'percentage', label: '% Percentage Based' },
                        { value: 'fixed', label: 'PKR Fixed Amount' },
                        { value: 'service_time', label: '📅 Service Milestones' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateRule(activeTab, 'incrementMode', opt.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            activeRule.incrementMode === opt.value
                              ? `${t?.btnPrimaryBg || 'bg-emerald-600'} ${t?.btnPrimaryText || 'text-white'} border-transparent shadow`
                              : `${t?.cardBg || 'bg-white'} ${t?.subtitle || 'text-gray-600'} ${t?.cardBorder || 'border-gray-200'} hover:opacity-80`
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Percentage Mode ── */}
                  {activeRule.incrementMode === 'percentage' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${t?.subtitle || 'text-gray-600'}`}>
                          Increment Percentage (%)
                        </label>
                        <NumInput
                          value={activeRule.percentageIncrement}
                          onChange={val => updateRule(activeTab, 'percentageIncrement', val)}
                          className={inputCls}
                        />
                        {activeRule.percentageIncrement > 0 && activeRule.baseSalary > 0 && (
                          <p className={`mt-1.5 text-xs font-semibold ${t?.kpiGood || 'text-emerald-600'}`}>
                            = PKR {Math.round(activeRule.baseSalary * activeRule.percentageIncrement / 100).toLocaleString()} on base
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${t?.subtitle || 'text-gray-600'}`}>
                          Apply Every
                        </label>
                        <NumInput
                          value={activeRule.incrementFrequencyYears}
                          min={1}
                          onChange={val => updateRule(activeTab, 'incrementFrequencyYears', val)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${t?.subtitle || 'text-gray-600'}`}>
                          Frequency Unit
                        </label>
                        <div className="flex gap-2 mt-0.5">
                          {['months', 'years'].map(unit => (
                            <button
                              key={unit}
                              onClick={() => updateRule(activeTab, 'incrementFrequencyUnit', unit)}
                              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                                (activeRule.incrementFrequencyUnit || 'years') === unit
                                  ? `${t?.btnPrimaryBg || 'bg-emerald-600'} ${t?.btnPrimaryText || 'text-white'} border-transparent shadow`
                                  : `${t?.cardBg || 'bg-white'} ${t?.subtitle || 'text-gray-600'} ${t?.cardBorder || 'border-gray-200'} hover:opacity-80`
                              }`}
                            >
                              {unit.charAt(0).toUpperCase() + unit.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Fixed Mode ── */}
                  {activeRule.incrementMode === 'fixed' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${t?.subtitle || 'text-gray-600'}`}>
                          Fixed Increment (PKR)
                        </label>
                        <NumInput
                          value={activeRule.fixedIncrement}
                          onChange={val => updateRule(activeTab, 'fixedIncrement', val)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${t?.subtitle || 'text-gray-600'}`}>
                          Apply Every
                        </label>
                        <NumInput
                          value={activeRule.incrementFrequencyYears}
                          min={1}
                          onChange={val => updateRule(activeTab, 'incrementFrequencyYears', val)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${t?.subtitle || 'text-gray-600'}`}>
                          Frequency Unit
                        </label>
                        <div className="flex gap-2 mt-0.5">
                          {['months', 'years'].map(unit => (
                            <button
                              key={unit}
                              onClick={() => updateRule(activeTab, 'incrementFrequencyUnit', unit)}
                              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                                (activeRule.incrementFrequencyUnit || 'years') === unit
                                  ? `${t?.btnPrimaryBg || 'bg-emerald-600'} ${t?.btnPrimaryText || 'text-white'} border-transparent shadow`
                                  : `${t?.cardBg || 'bg-white'} ${t?.subtitle || 'text-gray-600'} ${t?.cardBorder || 'border-gray-200'} hover:opacity-80`
                              }`}
                            >
                              {unit.charAt(0).toUpperCase() + unit.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Service Milestones Mode ── */}
                  {activeRule.incrementMode === 'service_time' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className={`text-xs font-bold uppercase tracking-wide ${t?.subtitle || 'text-gray-600'}`}>
                          Service Milestones
                        </label>
                        <button
                          onClick={() => addMilestone(activeTab)}
                          className={`flex items-center gap-1 text-sm font-semibold transition ${t?.btnGhostText || 'text-emerald-700'} ${t?.btnGhostHover || 'hover:bg-emerald-50'} px-3 py-1.5 rounded-lg`}
                        >
                          <PlusCircleIcon className="w-4 h-4" /> Add Milestone
                        </button>
                      </div>

                      {(activeRule.serviceMilestones || []).length === 0 ? (
                        <div className={`text-sm italic py-6 text-center rounded-xl border ${t?.cardBorder || 'border-gray-200'} ${t?.mutedText || 'text-gray-500'} ${t?.tableStripedBg || 'bg-gray-50'}`}>
                          No milestones yet. Click "Add Milestone" to get started.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeRule.serviceMilestones.map((m, idx) => (
                            <div key={idx} className={`flex items-end gap-4 p-4 rounded-xl border ${t?.cardBorder || 'border-gray-200'} ${t?.tableStripedBg || 'bg-gray-50'}`}>
                              <div className="flex-1">
                                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${t?.mutedText || 'text-gray-500'}`}>
                                  After (Years of Service)
                                </label>
                                <NumInput
                                  value={m.yearsOfService}
                                  min={0}
                                  onChange={val => updateMilestone(activeTab, idx, 'yearsOfService', val)}
                                  className={inputCls}
                                />
                              </div>
                              <div className="flex-1">
                                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${t?.mutedText || 'text-gray-500'}`}>
                                  Increment Amount (PKR)
                                </label>
                                <NumInput
                                  value={m.incrementAmount}
                                  min={0}
                                  onChange={val => updateMilestone(activeTab, idx, 'incrementAmount', val)}
                                  className={inputCls}
                                />
                              </div>
                              <button
                                onClick={() => removeMilestone(activeTab, idx)}
                                className="mb-0.5 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary pill */}
                  <div className={`rounded-xl p-4 border ${t?.alertInfoBorder || 'border-blue-200'} ${t?.alertInfoBg || 'bg-blue-50'} ${t?.alertInfoText || 'text-blue-800'} text-sm`}>
                    <strong>Summary:</strong>{' '}
                    {activeRule.incrementMode === 'percentage' && (
                      <>Every <strong>{activeRule.incrementFrequencyYears} {activeRule.incrementFrequencyUnit || 'years'}</strong>, salary increases by <strong>{activeRule.percentageIncrement}%</strong>
                      {activeRule.baseSalary > 0 && <> (≈ PKR {Math.round(activeRule.baseSalary * activeRule.percentageIncrement / 100).toLocaleString()} on current base)</>}.</>
                    )}
                    {activeRule.incrementMode === 'fixed' && (
                      <>Every <strong>{activeRule.incrementFrequencyYears} {activeRule.incrementFrequencyUnit || 'years'}</strong>, a fixed <strong>PKR {activeRule.fixedIncrement.toLocaleString()}</strong> is added to salary.</>
                    )}
                    {activeRule.incrementMode === 'service_time' && (
                      <><strong>{(activeRule.serviceMilestones || []).length} milestone(s)</strong> defined. Increments are applied when staff reach the specified years of service.</>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── All Staff Types Overview ── */}
        <div className={`${t?.cardBg || 'bg-white'} ${t?.cardShadow || 'shadow-md'} rounded-2xl p-6`}>
          <h3 className={`text-base font-bold mb-4 ${t?.headerText || 'text-green-800'}`}>
            All Staff Types — Quick Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {rules.map(r => {
              const col = TYPE_COLORS[r.staffType] || { pill: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };
              const isActive = activeTab === r.staffType;
              return (
                <button
                  key={r.staffType}
                  onClick={() => setActiveTab(r.staffType)}
                  className={`rounded-xl p-4 border text-left transition-all hover:shadow-md ${
                    isActive
                      ? `${t?.btnPrimaryBg || 'bg-emerald-600'} border-transparent shadow-md`
                      : `${t?.cardBg || 'bg-white'} ${t?.cardBorder || 'border-gray-200'} hover:border-opacity-80`
                  }`}
                >
                  <div className={`inline-flex p-2 rounded-lg mb-2 border ${isActive ? 'bg-white bg-opacity-20 border-white border-opacity-30' : col.pill}`}>
                    <UserGroupIcon className="w-4 h-4" />
                  </div>
                  <p className={`text-sm font-bold ${isActive ? 'text-white' : t?.headerText || 'text-green-800'}`}>{r.staffType}</p>
                  <p className={`text-xs mt-1 ${isActive ? 'text-white text-opacity-80' : t?.mutedText || 'text-gray-500'}`}>
                    {r.baseSalary > 0 ? `PKR ${r.baseSalary.toLocaleString()}/mo` : 'Not configured'}
                  </p>
                  {r.incrementEnabled && (
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-green-100 text-green-700'}`}>
                      {r.incrementMode === 'percentage' ? `+${r.percentageIncrement}%` : r.incrementMode === 'fixed' ? `+PKR ${r.fixedIncrement}` : 'Milestones'}
                      {r.incrementMode !== 'service_time' && ` / ${r.incrementFrequencyYears} ${r.incrementFrequencyUnit || 'yrs'}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Preview Modal ── */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${t?.modalBg || 'bg-white'} rounded-2xl ${t?.modalShadow || 'shadow-2xl'} w-full max-w-5xl max-h-[90vh] flex flex-col`}>
            <div className={`p-6 border-b ${t?.cardBorder || 'border-gray-200'} flex justify-between items-center ${t?.tableStripedBg || 'bg-gray-50'} rounded-t-2xl`}>
              <div>
                <h2 className={`text-2xl font-bold ${t?.headerText || 'text-green-800'}`}>Preview Structure Changes</h2>
                <p className={`text-sm ${t?.mutedText || 'text-gray-500'} mt-1`}>Review calculated salaries before applying to staff records.</p>
              </div>
              <button onClick={() => setShowPreview(false)} className={`${t?.modalClose || 'text-gray-400 hover:text-gray-600'} transition`}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {previewLoading ? (
                <div className="flex justify-center py-12"><Loader /></div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${t?.theadBg || 'bg-emerald-600'}`}>
                    <tr>
                      {['Staff Member', 'Type', 'Service (Yrs)', 'Current Salary', 'Calc. Increment', 'New Salary', 'Status'].map(h => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${t?.theadText || 'text-white'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${t?.tbodyBg || 'bg-white'} divide-y ${t?.cardBorder || 'divide-gray-100'}`}>
                    {(previewData || []).map((staff, idx) => (
                      <tr key={idx} className={staff.willChange ? (t?.alertInfoBg || 'bg-blue-50') : ''}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className={`font-semibold text-sm ${t?.text || 'text-gray-900'}`}>{staff.name}</div>
                          <div className={`text-xs ${t?.mutedText || 'text-gray-500'}`}>{staff.cnic}</div>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${t?.text || 'text-gray-700'}`}>{staff.staffType}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${t?.text || 'text-gray-700'}`}>{staff.yearsOfService ?? '—'}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${t?.text || 'text-gray-700'}`}>PKR {(staff.currentSalary || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">+ PKR {(staff.totalIncrement || 0).toLocaleString()}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${t?.text || 'text-gray-900'}`}>PKR {(staff.effectiveSalary || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {staff.willChange
                            ? <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${t?.badgeWarningBg || 'bg-yellow-100'} ${t?.badgeWarningText || 'text-yellow-800'}`}>Update Pending</span>
                            : <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${t?.badgeSuccessBg || 'bg-green-100'} ${t?.badgeSuccessText || 'text-green-800'}`}>Up to Date</span>
                          }
                        </td>
                      </tr>
                    ))}
                    {(!previewData || previewData.length === 0) && (
                      <tr><td colSpan="7" className={`px-4 py-10 text-center italic ${t?.mutedText || 'text-gray-500'}`}>No staff records found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className={`p-5 border-t ${t?.cardBorder || 'border-gray-200'} ${t?.tableStripedBg || 'bg-gray-50'} rounded-b-2xl flex justify-end gap-3`}>
              <button
                onClick={() => setShowPreview(false)}
                className={`px-5 py-2.5 border ${t?.cardBorder || 'border-gray-300'} ${t?.subtitle || 'text-gray-700'} rounded-xl ${t?.tableHover || 'hover:bg-gray-100'} transition font-semibold`}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || (previewData || []).filter(d => d.willChange).length === 0}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition disabled:opacity-50 ${t?.btnPrimaryBg || 'bg-emerald-600'} ${t?.btnPrimaryText || 'text-white'} ${t?.btnPrimaryHover || 'hover:bg-emerald-700'}`}
              >
                {applying ? <ArrowPathIcon className="animate-spin w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                Apply to Staff Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryStructurePanel;
