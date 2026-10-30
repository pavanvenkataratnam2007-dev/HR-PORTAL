import { useState } from 'react';
import {
  addDesignation,
  updateDesignation,
  deleteDesignation,
} from '../services/api.js';

function Designations({ designationList, employeeList, onRefresh }) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // How many employees have this designation
  function countUsage(desigName) {
    let count = 0;
    for (let i = 0; i < employeeList.length; i++) {
      if (employeeList[i].designation === desigName) {
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

    for (let i = 0; i < designationList.length; i++) {
      if (designationList[i].name.toLowerCase() === trimmed.toLowerCase()) {
        setMsg('That designation name already exists.');
        return;
      }
    }

    try {
      await addDesignation({ name: trimmed });
      setNewName('');
      setMsg('');
      setSuccessMsg('Designation added.');
      onRefresh();
      setTimeout(function () {
        setSuccessMsg('');
      }, 2500);
    } catch (err) {
      setMsg('Could not add. Is the API running?');
    }
  }

  function startEdit(desig) {
    setEditId(desig.id);
    setEditName(desig.name);
    setMsg('');
  }

  async function handleSave(desig) {
    const trimmed = editName.trim();
    if (!trimmed) return;

    try {
      await updateDesignation(desig.id, { ...desig, name: trimmed });
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

  async function handleDelete(desig) {
    const usedBy = countUsage(desig.name);
    if (usedBy > 0) {
      setMsg(
        desig.name +
          ' is used by ' +
          usedBy +
          ' employee(s). Reassign them before deleting.'
      );
      return;
    }

    const ok = window.confirm('Delete ' + desig.name + '?');
    if (!ok) return;

    try {
      await deleteDesignation(desig.id);
      setMsg('');
      setSuccessMsg(desig.name + ' was removed.');
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
      <h2>Designations</h2>

      <form className="filters" onSubmit={handleAdd}>
        <input
          placeholder="New designation name"
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
            {designationList.map(function (desig) {
              return (
                <tr key={desig.id}>
                  <td>
                    {editId === desig.id ? (
                      <input
                        value={editName}
                        onChange={function (e) {
                          setEditName(e.target.value);
                        }}
                        autoFocus
                      />
                    ) : (
                      desig.name
                    )}
                  </td>
                  <td>{countUsage(desig.name)}</td>
                  <td className="acts">
                    {editId === desig.id ? (
                      <>
                        <button onClick={function () { handleSave(desig); }}>
                          Save
                        </button>
                        <button onClick={function () { setEditId(null); }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={function () { startEdit(desig); }}>
                          Edit
                        </button>
                        <button
                          className="danger"
                          onClick={function () { handleDelete(desig); }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {designationList.length === 0 && (
              <tr>
                <td colSpan="3" className="empty">
                  No designations yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Designations;
