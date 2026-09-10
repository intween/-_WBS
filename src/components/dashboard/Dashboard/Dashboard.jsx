/**
 * 대시보드 탭 — 요약 카드 + 내 담당 업무 + 최근 변경.
 */
import MyTasks from '../MyTasks/MyTasks';
import RecentActivity from '../RecentActivity/RecentActivity';
import SummaryCards from '../SummaryCards/SummaryCards';
import './Dashboard.scss';

function Dashboard() {
  return (
    <div className="dashboard">
      <SummaryCards />

      <div className="dashboard__columns">
        <section className="dashboard__panel">
          <h2 className="dashboard__title">내 담당 업무</h2>
          <MyTasks />
        </section>

        <section className="dashboard__panel">
          <RecentActivity />
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
