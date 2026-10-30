import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addEmployee, updateEmployee } from '../services/api.js';

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

function EmployeeForm({ employeeList, departmentList, designationList, onRefresh }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Find existing employee if editing
  let existing = null;
  if (isEditing) {
    for (let i = 0; i < employeeList.length; i++) {
      if (employeeList[i].id === Number(id)) {
        existing = employeeList[i];
        break;
      }
    }
  }

  // Initial form values
  const startValues = existing
    ? {
        employeeCode: existing.employeeCode,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        departmentId: String(existing.departmentId),
        designation: existing.designation,
        joiningDate: existing.joiningDate,
        salary: String(existing.salary),
        status: existing.status,
      }
    : emptyForm;

  const [formData, setFormData] = useState(startValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (isEditing && !existing) {
    return <p>Employee not found.</p>;
  }

  function handleChange(field) {
    return function (e) {
      setFormData({ ...formData, [field]: e.target.value });
    };
  }

  function validate() {
    const newErrors = {};

    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Please enter an employee code.';
    } else {
      // Check for duplicate code
      for (let i = 0; i < employeeList.length; i++) {
        const emp = employeeList[i];
        if (
          emp.employeeCode === formData.employeeCode.trim() &&
          emp.id !== (existing ? existing.id : null)
        ) {
          newErrors.employeeCode = 'This code is already used by someone else.';
          break;
        }
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter the employee name.';
    }

    // Simple email check
    const emailOk = /^\S+@\S+\.\S+$/.test(formData.email);
    if (!emailOk) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Phone must be exactly 10 digits
    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits.';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Please select a department.';
    }

    if (!formData.designation) {
      newErrors.designation = 'Please select a designation.';
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Please pick the joining date.';
    }

    if (!(Number(formData.salary) > 0)) {
      newErrors.salary = 'Salary must be more than 0.';
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

    const body = {
      employeeCode: formData.employeeCode.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      departmentId: Number(formData.departmentId),
      designation: formData.designation,
      joiningDate: formData.joiningDate,
      salary: Number(formData.salary),
      status: formData.status,
    };

    try {
      if (isEditing) {
        await updateEmployee(existing.id, body);
        setSuccessMsg('Changes saved successfully.');
      } else {
        await addEmployee(body);
        setSuccessMsg('Employee added successfully.');
      }
      await onRefresh();
      // Short delay so user sees the message, then go back
      setTimeout(function () {
        navigate('/employees');
      }, 800);
    } catch (err) {
      setErrors({ form: 'Could not save. Check that the API is running.' });
      setSaving(false);
    }
  }

  function fieldClass(fieldName) {
    return errors[fieldName] ? 'bad' : '';
  }

  return (
    <>
      <h2>{isEditing ? 'Edit employee' : 'Add employee'}</h2>

      {successMsg && <div className="banner success">{successMsg}</div>}

      <form className="panel form" onSubmit={handleSubmit} noValidate>
        <label className={fieldClass('employeeCode')}>
          Employee code
          <input
            value={formData.employeeCode}
            onChange={handleChange('employeeCode')}
          />
          {errors.employeeCode && <small>{errors.employeeCode}</small>}
        </label>

        <label className={fieldClass('name')}>
          Name
          <input value={formData.name} onChange={handleChange('name')} />
          {errors.name && <small>{errors.name}</small>}
        </label>

        <label className={fieldClass('email')}>
          Email
          <input
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
          />
          {errors.email && <small>{errors.email}</small>}
        </label>

        <label className={fieldClass('phone')}>
          Phone
          <input value={formData.phone} onChange={handleChange('phone')} />
          {errors.phone && <small>{errors.phone}</small>}
        </label>

        <label className={fieldClass('departmentId')}>
          Department
          <select
            value={formData.departmentId}
            onChange={handleChange('departmentId')}
          >
            <option value="">Select</option>
            {departmentList.map(function (d) {
              return (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              );
            })}
          </select>
          {errors.departmentId && <small>{errors.departmentId}</small>}
        </label>

        <label className={fieldClass('designation')}>
          Designation
          <select
            value={formData.designation}
            onChange={handleChange('designation')}
          >
            <option value="">Select</option>
            {designationList.map(function (d) {
              return (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              );
            })}
          </select>
          {errors.designation && <small>{errors.designation}</small>}
        </label>

        <label className={fieldClass('joiningDate')}>
          Joining date
          <input
            type="date"
            value={formData.joiningDate}
            onChange={handleChange('joiningDate')}
          />
          {errors.joiningDate && <small>{errors.joiningDate}</small>}
        </label>

        <label className={fieldClass('salary')}>
          Salary (₹)
          <input
            type="number"
            min="0"
            value={formData.salary}
            onChange={handleChange('salary')}
          />
          {errors.salary && <small>{errors.salary}</small>}
        </label>

        <label>
          Status
          <select value={formData.status} onChange={handleChange('status')}>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
          </select>
        </label>

        {errors.form && <p className="banner full">{errors.form}</p>}

        <div className="full acts">
          <button type="button" onClick={function () { navigate('/employees'); }}>
            Cancel
          </button>
          <button className="primary" disabled={saving}>
            {isEditing ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </form>
    </>
  );
}

export default EmployeeForm;
