import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import { UserContext } from '../App';
import { useTheme } from '../context/ThemeContext';
import Loader from './Loader';
import Message from './Message';
import { toast } from 'react-toastify';

const RegisteredSubjects = ({ inline = false }) => {
  const { currentUser } = useContext(UserContext);
  const { currentTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [structure, setStructure] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const getAcademicConfig = (slug) => structure?.find(s => s.slug === slug);

  const computeSubjectsForStudent = (studentData, academicStructure) => {
    if (!studentData || !academicStructure) return [];
    const cls = studentData.class; // 'Class' | 'BS' | 'Almiya' | 'Hifaz'

    const findConfig = (slug) => academicStructure?.find(s => s.slug === slug);

    if (cls === 'Class' || cls === 'Almiya') {
      const config = findConfig(cls);
      if (!config) return [];
      // try match by classNumber then by classIdentifier
      const classObj = config.classConfig?.find(c => String(c.classNumber) === String(studentData.classNumber) || c.classIdentifier === studentData.classIdentifier);
      return classObj?.subjects || [];
    }

    if (cls === 'BS') {
      const config = findConfig('BS');
      if (!config) return [];
      const degree = config.degreeConfig?.find(d => d.degreeName === studentData.degreeName);
      if (!degree) return [];
      const sem = studentData.semester ? String(studentData.semester) : null;
      // subjectsBySemester might be an object mapping semester -> array
      const bySem = degree.subjectsBySemester || degree.subjectsBySemesterMap || {};
      return (bySem && sem && (bySem[sem] || [])) || degree.subjects || [];
    }

    if (cls === 'Hifaz') {
      const config = findConfig('Hifaz');
      if (config) {
        const c = config.classConfig?.[0];
        if (c?.subjects && c.subjects.length) return c.subjects;
        if (config.subjects && config.subjects.length) return config.subjects;
      }
      return ['Hifaz / Qur\'an Memorization'];
    }

    return [];
  };

  useEffect(() => {
    const doFetch = async () => {
      setLoading(true);
      setError('');
      try {
        if (!currentUser || !currentUser.profileId) {
          throw new Error('User profile not found. Please login again.');
        }
        const [structRes, studentRes] = await Promise.all([
          api.get('/academic-structure'),
          api.get(`/students/${currentUser.profileId}`)
        ]);

        const classTypes = structRes.data.classTypes || structRes.data || [];
        setStructure(classTypes);
        setStudent(studentRes.data);

        const subs = computeSubjectsForStudent(studentRes.data, classTypes);
        setSubjects(subs || []);
      } catch (err) {
        console.error('Failed to fetch registered subjects:', err);
        setError('Failed to load your registered subjects.');
        toast.error('Failed to load registered subjects.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.profileId) doFetch();
  } , [currentUser]);

  if (loading) return inline ? <div className="p-4"><Loader /></div> : <Loader />;
  if (error) return inline ? <Message variant="danger">{error}</Message> : <Message variant="danger">{error}</Message>;

  const classLabel = student?.class ? `${student.class}${student.classNumber ? ` ${student.classNumber}` : student.semester ? ` ${student.semester}` : ''}` : '';

  const content = (
    <div className={`section-card ${currentTheme?.cardBg || ''}`}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'}`}>Student</div>
          <div className={`${currentTheme?.title || currentTheme?.text || ''} text-lg font-semibold`}>{student?.name || '—'}</div>
          <div className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'}`}>{classLabel}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`${currentTheme?.badgeBg || ''} ${currentTheme?.badgeText || ''} ${currentTheme?.badgeBorder || ''} text-sm font-medium px-3 py-1 rounded-full`}>
            {student?.class || '—'}
          </div>
          <div className={`text-xs px-2 py-1 rounded-md ${currentTheme?.mutedText || 'text-gray-500'}`}>Registered Class</div>
        </div>
      </div>

      {subjects && subjects.length > 0 ? (
        <ul className="subject-grid">
          {subjects.map((s, idx) => (
            <li
              key={idx}
              title={s}
              className={`subject-item transition transform hover:-translate-y-0.5 cursor-default ${currentTheme?.panelBg || ''} ${currentTheme?.panelBorder || ''} ${currentTheme?.panelShadow || ''} ${currentTheme?.text || ''}`}
            >
              <div className="w-full">
                <div className="text-base">{s}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`text-sm ${currentTheme?.mutedText || 'text-gray-500'}`}>No registered subjects found for your class.</p>
      )}
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className={`min-h-screen ${currentTheme?.pageBg || 'bg-gradient-to-b from-emerald-50 via-white to-emerald-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`page-hero ${currentTheme?.heroBg || ''} ${currentTheme?.dashHeroBorder || ''}`}>
          <h2 className={`title ${currentTheme?.heroTitle || currentTheme?.dashHeroTitle || ''}`}>Registered Subjects</h2>
          <p className={`subtitle ${currentTheme?.heroSubtitle || currentTheme?.dashHeroSubtitle || ''}`}>Subjects for the class you are registered in.</p>
        </div>

        <div className="section-card-wrapper">
          <div className={`${currentTheme?.cardBg || ''} ${currentTheme?.cardBorder || ''} ${currentTheme?.cardShadow || ''} rounded-xl p-0`}>{content}</div>
        </div>
      </div>
    </div>
  );
};

export default RegisteredSubjects;
