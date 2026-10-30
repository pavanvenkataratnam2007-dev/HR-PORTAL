import { useState } from 'react';
import {
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from '../services/api.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';

function Departments({ departmentList = [], employeeList = [], onRefresh }) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal deletion state
  const [deptToDelete, setDeptToDelete] = useState(null);

  // How many employees use this department
  function countUsage(deptId) {
    return employeeList.filter((emp) => Number(emp.departmentId) === Number(deptId)).length;
  }

  async function handleAdd(e) {
    e.preventDefault();
    const trimmed = newName.trim();

    if (!trimmed) {
      setMsg('Please enter a department name.');
      return;
    }

    // Check duplicate (case insensitive)
    const exists = departmentList.some(
      (dept) => dept.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      setMsg(`A department named "${trimmed}" already exists.`);
      return;
    }

    try {
      await addDepartment({ name: trimmed });
      setNewName('');
      setMsg('');
      setSuccessMsg(`Department "${trimmed}" added successfully.`);
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setMsg(err.message || 'Could not add department. Is the API running?');
    }
  }

  function startEdit(dept) {
    setEditId(dept.id);
    setEditName(dept.name);
    setMsg('');
  }

  async function handleSave(dept) {
    const trimmed = editName.trim();
    if (!trimmed) {
      setMsg('Department name cannot be blank.');
      return;
    }

    // Duplicate department check on EDIT (case-insensitive, excluding self)
    const isDuplicate = departmentList.some(
      (d) =>
        Number(d.id) !== Number(dept.id) &&
        d.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setMsg(`Another department named "${trimmed}" already exists.`);
      return;
    }

    try {
      await updateDepartment(dept.id, { ...dept, name: trimmed });
      setEditId(null);
      setMsg('');
      setSuccessMsg(`Department updated to "${trimmed}".`);
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setMsg(err.message || 'Could not save changes to department.');
    }
  }

  function promptDelete(dept) {
    const usedBy = countUsage(dept.id);
    if (usedBy > 0) {
      setMsg(
        `Cannot delete "${dept.name}". It is currently assigned to ${usedBy} employee(s). Please reassign them first.`
      );
      return;
    }
    setMsg('');
    setDeptToDelete(dept);
  }

  async function confirmDeleteDept() {
    if (!deptToDelete) return;

    try {
      await deleteDepartment(deptToDelete.id);
      setSuccessMsg(`Department "${deptToDelete.name}" was removed.`);
      setDeptToDelete(null);
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setMsg(err.message || 'Could not delete department.');
      setDeptToDelete(null);
    }
  }

  return (
    <>
      <div className="head">
        <h2>Departments</h2>
        <span className="note">Total: {departmentList.length}</span>
      </div>

      <form className="filters panel" onSubmit={handleAdd}>
        <input
          placeholder="Enter new department name (e.g. Marketing)"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            if (msg) setMsg('');
          }}
        />
        <button type="submit" className="primary">
          + Add Department
        </button>
      </form>

      {msg && <p className="banner danger">{msg}</p>}
      {successMsg && <p className="banner success">{successMsg}</p>}

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Assigned Employees</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departmentList.map((dept) => {
              const usage = countUsage(dept.id);
              const isEditingThis = editId === dept.id;

              return (
                <tr key={dept.id}>
                  <td>
                    {isEditingThis ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(dept);
                          if (e.key === 'Escape') setEditId(null);
                        }}
                      />
                    ) : (
                      <b>{dept.name}</b>
                    )}
                  </td>
                  <td>
                    <span className={usage > 0 ? 'badge badge-info' : 'badge badge-muted'}>
                      {usage} employee{usage === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td className="acts">
                    {isEditingThis ? (
                      <>
                        <button type="button" className="primary" onClick={() => handleSave(dept)}>
                          Save
                        </button>
                        <button type="button" onClick={() => setEditId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(dept)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => promptDelete(dept)}
                          title={usage > 0 ? 'Cannot delete assigned department' : 'Delete department'}
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
                  <EmptyState
                    title="No Departments Created"
                    description="Get started by creating your organization's first department above."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Accessible Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deptToDelete)}
        title="Delete Department"
        message={
          deptToDelete
            ? `Are you sure you want to permanently delete the "${deptToDelete.name}" department?`
            : ''
        }
        confirmText="Delete Department"
        isDanger={true}
        onConfirm={confirmDeleteDept}
        onCancel={() => setDeptToDelete(null)}
      />
    </>
  );
}

export default Departments;
