import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteEmployee } from '../services/api.js';

function formatMoney(amount) {
  return '₹' + Math.round(amount || 0).toLocaleString('en-IN');
}

function Employees({ employeeList, departmentList, designationList, onRefresh }) {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDesig, setSelectedDesig] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Helper to get department name from id
  function getDeptName(deptId) {
    for (let i = 0; i < departmentList.length; i++) {
      if (departmentList[i].id === Number(deptId)) {
        return departmentList[i].name;
      }
    }
    return '—';
  }

  // Filter the list based on search and dropdowns
  const filteredList = [];
  for (let i = 0; i < employeeList.length; i++) {
    const emp = employeeList[i];
    const nameMatch =
      !searchText ||
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchText.toLowerCase());
    const deptMatch = !selectedDept || emp.departmentId === Number(selectedDept);
    const desigMatch = !selectedDesig || emp.designation === selectedDesig;
    const statusMatch = !selectedStatus || emp.status === selectedStatus;

    if (nameMatch && deptMatch && desigMatch && statusMatch) {
      filteredList.push(emp);
    }
  }

  // Average salary of the currently shown rows
  let shownSalarySum = 0;
  for (let i = 0; i < filteredList.length; i++) {
    shownSalarySum += Number(filteredList[i].salary) || 0;
  }
  const shownAvg =
    filteredList.length > 0 ? shownSalarySum / filteredList.length : 0;

  async function handleDelete(emp) {
    const ok = window.confirm('Are you sure you want to delete ' + emp.name + '?');
    if (!ok) return;

    try {
      await deleteEmployee(emp.id);
      setSuccessMsg(emp.name + ' was removed.');
      onRefresh();
      // Clear message after a few seconds
      setTimeout(function () {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      alert('Could not delete. Is the API running?');
    }
  }

  return (
    <>
      <div className="head">
        <h2>Employees</h2>
        <button className="primary" onClick={function () { navigate('/employees/new'); }}>
          Add employee
        </button>
      </div>

      {successMsg && <div className="banner success">{successMsg}</div>}

      <div className="filters">
        <input
          placeholder="Search by name or code"
          value={searchText}
          onChange={function (e) { setSearchText(e.target.value); }}
        />
        <select
          value={selectedDept}
          onChange={function (e) { setSelectedDept(e.target.value); }}
        >
          <option value="">All departments</option>
          {departmentList.map(function (d) {
            return (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            );
          })}
        </select>
        <select
          value={selectedDesig}
          onChange={function (e) { setSelectedDesig(e.target.value); }}
        >
          <option value="">All designations</option>
          {designationList.map(function (d) {
            return (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            );
          })}
        </select>
        <select
          value={selectedStatus}
          onChange={function (e) { setSelectedStatus(e.target.value); }}
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Resigned">Resigned</option>
        </select>
      </div>

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Salary</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(function (emp) {
              const statusClass = emp.status.replace(' ', '');
              return (
                <tr key={emp.id}>
                  <td>{emp.employeeCode}</td>
                  <td>{emp.name}</td>
                  <td>{getDeptName(emp.departmentId)}</td>
                  <td>{emp.designation}</td>
                  <td>{formatMoney(emp.salary)}</td>
                  <td>
                    <span className={'pill ' + statusClass}>{emp.status}</span>
                  </td>
                  <td className="acts">
                    <button onClick={function () { navigate('/employees/' + emp.id); }}>
                      View
                    </button>
                    <button onClick={function () { navigate('/employees/' + emp.id + '/edit'); }}>
                      Edit
                    </button>
                    <button className="danger" onClick={function () { handleDelete(emp); }}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  No employees match your search yet. Try clearing a filter or add a new employee.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="note">
        Showing {filteredList.length} of {employeeList.length} · average salary of shown:{' '}
        {formatMoney(shownAvg)}
      </p>
    </>
  );
}

export default Employees;
