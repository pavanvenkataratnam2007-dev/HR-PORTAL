import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteEmployee } from '../services/api.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';

function formatMoney(amount) {
  return '₹' + Math.round(amount || 0).toLocaleString('en-IN');
}

function Employees({
  employeeList = [],
  departmentList = [],
  designationList = [],
  onRefresh,
}) {
  const navigate = useNavigate();

  // Search & Filters
  const [searchText, setSearchText] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDesig, setSelectedDesig] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Column Sorting (Phase 7)
  const [sortKey, setSortKey] = useState('employeeCode');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Pagination (Phase 7)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal Deletion State
  const [empToDelete, setEmpToDelete] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to get department name from id
  function getDeptName(deptId) {
    const dept = departmentList.find((d) => Number(d.id) === Number(deptId));
    return dept ? dept.name : '—';
  }

  // Filter the list based on search and dropdowns
  const filteredList = useMemo(() => {
    return employeeList.filter((emp) => {
      const q = searchText.trim().toLowerCase();
      const nameMatch =
        !q ||
        (emp.name || '').toLowerCase().includes(q) ||
        (emp.employeeCode || '').toLowerCase().includes(q);
      const deptMatch =
        !selectedDept || Number(emp.departmentId) === Number(selectedDept);
      const desigMatch =
        !selectedDesig ||
        (emp.designation || '').toLowerCase() === selectedDesig.toLowerCase();
      const statusMatch = !selectedStatus || emp.status === selectedStatus;

      return nameMatch && deptMatch && desigMatch && statusMatch;
    });
  }, [employeeList, searchText, selectedDept, selectedDesig, selectedStatus]);

  // Sort the filtered list
  const sortedList = useMemo(() => {
    const sorted = [...filteredList];
    sorted.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'department') {
        valA = getDeptName(a.departmentId);
        valB = getDeptName(b.departmentId);
      } else if (sortKey === 'salary') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredList, sortKey, sortOrder, departmentList]);

  // Paginated slice
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedList.slice(startIndex, startIndex + pageSize);
  }, [sortedList, currentPage, pageSize]);

  // Salary calculations
  const shownSalarySum = filteredList.reduce(
    (sum, emp) => sum + (Number(emp.salary) || 0),
    0
  );
  const shownAvg =
    filteredList.length > 0 ? shownSalarySum / filteredList.length : 0;

  function handleSort(key) {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  }

  function renderSortIndicator(key) {
    if (sortKey !== key) return <span className="sort-hint"> ⇅</span>;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  }

  function handleClearFilters() {
    setSearchText('');
    setSelectedDept('');
    setSelectedDesig('');
    setSelectedStatus('');
    setCurrentPage(1);
  }

  const hasActiveFilters =
    Boolean(searchText) ||
    Boolean(selectedDept) ||
    Boolean(selectedDesig) ||
    Boolean(selectedStatus);

  // CSV Export feature (Phase 7)
  function exportToCSV() {
    if (filteredList.length === 0) {
      alert('No employee data available to export.');
      return;
    }

    const headers = [
      'Employee Code',
      'Name',
      'Email',
      'Phone',
      'Department',
      'Designation',
      'Joining Date',
      'Monthly Salary',
      'Status',
    ];

    const rows = filteredList.map((emp) => [
      `"${emp.employeeCode || ''}"`,
      `"${emp.name || ''}"`,
      `"${emp.email || ''}"`,
      `"${emp.phone || ''}"`,
      `"${getDeptName(emp.departmentId)}"`,
      `"${emp.designation || ''}"`,
      `"${emp.joiningDate || ''}"`,
      `"${emp.salary || 0}"`,
      `"${emp.status || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleConfirmDelete() {
    if (!empToDelete) return;

    try {
      await deleteEmployee(empToDelete.id);
      setSuccessMsg(`Employee "${empToDelete.name}" (${empToDelete.employeeCode}) was removed.`);
      setEmpToDelete(null);
      if (onRefresh) await onRefresh();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Could not delete employee. Is JSON Server running?');
      setEmpToDelete(null);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  }

  return (
    <>
      <div className="head">
        <div>
          <h2>Employee Directory</h2>
          <span className="note">
            Managing {employeeList.length} staff member{employeeList.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="acts">
          <button type="button" onClick={exportToCSV} title="Export filtered records to CSV">
            📥 Export CSV
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => navigate('/employees/new')}
          >
            + Add Employee
          </button>
        </div>
      </div>

      {successMsg && <div className="banner success">{successMsg}</div>}
      {errorMsg && <div className="banner danger">{errorMsg}</div>}

      {/* Filter Controls Bar */}
      <div className="filters panel">
        <input
          type="text"
          placeholder="🔍 Search by name or employee code..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Departments</option>
          {departmentList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedDesig}
          onChange={(e) => {
            setSelectedDesig(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Designations</option>
          {designationList.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Resigned">Resigned</option>
          <option value="Inactive">Inactive</option>
        </select>

        {hasActiveFilters && (
          <button type="button" onClick={handleClearFilters} className="clear-btn">
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Employees Table with Clickable Sort Headers */}
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('employeeCode')} className="sortable-th">
                Code {renderSortIndicator('employeeCode')}
              </th>
              <th onClick={() => handleSort('name')} className="sortable-th">
                Name {renderSortIndicator('name')}
              </th>
              <th onClick={() => handleSort('department')} className="sortable-th">
                Department {renderSortIndicator('department')}
              </th>
              <th onClick={() => handleSort('designation')} className="sortable-th">
                Designation {renderSortIndicator('designation')}
              </th>
              <th onClick={() => handleSort('salary')} className="sortable-th">
                Salary {renderSortIndicator('salary')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable-th">
                Status {renderSortIndicator('status')}
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((emp) => {
              const statusClass = (emp.status || '').replace(/\s+/g, '');
              return (
                <tr key={emp.id}>
                  <td>
                    <b>{emp.employeeCode}</b>
                  </td>
                  <td>{emp.name}</td>
                  <td>{getDeptName(emp.departmentId)}</td>
                  <td>{emp.designation}</td>
                  <td>{formatMoney(emp.salary)}</td>
                  <td>
                    <span className={`pill ${statusClass}`}>{emp.status}</span>
                  </td>
                  <td className="acts">
                    <button
                      type="button"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/employees/${emp.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => setEmpToDelete(emp)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredList.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  <EmptyState
                    title="No Employees Found"
                    description={
                      hasActiveFilters
                        ? 'No employee records match your search criteria. Try modifying your filters.'
                        : 'No employees have been added to the system yet.'
                    }
                    actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add First Employee'}
                    onAction={
                      hasActiveFilters
                        ? handleClearFilters
                        : () => navigate('/employees/new')
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredList.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />

      <p className="note" style={{ marginTop: '12px' }}>
        Filtered count: {filteredList.length} of {employeeList.length} staff &middot;
        Average salary of displayed: {formatMoney(shownAvg)}
      </p>

      {/* Accessible Confirmation Modal for Deletion */}
      <ConfirmModal
        isOpen={Boolean(empToDelete)}
        title="Confirm Employee Deletion"
        message={
          empToDelete
            ? `Are you sure you want to delete ${empToDelete.name} (${empToDelete.employeeCode})? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Employee"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEmpToDelete(null)}
      />
    </>
  );
}

export default Employees;
