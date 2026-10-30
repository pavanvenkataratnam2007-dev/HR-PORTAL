// Automated End-to-End Test Suite for HR Management Portal

const API_BASE = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AUTOMATED END-TO-END TEST SUITE');
  console.log('API Base:', API_BASE);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify JSON Server connection & employees
    console.log('--- 1. Testing GET /employees ---');
    const resEmployees = await fetch(`${API_BASE}/employees`);
    assert(resEmployees.ok, 'GET /employees responded with 200 OK');
    const employees = await resEmployees.json();
    assert(employees.length >= 8, `Loaded ${employees.length} employees (>= 8 expected)`);

    // Verify all 10 required fields on each employee record
    const requiredFields = [
      'id',
      'employeeCode',
      'name',
      'email',
      'phone',
      'departmentId',
      'designation',
      'joiningDate',
      'salary',
      'status',
    ];
    let allFieldsPresent = true;
    for (const emp of employees) {
      for (const field of requiredFields) {
        if (!(field in emp)) {
          allFieldsPresent = false;
          console.error(`Employee ID ${emp.id} missing field: ${field}`);
        }
      }
    }
    assert(allFieldsPresent, 'Every employee record contains all 10 required fields');

    // 2. Testing Departments
    console.log('\n--- 2. Testing GET /departments ---');
    const resDepts = await fetch(`${API_BASE}/departments`);
    assert(resDepts.ok, 'GET /departments responded with 200 OK');
    const depts = await resDepts.json();
    assert(depts.length >= 4, `Loaded ${depts.length} departments (>= 4 expected)`);

    // 3. Testing Designations
    console.log('\n--- 3. Testing GET /designations ---');
    const resDesigs = await fetch(`${API_BASE}/designations`);
    assert(resDesigs.ok, 'GET /designations responded with 200 OK');
    const desigs = await resDesigs.json();
    assert(desigs.length >= 7, `Loaded ${desigs.length} designations (>= 7 expected)`);

    // 4. Testing CRUD: CREATE Employee (POST /employees)
    console.log('\n--- 4. Testing Employee CREATE Workflow ---');
    const newEmp = {
      employeeCode: 'EMP999',
      name: 'Verification Bot',
      email: 'verify.bot@company.com',
      phone: '9998887770',
      departmentId: 2,
      designation: 'Senior Developer',
      joiningDate: '2024-01-15',
      salary: 95000,
      status: 'Active',
    };
    const postRes = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp),
    });
    assert(postRes.ok, 'POST /employees created test employee');
    const createdEmp = await postRes.json();
    assert(createdEmp.id !== undefined, `Created employee assigned ID #${createdEmp.id}`);
    assert(createdEmp.employeeCode === 'EMP999', 'Created employee code matches EMP999');

    // 5. Testing READ single employee (GET /employees/:id)
    console.log('\n--- 5. Testing Employee READ Workflow (GET /employees/:id) ---');
    const getRes = await fetch(`${API_BASE}/employees/${createdEmp.id}`);
    assert(getRes.ok, `GET /employees/${createdEmp.id} succeeded`);
    const fetchedEmp = await getRes.json();
    assert(fetchedEmp.name === 'Verification Bot', 'Employee name matches correctly');
    assert(fetchedEmp.salary === 95000, 'Employee salary matches correctly');

    // 6. Testing UPDATE employee (PUT /employees/:id)
    console.log('\n--- 6. Testing Employee UPDATE Workflow (PUT /employees/:id) ---');
    const updatePayload = {
      ...fetchedEmp,
      salary: 105000,
      status: 'On Leave',
    };
    const putRes = await fetch(`${API_BASE}/employees/${createdEmp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });
    assert(putRes.ok, `PUT /employees/${createdEmp.id} updated employee`);
    const updatedEmp = await putRes.json();
    assert(updatedEmp.salary === 105000, 'Updated salary correctly saved as 105000');
    assert(updatedEmp.status === 'On Leave', 'Updated status correctly saved as On Leave');

    // 7. Testing DELETE employee (DELETE /employees/:id)
    console.log('\n--- 7. Testing Employee DELETE Workflow (DELETE /employees/:id) ---');
    const delRes = await fetch(`${API_BASE}/employees/${createdEmp.id}`, {
      method: 'DELETE',
    });
    assert(delRes.ok, `DELETE /employees/${createdEmp.id} deleted successfully`);

    // Verify it is truly gone
    const verifyDelRes = await fetch(`${API_BASE}/employees/${createdEmp.id}`);
    assert(verifyDelRes.status === 404, 'Verified employee record no longer exists (404)');

    // 8. Testing Dashboard Calculations
    console.log('\n--- 8. Testing Dashboard Metrics Accuracy ---');
    const currentEmployeesRes = await fetch(`${API_BASE}/employees`);
    const currEmployees = await currentEmployeesRes.json();
    const activeStaff = currEmployees.filter((e) => e.status === 'Active').length;
    const inactiveStaff = currEmployees.filter((e) => e.status !== 'Active').length;
    const totalSalary = currEmployees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
    const avgSalary = Math.round(totalSalary / currEmployees.length);

    assert(activeStaff === 6, `Active count calculation: ${activeStaff} (expected 6)`);
    assert(inactiveStaff === 2, `Inactive/OnLeave count calculation: ${inactiveStaff} (expected 2)`);
    assert(avgSalary > 0, `Average salary computed: ₹${avgSalary.toLocaleString('en-IN')}`);

    // 9. Summary
    console.log('\n====================================================');
    console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
