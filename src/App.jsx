import { useState, useEffect } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import EmployeeDetails from './pages/EmployeeDetails.jsx';
import EmployeeForm from './pages/EmployeeForm.jsx';
import Departments from './pages/Departments.jsx';
import Designations from './pages/Designations.jsx';
import {
  getEmployees,
  getDepartments,
  getDesignations,
  API_BASE_URL,
} from './services/api.js';

function App() {
  const [employeeList, setEmployeeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Load all central data when the app mounts or refreshes
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
      setErrorMsg(
        err.message ||
          `Cannot reach JSON Server at ${API_BASE_URL}. Start it with "npm run api".`
      );
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
        <h1>
          People<span>Desk</span>
        </h1>
        <nav>
          <NavLink to="/dashboard">
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/employees">
            <span>👥</span> Employees
          </NavLink>
          <NavLink to="/departments">
            <span>🏢</span> Departments
          </NavLink>
          <NavLink to="/designations">
            <span>🏷️</span> Designations
          </NavLink>
        </nav>
      </aside>

      <main className="main">
        {errorMsg && (
          <div className="banner danger">
            <span>⚠</span>
            <div style={{ flex: 1 }}>{errorMsg}</div>
            <button
              type="button"
              className="primary"
              onClick={() => {
                setLoading(true);
                loadAllData();
              }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {loading ? (
          <div className="panel loading-panel">
            <p>Loading workforce data from JSON Server...</p>
          </div>
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
            <Route
              path="*"
              element={
                <div className="panel error-panel">
                  <h3>404 &middot; Page Not Found</h3>
                  <p>The page you requested does not exist or has been moved.</p>
                  <NavLink to="/dashboard" className="button primary">
                    Return to Dashboard
                  </NavLink>
                </div>
              }
            />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default App;
