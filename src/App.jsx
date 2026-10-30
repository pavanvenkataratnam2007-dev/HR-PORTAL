import { useState, useEffect } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import EmployeeDetails from './pages/EmployeeDetails.jsx';
import EmployeeForm from './pages/EmployeeForm.jsx';
import Departments from './pages/Departments.jsx';
import Designations from './pages/Designations.jsx';
import { getEmployees, getDepartments, getDesignations } from './services/api.js';

function App() {
  const [employeeList, setEmployeeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Load all data when the app starts
  async function loadAllData() {
    try {
      const [emps, depts, desigs] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getDesignations(),
      ]);
      setEmployeeList(emps);
      setDepartmentList(depts);
      setDesignationList(desigs);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Cannot reach the API. Start it with "npm run api" (port 3001).');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div className="shell">
      <aside className="side">
        <h1>People<span>Desk</span></h1>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/employees">Employees</NavLink>
          <NavLink to="/departments">Departments</NavLink>
          <NavLink to="/designations">Designations</NavLink>
        </nav>
      </aside>

      <main className="main">
        {errorMsg && <div className="banner">{errorMsg}</div>}

        {loading ? (
          <p>Loading data…</p>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  employeeList={employeeList}
                  departmentList={departmentList}
                />
              }
            />
            <Route
              path="/employees"
              element={
                <Employees
                  employeeList={employeeList}
                  departmentList={departmentList}
                  designationList={designationList}
                  onRefresh={loadAllData}
                />
              }
            />
            <Route
              path="/employees/new"
              element={
                <EmployeeForm
                  employeeList={employeeList}
                  departmentList={departmentList}
                  designationList={designationList}
                  onRefresh={loadAllData}
                />
              }
            />
            <Route
              path="/employees/:id"
              element={
                <EmployeeDetails
                  employeeList={employeeList}
                  departmentList={departmentList}
                />
              }
            />
            <Route
              path="/employees/:id/edit"
              element={
                <EmployeeForm
                  employeeList={employeeList}
                  departmentList={departmentList}
                  designationList={designationList}
                  onRefresh={loadAllData}
                />
              }
            />
            <Route
              path="/departments"
              element={
                <Departments
                  departmentList={departmentList}
                  employeeList={employeeList}
                  onRefresh={loadAllData}
                />
              }
            />
            <Route
              path="/designations"
              element={
                <Designations
                  designationList={designationList}
                  employeeList={employeeList}
                  onRefresh={loadAllData}
                />
              }
            />
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default App;
