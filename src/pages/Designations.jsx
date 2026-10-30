import { useState } from 'react';
import {
  addDesignation,
  updateDesignation,
  deleteDesignation,
  cascadeDesignationRename,
} from '../services/api.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';

function Designations({ designationList = [], employeeList = [], onRefresh }) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Deletion modal state
  const [desigToDelete, setDesigToDelete] = useState(null);

  // Count employees with this designation
  function countUsage(desigName) {
    return employeeList.filter(
      (emp) => (emp.designation || '').toLowerCase() === (desigName || '').toLowerCase()
    ).length;
  }

  async function handleAdd(e) {
    e.preventDefault();
    const trimmed = newName.trim();

    if (!trimmed) {
      setMsg('Please enter a designation title.');
      return;
    }

    // Duplicate check on add (case-insensitive)
    const exists = designationList.some(
      (d) => d.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      setMsg(`A designation named "${trimmed}" already exists.`);
      return;
    }

    try {
      await addDesignation({ name: trimmed });
      setNewName('');
      setMsg('');
      setSuccessMsg(`Designation "${trimmed}" added successfully.`);
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setMsg(err.message || 'Could not add designation. Is the API running?');
    }
  }

  function startEdit(desig) {
    setEditId(desig.id);
    setEditName(desig.name);
    setMsg('');
  }

  async function handleSave(desig) {
    const trimmed = editName.trim();
    if (!trimmed) {
      setMsg('Designation title cannot be blank.');
      return;
    }

    if (trimmed.toLowerCase() === desig.name.toLowerCase()) {
      setEditId(null);
      return;
    }

    // Duplicate designation check on EDIT (case-insensitive, excluding self)
    const isDuplicate = designationList.some(
      (d) =>
        Number(d.id) !== Number(desig.id) &&
        d.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setMsg(`Another designation named "${trimmed}" already exists.`);
      return;
    }

    setIsUpdating(true);
    setMsg('');

    try {
      // 1. Update the designation record itself
      await updateDesignation(desig.id, { ...desig, name: trimmed });

      // 2. Cascade designation update across all employees holding this title
      const cascadeResult = await cascadeDesignationRename(desig.name, trimmed);

      setEditId(null);

      // Handle partial failures during designation rename
      if (cascadeResult.failed > 0) {
        setMsg(
          `Designation renamed to "${trimmed}", but ${cascadeResult.failed} employee record(s) failed to update. Please review affected employees.`
        );
      } else if (cascadeResult.updated > 0) {
        setSuccessMsg(
          `Designation renamed to "${trimmed}" and updated across all ${cascadeResult.updated} employee(s).`
        );
      } else {
        setSuccessMsg(`Designation renamed to "${trimmed}".`);
      }

      if (onRefresh) await onRefresh();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setMsg(err.message || 'Could not update designation.');
    } finally {
      setIsUpdating(false);
    }
  }

  function promptDelete(desig) {
    const usedBy = countUsage(desig.name);
    if (usedBy > 0) {
      setMsg(
        `Cannot delete "${desig.name}". It is currently held by ${usedBy} employee(s). Please reassign them before deleting.`
      );
      return;
    }
    setMsg('');
    setDesigToDelete(desig);
  }

  async function confirmDeleteDesig() {
    if (!desigToDelete) return;

    try {
      await deleteDesignation(desigToDelete.id);
      setSuccessMsg(`Designation "${desigToDelete.name}" was removed.`);
      setDesigToDelete(null);
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setMsg(err.message || 'Could not delete designation.');
      setDesigToDelete(null);
    }
  }

  return (
    <>
      <div className="head">
        <h2>Designations</h2>
        <span className="note">Total: {designationList.length}</span>
      </div>

      <form className="filters panel" onSubmit={handleAdd}>
        <input
          placeholder="Enter new designation title (e.g. Lead Architect)"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            if (msg) setMsg('');
          }}
        />
        <button type="submit" className="primary" disabled={isUpdating}>
          + Add Designation
        </button>
      </form>

      {msg && <p className="banner danger">{msg}</p>}
      {successMsg && <p className="banner success">{successMsg}</p>}

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Designation Title</th>
              <th>Holding Employees</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {designationList.map((desig) => {
              const usage = countUsage(desig.name);
              const isEditingThis = editId === desig.id;

              return (
                <tr key={desig.id}>
                  <td>
                    {isEditingThis ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        disabled={isUpdating}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(desig);
                          if (e.key === 'Escape') setEditId(null);
                        }}
                      />
                    ) : (
                      <b>{desig.name}</b>
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
                        <button
                          type="button"
                          className="primary"
                          onClick={() => handleSave(desig)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Updating...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(desig)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => promptDelete(desig)}
                          title={usage > 0 ? 'Cannot delete assigned designation' : 'Delete designation'}
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
                  <EmptyState
                    title="No Designations Created"
                    description="Create your company's designation roles above."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Accessible Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(desigToDelete)}
        title="Delete Designation"
        message={
          desigToDelete
            ? `Are you sure you want to permanently delete the "${desigToDelete.name}" designation?`
            : ''
        }
        confirmText="Delete Designation"
        isDanger={true}
        onConfirm={confirmDeleteDesig}
        onCancel={() => setDesigToDelete(null)}
      />
    </>
  );
}

export default Designations;
