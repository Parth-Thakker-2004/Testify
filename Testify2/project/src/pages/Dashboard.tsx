import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker,
  Search,
  Plus,
  Settings,
  Bell,
  User,
  Layout,
  PlayCircle,
  History,
  BarChart3,
  FileText,
  Settings2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#111] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a1a] border-r border-gray-800">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <Beaker className="h-8 w-8 text-[#a855f7]" />
            <span className="text-xl font-bold text-white">Testify</span>
          </div>
        </div>
        <nav className="mt-8">
          <div className="px-4 space-y-1">
            {[
              { icon: <Layout className="h-5 w-5" />, label: 'Dashboard', path: '/dashboard', active: true },
              { icon: <PlayCircle className="h-5 w-5" />, label: 'Tests', path: '/tests' },
              { icon: <History className="h-5 w-5" />, label: 'History', path: '/history' },
              { icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics', path: '/analytics' },
              { icon: <FileText className="h-5 w-5" />, label: 'Reports', path: '/reports' },
              { icon: <Settings2 className="h-5 w-5" />, label: 'Settings', path: '/settings' }
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className={`flex items-center space-x-3 w-full px-4 py-2 text-sm font-medium rounded-lg ${
                  item.active 
                    ? 'bg-[#a855f7] text-white' 
                    : 'text-gray-400 hover:bg-[#222] hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-[#1a1a1a] border-b border-gray-800">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  className="pl-10 pr-4 py-2 w-64 bg-[#222] border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Settings className="h-5 w-5" />
              </button>
              <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back!</h1>
            <p className="text-gray-400">Here's an overview of your testing activities</p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-400/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-medium">Last 24 hours</span>
              </div>
              <h3 className="text-white font-semibold mb-1">All Tests Passing</h3>
              <p className="text-gray-400 text-sm">Core functionality tests are stable</p>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[#a855f7]/10 rounded-lg">
                  <Zap className="h-6 w-6 text-[#a855f7]" />
                </div>
                <span className="text-[#a855f7] text-sm font-medium">Active Now</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Performance Tests Running</h3>
              <p className="text-gray-400 text-sm">Load testing in progress</p>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-400/10 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-blue-400 text-sm font-medium">Updated</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Security Tests Complete</h3>
              <p className="text-gray-400 text-sm">No vulnerabilities detected</p>
            </div>
          </div>

          {/* Recent Tests */}
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Recent Tests</h2>
                <button 
                  onClick={() => navigate('/tests')}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#a855f7] text-white rounded-lg hover:bg-[#9333ea] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Test</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400">
                    <th className="pb-4">Test Name</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Last Run</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {[
                    { 
                      name: 'User Authentication Flow',
                      status: 'Passed',
                      type: 'Integration',
                      lastRun: 'Just now',
                      icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
                    },
                    { 
                      name: 'Payment Gateway Integration',
                      status: 'In Progress',
                      type: 'E2E',
                      lastRun: 'Running',
                      icon: <Clock className="h-4 w-4 text-blue-400" />
                    },
                    { 
                      name: 'Data Validation',
                      status: 'Failed',
                      type: 'Unit',
                      lastRun: '5m ago',
                      icon: <XCircle className="h-4 w-4 text-red-400" />
                    },
                    { 
                      name: 'API Response Time',
                      status: 'Warning',
                      type: 'Performance',
                      lastRun: '10m ago',
                      icon: <AlertCircle className="h-4 w-4 text-yellow-400" />
                    }
                  ].map((test) => (
                    <tr key={test.name} className="border-t border-gray-800">
                      <td className="py-4">{test.name}</td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          {test.icon}
                          <span className={`
                            ${test.status === 'Passed' ? 'text-green-400' : ''}
                            ${test.status === 'Failed' ? 'text-red-400' : ''}
                            ${test.status === 'In Progress' ? 'text-blue-400' : ''}
                            ${test.status === 'Warning' ? 'text-yellow-400' : ''}
                          `}>
                            {test.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">{test.type}</td>
                      <td className="py-4">{test.lastRun}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;