import { NavLink } from 'react-router-dom';

function formatMoney(amount) {
  return '₹' + Math.round(amount || 0).toLocaleString('en-IN');
}

function Dashboard({ employeeList, departmentList }) {
  // Count by status
  let activeCount = 0;
  let onLeaveCount = 0;
  let resignedCount = 0;
  let totalSalary = 0;

  for (let i = 0; i < employeeList.length; i++) {
    const emp = employeeList[i];
    totalSalary += Number(emp.salary) || 0;
    if (emp.status === 'Active') activeCount++;
    else if (emp.status === 'On Leave') onLeaveCount++;
    else if (emp.status === 'Resigned') resignedCount++;
  }

  const avgSalary = employeeList.length > 0 ? totalSalary / employeeList.length : 0;

  // Headcount and average salary per department
  const deptStats = [];
  let maxCount = 1;

  for (let d = 0; d < departmentList.length; d++) {
    const dept = departmentList[d];
    let count = 0;
    let salarySum = 0;

    for (let e = 0; e < employeeList.length; e++) {
      if (employeeList[e].departmentId === dept.id) {
        count++;
        salarySum += Number(employeeList[e].salary) || 0;
      }
    }

    const avg = count > 0 ? salarySum / count : 0;
    if (count > maxCount) maxCount = count;

    deptStats.push({
      name: dept.name,
      count: count,
      avg: avg,
    });
  }

  // Recent joiners (sort by joining date descending)
  const sorted = [...employeeList].sort(function (a, b) {
    return b.joiningDate.localeCompare(a.joiningDate);
  });
  const recentJoiners = sorted.slice(0, 4);

  return (
    <>
      <h2>Dashboard</h2>

      <div className="tiles">
        <div className="tile">
          <b>{employeeList.length}</b>
          Total employees
        </div>
        <div className="tile">
          <b>{activeCount}</b>
          Active
        </div>
        <div className="tile">
          <b>{onLeaveCount}</b>
          On leave
        </div>
        <div className="tile">
          <b>{resignedCount}</b>
          Resigned
        </div>
        <div className="tile wide">
          <b>{formatMoney(avgSalary)}</b>
          Average salary
        </div>
      </div>

      <div className="two">
        <section className="panel">
          <h3>Headcount by department</h3>
          {deptStats.map(function (item) {
            const width = (item.count / maxCount) * 100 + '%';
            return (
              <div className="bar" key={item.name}>
                <span>{item.name}</span>
                <div>
                  <i style={{ width: width }} />
                </div>
                <em>
                  {item.count} · avg {formatMoney(item.avg)}
                </em>
              </div>
            );
          })}
        </section>

        <section className="panel">
          <h3>Recent joiners</h3>
          {recentJoiners.map(function (emp) {
            return (
              <p className="row" key={emp.id}>
                <NavLink to={'/employees/' + emp.id}>{emp.name}</NavLink>
                <span>{emp.joiningDate}</span>
              </p>
            );
          })}
          {recentJoiners.length === 0 && (
            <p className="note">No employees yet.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default Dashboard;
