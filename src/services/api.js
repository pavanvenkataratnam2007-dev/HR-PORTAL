// Centralized API service for HR Management Portal JSON Server

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000'
).replace(/\/+$/, '');

/**
 * Standard fetch wrapper with detailed network & HTTP error handling
 */
async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.message || JSON.stringify(errorJson);
      } catch {
        errorDetail = response.statusText || `Status ${response.status}`;
      }
      throw new Error(`API Error (${response.status}): ${errorDetail}`);
    }

    // 204 No Content or empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        `Unable to connect to backend server at ${API_BASE_URL}. Please ensure JSON Server is running.`
      );
    }
    throw err;
  }
}

// ==================== EMPLOYEES ====================

export function getEmployees() {
  return request('/employees');
}

export function getEmployee(id) {
  return request(`/employees/${id}`);
}

export function addEmployee(data) {
  return request('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateEmployee(id, data) {
  return request(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteEmployee(id) {
  return request(`/employees/${id}`, {
    method: 'DELETE',
  });
}

// ==================== DEPARTMENTS ====================

export function getDepartments() {
  return request('/departments');
}

export function getDepartment(id) {
  return request(`/departments/${id}`);
}

export function addDepartment(data) {
  return request('/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDepartment(id, data) {
  return request(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDepartment(id) {
  return request(`/departments/${id}`, {
    method: 'DELETE',
  });
}

// ==================== DESIGNATIONS ====================

export function getDesignations() {
  return request('/designations');
}

export function getDesignation(id) {
  return request(`/designations/${id}`);
}

export function addDesignation(data) {
  return request('/designations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDesignation(id, data) {
  return request(`/designations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDesignation(id) {
  return request(`/designations/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Synchronizes designation name changes across all assigned employee records.
 * Gracefully handles and reports partial failures if any individual employee update fails.
 */
export async function cascadeDesignationRename(oldName, newName) {
  const employees = await getEmployees();
  const affected = employees.filter((emp) => emp.designation === oldName);

  const results = {
    total: affected.length,
    updated: 0,
    failed: 0,
    failedEmployees: [],
  };

  for (const emp of affected) {
    try {
      await updateEmployee(emp.id, {
        ...emp,
        designation: newName,
      });
      results.updated++;
    } catch (err) {
      results.failed++;
      results.failedEmployees.push({
        id: emp.id,
        name: emp.name,
        error: err.message,
      });
    }
  }

  return results;
}
