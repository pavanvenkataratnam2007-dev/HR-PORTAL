// Simple API helpers that talk to json-server on port 3001

const BASE_URL = 'http://localhost:3001';

async function request(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error('Request failed with status ' + response.status);
  }

  // DELETE returns empty body
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return response.json();
}

// Employees
export function getEmployees() {
  return request('/employees');
}

export function getEmployee(id) {
  return request('/employees/' + id);
}

export function addEmployee(data) {
  return request('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateEmployee(id, data) {
  return request('/employees/' + id, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteEmployee(id) {
  return request('/employees/' + id, { method: 'DELETE' });
}

// Departments
export function getDepartments() {
  return request('/departments');
}

export function addDepartment(data) {
  return request('/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDepartment(id, data) {
  return request('/departments/' + id, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDepartment(id) {
  return request('/departments/' + id, { method: 'DELETE' });
}

// Designations
export function getDesignations() {
  return request('/designations');
}

export function addDesignation(data) {
  return request('/designations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDesignation(id, data) {
  return request('/designations/' + id, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDesignation(id) {
  return request('/designations/' + id, { method: 'DELETE' });
}
