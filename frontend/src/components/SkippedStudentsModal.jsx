import React from 'react';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';

const SkippedStudentsModal = ({ isOpen, onClose, skippedList = [] }) => {
  const { currentTheme } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`p-6 ${currentTheme?.panelBg || 'bg-white'} rounded-t-lg`}>
        <div className="flex items-start justify-between">
          <h3 className={`text-lg font-semibold ${currentTheme?.subtitle || 'text-gray-800'}`}>Skipped Students</h3>
          <button onClick={onClose} className={`text-sm ${currentTheme?.linkText || 'text-green-600'}`}>Close</button>
        </div>
        <p className="text-sm text-gray-600 mt-2">The following student(s) already had fee records for the selected month/year and were skipped:</p>

        <ul className="mt-4 max-h-64 overflow-auto divide-y divide-gray-100">
          {skippedList.length === 0 ? (
            <li className="py-3 text-sm text-gray-500">No skipped students.</li>
          ) : (
            skippedList.map((s, idx) => (
              <li key={idx} className="py-3 text-sm">
                <div className="font-medium text-gray-800">{s.name || s.studentId || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{s.month} {s.year}</div>
              </li>
            ))
          )}
        </ul>

        <div className="mt-6 text-right">
          <button onClick={onClose} className={`px-4 py-2 rounded-md ${currentTheme?.btnPrimaryBg || 'bg-green-600'} ${currentTheme?.btnPrimaryText || 'text-white'}`}>OK</button>
        </div>
      </div>
    </Modal>
  );
};

export default SkippedStudentsModal;
