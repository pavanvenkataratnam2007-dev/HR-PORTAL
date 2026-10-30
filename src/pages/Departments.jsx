import { useState } from 'react';
import {
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from '../services/api.js';

function Departments({ departmentList, employeeList, onRefresh }) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // How many employees use this department
  function countUsage(deptId) {
    let count = 0;
    for (let i = 0; i < employeeList.length; i++) {
      if (employeeList[i].departmentId === deptId) {
        count++;
      }
    }
    return count;
  }

  async function handleAdd(e) {
    e.preventDefault();
    const trimmed = newName.trim();

    if (!trimmed) {
      setMsg('Please enter a name first.');
      return;
    }

    // Check duplicate (case insensitive)
    for (let i = 0; i < departmentList.length; i++) {
      if (departmentList[i].name.toLowerCase() === trimmed.toLowerCase()) {
        setMsg('That department name already exists.');
        return;
      }
    }

    try {
      await addDepartment({ name: trimmed });
      setNewName('');
      setMsg('');
      setSuccessMsg('Department added.');
      onRefresh();
      setTimeout(function () {
        setSuccessMsg('');
      }, 2500);
    } catch (err) {
      setMsg('Could not add. Is the API running?');
    }
  }

  function startEdit(dept) {
    setEditId(dept.id);
    setEditName(dept.name);
    setMsg('');
  }

  async function handleSave(dept) {
    const trimmed = editName.trim();
    if (!trimmed) return;

    try {
      await updateDepartment(dept.id, { ...dept, name: trimmed });
      setEditId(null);
      setSuccessMsg('Name updated.');
      onRefresh();
      setTimeout(function () {
        setSuccessMsg('');
      }, 2500);
    } catch (err) {
      setMsg('Could not save changes.');
    }
  }

  async function handleDelete(dept) {
    const usedBy = countUsage(dept.id);
    if (usedBy > 0) {
      setMsg(
        dept.name +
          ' is used by ' +
          usedBy +
          ' employee(s). Reassign them before deleting.'
      );
      return;
    }

    const ok = window.confirm('Delete ' + dept.name + '?');
    if (!ok) return;

    try {
      await deleteDepartment(dept.id);
      setMsg('');
      setSuccessMsg(dept.name + ' was removed.');
      onRefresh();
      setTimeout(function () {
        setSuccessMsg('');
      }, 2500);
    } catch (err) {
      setMsg('Could not delete.');
    }
  }

  return (
    <>
      <h2>Departments</h2>

      <form className="filters" onSubmit={handleAdd}>
        <input
          placeholder="New department name"
          value={newName}
          onChange={function (e) {
            setNewName(e.target.value);
          }}
        />
        <button className="primary">Add</button>
      </form>

      {msg && <p className="banner">{msg}</p>}
      {successMsg && <p className="banner success">{successMsg}</p>}

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Employees</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {departmentList.map(function (dept) {
              return (
                <tr key={dept.id}>
                  <td>
                    {editId === dept.id ? (
                      <input
                        value={editName}
                        onChange={function (e) {
                          setEditName(e.target.value);
                        }}
                        autoFocus
                      />
                    ) : (
                      dept.name
                    )}
                  </td>
                  <td>{countUsage(dept.id)}</td>
                  <td className="acts">
                    {editId === dept.id ? (
                      <>
                        <button onClick={function () { handleSave(dept); }}>
                          Save
                        </button>
                        <button onClick={function () { setEditId(null); }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={function () { startEdit(dept); }}>
                          Edit
                        </button>
                        <button
                          className="danger"
                          onClick={function () { handleDelete(dept); }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {departmentList.length === 0 && (
              <tr>
                <td colSpan="3" className="empty">
                  No departments yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Departments;
