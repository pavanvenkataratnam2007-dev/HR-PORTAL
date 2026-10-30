
# Employee & HR Management Portal

Simple React (Vite) front end + JSON Server back end for a college lab project.

## How to run (Windows Command Prompt)

```cmd
cd path\to\hr-portal
npm install
npm start
```

- App opens at: http://localhost:5173
- API runs at: http://localhost:3001

`npm start` runs both the API and the React app together.

To run them separately:

```cmd
npm run api
```

```cmd
npm run dev
```

## Features

- **Dashboard** – total employees, counts by status (Active / On Leave / Resigned), average salary, headcount and average salary by department, recent joiners
- **Employees** – add, view, edit, delete; search by name or employee code; filter by department, designation and status
- **Employee details** page
- **Departments** and **Designations** – add, rename, delete (delete is blocked while employees still use the item)

## Project structure

```
hr-portal/
  db.json              – seed data for json-server
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx
    styles.css         – one shared stylesheet
    services/
      api.js           – all fetch calls to the API
    pages/
      Dashboard.jsx
      Employees.jsx
      EmployeeDetails.jsx
      EmployeeForm.jsx
      Departments.jsx
      Designations.jsx
```

## API (JSON Server)

| Method | Endpoint              |
|--------|-----------------------|
| GET    | /employees            |
| GET    | /employees/:id        |
| POST   | /employees            |
| PUT    | /employees/:id        |
| DELETE | /employees/:id        |
| GET    | /departments          |
| POST   | /departments          |
| PUT    | /departments/:id      |
| DELETE | /departments/:id      |
| GET    | /designations         |
| POST   | /designations         |
| PUT    | /designations/:id     |
| DELETE | /designations/:id     |

## Notes for lab PC

The `package.json` includes overrides for rollup and esbuild so the project works when native binaries are blocked:

```json
"overrides": {
  "rollup": "npm:@rollup/wasm-node@4.24.0",
  "esbuild": "npm:esbuild-wasm@0.21.5"
}
```
# HR-PORTAL