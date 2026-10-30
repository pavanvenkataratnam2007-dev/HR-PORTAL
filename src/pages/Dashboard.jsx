import { NavLink } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';

function formatMoney(amount) {
  return '₹' + Math.round(amount || 0).toLocaleString('en-IN');
}

function Dashboard({ employeeList = [], departmentList = [] }) {
  const totalEmployees = employeeList.length;

  // Calculate status counts
  let activeCount = 0;
  let onLeaveCount = 0;
  let resignedCount = 0;
  let inactiveCount = 0;
  let totalSalary = 0;
  let minSalary = Infinity;
  let maxSalary = 0;

  for (let i = 0; i < employeeList.length; i++) {
    const emp = employeeList[i];
    const sal = Number(emp.salary) || 0;
    totalSalary += sal;

    if (sal > 0) {
      if (sal < minSalary) minSalary = sal;
      if (sal > maxSalary) maxSalary = sal;
    }

    const st = (emp.status || '').trim();
    if (st === 'Active') {
      activeCount++;
    } else if (st === 'On Leave') {
      onLeaveCount++;
      inactiveCount++; // Not currently actively on duty
    } else if (st === 'Resigned') {
      resignedCount++;
      inactiveCount++;
    } else {
      inactiveCount++;
    }
  }

  if (minSalary === Infinity) minSalary = 0;

  const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;
  const activePercent = totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0;

  // Headcount and average salary per department
  const deptStats = [];
  let maxDeptHeadcount = 1;

  for (let d = 0; d < departmentList.length; d++) {
    const dept = departmentList[d];
    let count = 0;
    let salarySum = 0;

    for (let e = 0; e < employeeList.length; e++) {
      if (Number(employeeList[e].departmentId) === Number(dept.id)) {
        count++;
        salarySum += Number(employeeList[e].salary) || 0;
      }
    }

    const avg = count > 0 ? salarySum / count : 0;
    if (count > maxDeptHeadcount) maxDeptHeadcount = count;

    deptStats.push({
      id: dept.id,
      name: dept.name,
      count: count,
      percent: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0,
      avg: avg,
    });
  }

  // Safe sorting for recent joiners (descending by date)
  const sortedJoiners = [...employeeList]
    .filter((emp) => Boolean(emp.joiningDate))
    .sort((a, b) => (b.joiningDate || '').localeCompare(a.joiningDate || ''))
    .slice(0, 5);

  return (
    <>
      <div className="head">
        <div>
          <h2>Workforce Dashboard</h2>
          <p className="note">Live headcount, payroll metrics, and department breakdown</p>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="tiles">
        <StatCard
          title="Total Workforce"
          value={totalEmployees}
          icon="👥"
          subtitle="Registered staff"
        />
        <StatCard
          title="Active Employees"
          value={activeCount}
          icon="🟢"
          badge={`${activePercent}% of staff`}
          variant="active-card"
        />
        <StatCard
          title="Inactive / On Leave"
          value={inactiveCount}
          icon="⏸️"
          subtitle={`${onLeaveCount} on leave, ${resignedCount} resigned`}
          variant="inactive-card"
        />
        <StatCard
          title="Average Monthly Salary"
          value={formatMoney(avgSalary)}
          icon="💼"
          subtitle={`Payroll sum: ${formatMoney(totalSalary)}`}
          variant="wide"
        />
      </div>

      {/* Workforce Statistics & Department Headcount */}
      <div className="two">
        {/* Department-wise Statistics */}
        <section className="panel">
          <div className="panel-title-row">
            <h3>Department-wise Statistics</h3>
            <span className="note">{departmentList.length} departments</span>
          </div>

          <div className="dept-bars">
            {deptStats.map((item) => {
              const width =
                totalEmployees > 0
                  ? Math.max(8, (item.count / maxDeptHeadcount) * 100) + '%'
                  : '0%';

              return (
                <div className="bar" key={item.id}>
                  <span className="dept-label" title={item.name}>
                    {item.name}
                  </span>
                  <div className="bar-track">
                    <i style={{ width }} />
                  </div>
                  <em>
                    <b>{item.count}</b> ({item.percent}%) &middot; avg {formatMoney(item.avg)}
                  </em>
                </div>
              );
            })}

            {deptStats.length === 0 && (
              <p className="note">No departments found.</p>
            )}
          </div>
        </section>

        {/* Workforce Overview & Status Breakdown */}
        <section className="panel">
          <div className="panel-title-row">
            <h3>Workforce Statistics</h3>
            <span className="note">Distribution</span>
          </div>

          <div className="workforce-metrics">
            <div className="metric-row">
              <span>Active Staff:</span>
              <b>
                {activeCount} ({activePercent}%)
              </b>
            </div>
            <div className="metric-row">
              <span>On Leave:</span>
              <b>{onLeaveCount}</b>
            </div>
            <div className="metric-row">
              <span>Resigned / Exited:</span>
              <b>{resignedCount}</b>
            </div>
            <div className="metric-row">
              <span>Total Monthly Payroll:</span>
              <b>{formatMoney(totalSalary)}</b>
            </div>
            <div className="metric-row">
              <span>Salary Range:</span>
              <b>
                {formatMoney(minSalary)} - {formatMoney(maxSalary)}
              </b>
            </div>
          </div>

          <h3 style={{ marginTop: '20px' }}>Recent Joiners</h3>
          <div className="recent-list">
            {sortedJoiners.map((emp) => (
              <div className="row recent-row" key={emp.id}>
                <NavLink to={`/employees/${emp.id}`}>
                  <b>{emp.name}</b> &middot; <small>{emp.designation}</small>
                </NavLink>
                <span className="note">{emp.joiningDate}</span>
              </div>
            ))}
            {sortedJoiners.length === 0 && (
              <p className="note">No recent joiners recorded.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default Dashboard;
