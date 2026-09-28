import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Shield, CreditCard, AlertCircle,
  Users, BarChart3, LogOut, ChevronRight, Settings, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = {
  customer: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/quote', icon: FileText, label: 'Get a Quote' },
    { to: '/policies', icon: Shield, label: 'My Policies' },
    { to: '/claims', icon: AlertCircle, label: 'My Claims' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
  ],
  agent: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/policies', icon: Shield, label: 'Policies' },
    { to: '/quote', icon: FileText, label: 'Create Quote' },
  ],
  adjuster: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/claims', icon: AlertCircle, label: 'Claims Queue' },
  ],
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/policies', icon: Shield, label: 'Policies' },
    { to: '/admin/claims', icon: AlertCircle, label: 'Claims' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { to: '/admin/stats', icon: BarChart3, label: 'Statistics' },
  ],
};

const sharedItems = [
  { to: '/guidewire', icon: Settings, label: 'GW Architecture' },
  { to: '/gosu', icon: BookOpen, label: 'Gosu Concepts' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    customer: 'Customer',
    agent: 'Insurance Agent',
    adjuster: 'Claims Adjuster',
    admin: 'Administrator',
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">InsureFlow</h1>
            <p className="text-xs text-gray-400">Insurance Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500">{roleLabel[user?.role]}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Reference
          </p>
          <div className="space-y-0.5">
            {sharedItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
