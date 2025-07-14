import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import FeeForm from './components/FeeForm';
import FeeList from './components/FeeList';



const App = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 className="text-3xl font-bold text-blue-600">Institute Admin Dashboard</h1>

      {/* Navigation */}
      <nav>
        <Link to="/students" style={{ marginRight: '15px' }}>Students</Link>
        <Link to="/fees">Fees</Link>
      </nav>
      <hr />

      {/* Routing */}
      <Routes>
        <Route
          path="/students"
          element={
            <div>
              <StudentList />
            </div>
          }
        />
        <Route path="/fees" element={<FeeList />} />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  );
};

export default App;
