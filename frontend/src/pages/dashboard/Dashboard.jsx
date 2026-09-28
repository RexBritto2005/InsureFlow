import { useAuth } from '../../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import AdjusterDashboard from './AdjusterDashboard';
import AgentDashboard from './AgentDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'adjuster') return <AdjusterDashboard />;
  if (user?.role === 'agent') return <AgentDashboard />;
  return <CustomerDashboard />;
}
