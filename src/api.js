const BASE = 'http://localhost:3001';

async function call(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export const resource = (name) => ({
  list: () => call(`/${name}`),
  get: (id) => call(`/${name}/${id}`),
  add: (data) => call(`/${name}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => call(`/${name}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => call(`/${name}/${id}`, { method: 'DELETE' }),
});

export const employeesApi = resource('employees');
export const departmentsApi = resource('departments');
export const designationsApi = resource('designations');
