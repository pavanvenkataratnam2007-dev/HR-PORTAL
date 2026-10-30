import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  addEmployee,
  updateEmployee,
  getEmployee,
  getEmployees,
  getDepartments,
  getDesignations,
} from '../services/api.js';

const emptyForm = {
  employeeCode: '',
  name: '',
  email: '',
  phone: '',
  departmentId: '',
  designation: '',
  joiningDate: '',
  salary: '',
  status: 'Active',
};

function EmployeeForm({
  employeeList = [],
  departmentList = [],
  designationList = [],
  onRefresh,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(emptyForm);
  const [currentEmp, setCurrentEmp] = useState(null);
  const [allEmployees, setAllEmployees] = useState(employeeList);
  const [departments, setDepartments] = useState(departmentList);
  const [designations, setDesignations] = useState(designationList);

  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Hydrate lists if parent props were empty
  useEffect(() => {
    async function loadAuxData() {
      try {
        if (allEmployees.length === 0) {
          const emps = await getEmployees();
          setAllEmployees(emps);
        }
        if (departments.length === 0) {
          const depts = await getDepartments();
          setDepartments(depts);
        }
        if (designations.length === 0) {
          const desigs = await getDesignations();
          setDesignations(desigs);
        }
      } catch (err) {
        console.error('Failed to load auxiliary form data:', err);
      }
    }
    loadAuxData();
  }, [allEmployees.length, departments.length, designations.length]);

  // UPDATE WORKFLOW: Fetch employee by ID via GET /employees/:id
  useEffect(() => {
    let isMounted = true;

    async function loadEmployee() {
      if (!isEditing) {
        setFormData(emptyForm);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError('');

      try {
        const emp = await getEmployee(id);
        if (isMounted && emp) {
          setCurrentEmp(emp);
          setFormData({
            employeeCode: emp.employeeCode || '',
            name: emp.name || '',
            email: emp.email || '',
            phone: emp.phone || '',
            departmentId: String(emp.departmentId || ''),
            designation: emp.designation || '',
            joiningDate: emp.joiningDate || '',
            salary: String(emp.salary !== undefined ? emp.salary : ''),
            status: emp.status || 'Active',
          });
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err.message || `Employee with ID #${id} could not be found.`
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEmployee();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  function handleChange(field) {
    return (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear error for this field on edit
      if (errors[field]) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    };
  }

  function validate() {
    const newErrors = {};
    const trimmedCode = formData.employeeCode.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedName = formData.name.trim();
    const currentId = currentEmp ? currentEmp.id : Number(id) || null;

    // 1. Employee Code
    if (!trimmedCode) {
      newErrors.employeeCode = 'Please enter an employee code.';
    } else if (trimmedCode.length < 2) {
      newErrors.employeeCode = 'Employee code must be at least 2 characters.';
    } else {
      // Duplicate employee code check (case-insensitive)
      const isDuplicateCode = allEmployees.some(
        (emp) =>
          emp.employeeCode.trim().toLowerCase() === trimmedCode.toLowerCase() &&
          Number(emp.id) !== Number(currentId)
      );
      if (isDuplicateCode) {
        newErrors.employeeCode = `Employee code "${trimmedCode}" is already in use.`;
      }
    }

    // 2. Name
    if (!trimmedName) {
      newErrors.name = 'Please enter the employee name.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    // 3. Email & Duplicate Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = 'Please enter an email address.';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    } else {
      // Duplicate email check (case-insensitive)
      const isDuplicateEmail = allEmployees.some(
        (emp) =>
          (emp.email || '').trim().toLowerCase() === trimmedEmail.toLowerCase() &&
          Number(emp.id) !== Number(currentId)
      );
      if (isDuplicateEmail) {
        newErrors.email = `Email "${trimmedEmail}" is already registered to another employee.`;
      }
    }

    // 4. Phone Validation (exactly 10 digits)
    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      newErrors.phone = 'Please enter a phone number.';
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits (numbers only).';
    }

    // 5. Department Validation (must exist in department list)
    if (!formData.departmentId) {
      newErrors.departmentId = 'Please select a department.';
    } else {
      const deptExists = departments.some(
        (d) => Number(d.id) === Number(formData.departmentId)
      );
      if (!deptExists) {
        newErrors.departmentId = 'Selected department is no longer valid.';
      }
    }

    // 6. Designation Validation (must exist in designation list)
    if (!formData.designation) {
      newErrors.designation = 'Please select a designation.';
    } else {
      const desigExists = designations.some(
        (d) => d.name.toLowerCase() === formData.designation.toLowerCase()
      );
      if (!desigExists) {
        newErrors.designation = 'Selected designation is no longer valid.';
      }
    }

    // 7. Joining Date Validation
    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Please select a joining date.';
    } else {
      const parsedDate = new Date(formData.joiningDate);
      if (isNaN(parsedDate.getTime())) {
        newErrors.joiningDate = 'Please enter a valid date format.';
      } else {
        const year = parsedDate.getFullYear();
        if (year < 1970) {
          newErrors.joiningDate = 'Joining date cannot be earlier than 1970.';
        } else if (year > new Date().getFullYear() + 1) {
          newErrors.joiningDate = 'Joining date cannot be more than 1 year in the future.';
        }
      }
    }

    // 8. Salary Validation
    const numSalary = Number(formData.salary);
    if (formData.salary === '' || formData.salary === null) {
      newErrors.salary = 'Please enter a salary amount.';
    } else if (isNaN(numSalary) || numSalary <= 0) {
      newErrors.salary = 'Salary must be a positive number greater than 0.';
    } else if (numSalary > 50000000) {
      newErrors.salary = 'Salary exceeds maximum allowable limit (₹50,000,000).';
    }

    // 9. Status Validation
    const validStatuses = ['Active', 'On Leave', 'Resigned', 'Inactive'];
    if (!validStatuses.includes(formData.status)) {
      newErrors.status = 'Please choose a valid status.';
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);

    const payload = {
      employeeCode: formData.employeeCode.trim().toUpperCase(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      departmentId: Number(formData.departmentId),
      designation: formData.designation,
      joiningDate: formData.joiningDate,
      salary: Number(formData.salary),
      status: formData.status,
    };

    try {
      if (isEditing) {
        await updateEmployee(id, payload);
        setSuccessMsg('Employee details updated successfully.');
      } else {
        await addEmployee(payload);
        setSuccessMsg('Employee added successfully.');
      }

      if (onRefresh) {
        await onRefresh();
      }

      setTimeout(() => {
        navigate('/employees');
      }, 700);
    } catch (err) {
      setErrors({ form: err.message || 'Could not save employee. Is JSON Server running?' });
      setSaving(false);
    }
  }

  function fieldClass(fieldName) {
    return errors[fieldName] ? 'bad' : '';
  }

  if (loading) {
    return (
      <div className="panel loading-panel">
        <p>Loading employee form...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="panel error-panel">
        <h3>Unable to Edit Employee</h3>
        <p>{loadError}</p>
        <button type="button" className="primary" onClick={() => navigate('/employees')}>
          &larr; Back to Employees
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="head">
        <h2>{isEditing ? `Edit Employee (${formData.employeeCode || '...'})` : 'Add New Employee'}</h2>
        <button type="button" onClick={() => navigate('/employees')}>
          &larr; Cancel
        </button>
      </div>

      {successMsg && <div className="banner success">{successMsg}</div>}
      {errors.form && <div className="banner danger">{errors.form}</div>}

      <form className="panel form" onSubmit={handleSubmit} noValidate>
        {/* Employee Code */}
        <label className={fieldClass('employeeCode')}>
          Employee Code *
          <input
            type="text"
            placeholder="e.g. EMP009"
            value={formData.employeeCode}
            onChange={handleChange('employeeCode')}
            autoFocus={!isEditing}
          />
          {errors.employeeCode && <small>{errors.employeeCode}</small>}
        </label>

        {/* Full Name */}
        <label className={fieldClass('name')}>
          Full Name *
          <input
            type="text"
            placeholder="e.g. Priya Sharma"
            value={formData.name}
            onChange={handleChange('name')}
          />
          {errors.name && <small>{errors.name}</small>}
        </label>

        {/* Email */}
        <label className={fieldClass('email')}>
          Email Address *
          <input
            type="email"
            placeholder="priya.sharma@company.com"
            value={formData.email}
            onChange={handleChange('email')}
          />
          {errors.email && <small>{errors.email}</small>}
        </label>

        {/* Phone */}
        <label className={fieldClass('phone')}>
          Phone Number (10 digits) *
          <input
            type="tel"
            maxLength={10}
            placeholder="9876543210"
            value={formData.phone}
            onChange={handleChange('phone')}
          />
          {errors.phone && <small>{errors.phone}</small>}
        </label>

        {/* Department */}
        <label className={fieldClass('departmentId')}>
          Department *
          <select
            value={formData.departmentId}
            onChange={handleChange('departmentId')}
          >
            <option value="">-- Select Department --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.departmentId && <small>{errors.departmentId}</small>}
        </label>

        {/* Designation */}
        <label className={fieldClass('designation')}>
          Designation *
          <select
            value={formData.designation}
            onChange={handleChange('designation')}
          >
            <option value="">-- Select Designation --</option>
            {designations.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.designation && <small>{errors.designation}</small>}
        </label>

        {/* Joining Date */}
        <label className={fieldClass('joiningDate')}>
          Joining Date *
          <input
            type="date"
            value={formData.joiningDate}
            onChange={handleChange('joiningDate')}
          />
          {errors.joiningDate && <small>{errors.joiningDate}</small>}
        </label>

        {/* Salary */}
        <label className={fieldClass('salary')}>
          Monthly Salary (₹) *
          <input
            type="number"
            min="1"
            step="100"
            placeholder="e.g. 75000"
            value={formData.salary}
            onChange={handleChange('salary')}
          />
          {errors.salary && <small>{errors.salary}</small>}
        </label>

        {/* Status */}
        <label className={fieldClass('status')}>
          Employment Status *
          <select value={formData.status} onChange={handleChange('status')}>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
            <option value="Inactive">Inactive</option>
          </select>
          {errors.status && <small>{errors.status}</small>}
        </label>

        <div className="full acts form-actions">
          <button type="button" onClick={() => navigate('/employees')}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={saving}>
            {saving
              ? 'Saving...'
              : isEditing
              ? 'Update Employee'
              : 'Add Employee'}
          </button>
        </div>
      </form>
    </>
  );
}

export default EmployeeForm;
