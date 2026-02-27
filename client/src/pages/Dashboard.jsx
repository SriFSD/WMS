import SummaryCard from "../components/SummaryCard";
export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="dashboard-grid">
        <SummaryCard title="Total orders today" value={null} to="/orders" />
        <SummaryCard title="Pending Deliveries" value={null} to="/deliveries" />
        <SummaryCard title="Pending Payments" value={null} to="/payments" />
        <SummaryCard title="Low Stock Items" value={null} to="/stock" />
      </div>
    </div>
  );
}
