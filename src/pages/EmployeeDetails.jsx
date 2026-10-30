import { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { getEmployee, getDepartments } from '../services/api.js';

function formatMoney(amount) {
  return '₹' + Math.round(amount || 0).toLocaleString('en-IN');
}

function EmployeeDetails({ employeeList = [], departmentList = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState(departmentList);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchDetails() {
      setLoading(true);
      setError('');
      try {
        // Fetch specific employee using REST GET /employees/:id
        const empData = await getEmployee(id);
        if (isMounted) {
          setEmployee(empData);
        }

        // Ensure departments are available for lookup
        if (departmentList.length === 0) {
          const depts = await getDepartments();
          if (isMounted) {
            setDepartments(depts);
          }
        } else {
          setDepartments(departmentList);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Employee could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [id, departmentList]);

  if (loading) {
    return (
      <div className="panel loading-panel">
        <p>Loading employee details...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="panel error-panel">
        <h3>Employee Not Found</h3>
        <p>{error || `No employee record found with ID #${id}.`}</p>
        <button type="button" className="primary" onClick={() => navigate('/employees')}>
          &larr; Back to Employees
        </button>
      </div>
    );
  }

  // Find department name
  const currentDept = departments.find(
    (d) => Number(d.id) === Number(employee.departmentId)
  );
  const deptName = currentDept ? currentDept.name : '—';
  const statusClass = (employee.status || '').replace(/\s+/g, '');

  return (
    <>
      <div className="head">
        <div>
          <h2>{employee.name}</h2>
          <span className={`pill ${statusClass}`}>{employee.status}</span>
        </div>
        <div className="acts">
          <button type="button" onClick={() => navigate('/employees')}>
            &larr; Back
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => navigate(`/employees/${employee.id}/edit`)}
          >
            Edit Employee
          </button>
        </div>
      </div>

      <dl className="panel details">
        <div>
          <dt>Employee Code</dt>
          <dd><b>{employee.employeeCode}</b></dd>
        </div>
        <div>
          <dt>Email Address</dt>
          <dd>
            <a href={`mailto:${employee.email}`}>{employee.email}</a>
          </dd>
        </div>
        <div>
          <dt>Phone Number</dt>
          <dd>{employee.phone || '—'}</dd>
        </div>
        <div>
          <dt>Department</dt>
          <dd>{deptName}</dd>
        </div>
        <div>
          <dt>Designation</dt>
          <dd>{employee.designation}</dd>
        </div>
        <div>
          <dt>Joining Date</dt>
          <dd>{employee.joiningDate}</dd>
        </div>
        <div>
          <dt>Salary</dt>
          <dd>{formatMoney(employee.salary)}</dd>
        </div>
        <div>
          <dt>Employment Status</dt>
          <dd>
            <span className={`pill ${statusClass}`}>{employee.status}</span>
          </dd>
        </div>
      </dl>
    </>
  );
}

export default EmployeeDetails;
