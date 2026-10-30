import { useParams, useNavigate, NavLink } from 'react-router-dom';

function formatMoney(amount) {
  return '₹' + Math.round(amount || 0).toLocaleString('en-IN');
}

function EmployeeDetails({ employeeList, departmentList }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the employee
  let employee = null;
  for (let i = 0; i < employeeList.length; i++) {
    if (employeeList[i].id === Number(id)) {
      employee = employeeList[i];
      break;
    }
  }

  if (!employee) {
    return (
      <p>
        Employee not found.{' '}
        <NavLink to="/employees">Back to employees</NavLink>
      </p>
    );
  }

  // Find department name
  let deptName = '—';
  for (let i = 0; i < departmentList.length; i++) {
    if (departmentList[i].id === employee.departmentId) {
      deptName = departmentList[i].name;
      break;
    }
  }

  return (
    <>
      <div className="head">
        <h2>{employee.name}</h2>
        <div>
          <button onClick={function () { navigate('/employees'); }}>Back</button>{' '}
          <button
            className="primary"
            onClick={function () { navigate('/employees/' + employee.id + '/edit'); }}
          >
            Edit
          </button>
        </div>
      </div>

      <dl className="panel details">
        <div>
          <dt>Employee code</dt>
          <dd>{employee.employeeCode}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{employee.email}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{employee.phone}</dd>
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
          <dt>Joining date</dt>
          <dd>{employee.joiningDate}</dd>
        </div>
        <div>
          <dt>Salary</dt>
          <dd>{formatMoney(employee.salary)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{employee.status}</dd>
        </div>
      </dl>
    </>
  );
}

export default EmployeeDetails;
