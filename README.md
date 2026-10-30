# Employee & HR Management Portal (PeopleDesk)

Comprehensive React (Vite) frontend + JSON Server backend for the Capstone Project.

## How to Run

### Recommended (Concurrently starts API + Frontend)
```cmd
npm install
npm start
```

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **JSON Server API:** [http://localhost:3000](http://localhost:3000)

### Run Services Separately
1. **JSON Server (Backend):**
   ```cmd
   npm run api
   ```
2. **Vite Development Server (Frontend):**
   ```cmd
   npm run dev
   ```

### Run Automated End-to-End API Test Suite
```cmd
npm run test:api
```

---

## Capstone Features

- **Dashboard:**
  - Real-time headcount statistics: Total Workforce, Active Staff, Inactive/On Leave Staff.
  - Average monthly salary & total monthly payroll sum.
  - Department-wise employee statistics (headcount, company percentage, and average salary bar chart).
  - Detailed workforce statistics & recent joiners log.
- **Employees:**
  - Full CRUD: Add, View individual profile, Edit, Delete (with accessible modal confirmation).
  - Search by employee name or code (case-insensitive).
  - Filter by department, designation, and employment status.
  - Column sorting (by Code, Name, Department, Designation, Salary, Status).
  - Client-side pagination with selectable page size (5, 10, 20, 50).
  - Export filtered employee records to CSV.
  - Clear filters button and friendly empty states.
- **Employee Details:**
  - RESTful `GET /employees/:id` read workflow with loading state and 404 handling.
- **Employee Form:**
  - RESTful `GET /employees/:id` update workflow and `POST /employees` create workflow.
  - Case-insensitive duplicate email validation.
  - Case-insensitive duplicate employee code validation.
  - Joining date bounds validation (1970 to future threshold).
  - Numeric salary validation (> 0, formatted in INR ₹).
  - Department and designation existence checks.
- **Departments:**
  - Add, View, Edit, and Delete departments.
  - Case-insensitive duplicate department name validation on both Add and Edit.
  - Deletion blocked when employees are assigned to a department.
- **Designations:**
  - Add, View, Edit, and Delete designations.
  - Case-insensitive duplicate designation title validation on both Add and Edit.
  - Automatic cascading updates to all employees holding the designation when renamed, with partial failure handling.
  - Deletion blocked when employees hold the designation.

---

## Centralized API Architecture

All network operations are managed through `src/services/api.js` pointing to `VITE_API_BASE_URL` defined in `.env` (defaults to `http://localhost:3000`).

| Resource | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Employees** | `GET` | `/employees` | List all employees |
| | `GET` | `/employees/:id` | Get employee by ID |
| | `POST` | `/employees` | Create employee |
| | `PUT` | `/employees/:id` | Update employee |
| | `DELETE` | `/employees/:id` | Delete employee |
| **Departments** | `GET` | `/departments` | List all departments |
| | `GET` | `/departments/:id` | Get department by ID |
| | `POST` | `/departments` | Create department |
| | `PUT` | `/departments/:id` | Update department |
| | `DELETE` | `/departments/:id` | Delete department |
| **Designations** | `GET` | `/designations` | List all designations |
| | `GET` | `/designations/:id` | Get designation by ID |
| | `POST` | `/designations` | Create designation |
| | `PUT` | `/designations/:id` | Update designation |
| | `DELETE` | `/designations/:id` | Delete designation |
