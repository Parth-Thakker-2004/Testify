import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Beaker,
  Search,
  Settings,
  Bell,
  User,
  Layout,
  PlayCircle,
  History,
  BarChart3,
  FileText,
  Settings2,
  LayoutList,
  Terminal,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TestDetails = {
  name?: string;
  status?: string;
  steps?: string[];
  issues?: string[];
};

function Analytics() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'log' | 'formatted'>('log');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        console.log("Fetching analytics data...");
        
        const response = await axios.get('http://localhost:5000/api/get-analytics');
        
        console.log("API Response:", response.data);
        setAnalyticsData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to fetch analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

  
    fetchAnalyticsData();
  }, []);

  // useEffect(() => {
  //   // Comment this to use mock data instead
  //   // fetchAnalyticsData();
    
  //   // Uncomment to use mock data
  //   setAnalyticsData({
  //     totalTestsGenerated: 5,
  //     successfulTests: 3,
  //     failedTests: 2,
  //     lastGenerated: new Date().toISOString(),
  //     sourceFile: "playwright_tests.json",
  //     baseUrl: "https://krishi-mitra-front.vercel.app/",
  //     status: "Test execution completed",
  //     tests: [/* your test data here */],
  //     observations: [/* your observations here */],
  //     logContent: "Test log content here"
  //   });
  //   setLoading(false);
  // }, []);

  const logContent = analyticsData?.logContent || `NA`;

  // temp testing
  const formattedContent = analyticsData ? {
    summary: {
      totalTests: analyticsData.totalTestsGenerated || 0,
      successfulTests: analyticsData.successfulTests || 0,
      failedTests: analyticsData.failedTests || 0,
      lastGenerated: analyticsData.lastGenerated || new Date().toISOString(),
      sourceFile: analyticsData.sourceFile || "playwright_tests.json",
      baseUrl: analyticsData.baseUrl || "https://example.com",
      status: analyticsData.status || "Test execution completed."
    },
    tests: analyticsData.tests || [],
    observations: analyticsData.observations || []
  } : {
    summary: {
      totalTests: 4,
      sourceFile: "playwright_tests.json",
      baseUrl: "https://krishi-mitra-front.vercel.app/",
      status: "All tests passed, but there are navigation issues during authentication."
    },
    tests: [
      {
        name: "Landing Page - Verify 'Fresh From Farm to Table' text",
        status: "Passed",
        steps: [
          "Navigated to the base URL",
          "Verified that the 'Fresh From Farm to Table' text is visible"
        ]
      },
      {
        name: "Landing Page - Verify 'Let's Get Started' button redirects to /auth",
        status: "Passed",
        steps: [
          "Navigated to the base URL",
          "Clicked the 'Let's Get Started' button"
        ],
        issues: [
          "The navigation after clicking the button resulted in the URL 'https://krishi-mitra-front.vercel.app/autth' instead of 'https://krishi-mitra-front.vercel.app/auth'"
        ]
      }
    ],
    observations: [
      "There's a consistent issue with the navigation after the 'Let's Get Started' button click and login attempts",
      "The URL in the logs shows 'autth' instead of 'auth' or 'shop'",
      "This suggests a potential bug in the website's routing or a typo in the test setup"
    ]
  };

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
              { icon: <Layout className="h-5 w-5" />, label: 'Dashboard', path: '/dashboard' },
              { icon: <PlayCircle className="h-5 w-5" />, label: 'Tests', path: '/tests' },
              { icon: <History className="h-5 w-5" />, label: 'History', path: '/history' },
              { icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics', path: '/analytics', active: true },
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

      <div className="flex-1">
        <header className="bg-[#1a1a1a] border-b border-gray-800">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search analytics..."
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

        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Test Results</h1>
              <p className="text-gray-400">View detailed test execution logs and analysis</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('log')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'log'
                    ? 'bg-[#a855f7] text-white'
                    : 'bg-[#222] text-gray-400 hover:text-white'
                }`}
              >
                <Terminal className="h-4 w-4" />
                <span>Log View</span>
              </button>
              <button
                onClick={() => setViewMode('formatted')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'formatted'
                    ? 'bg-[#a855f7] text-white'
                    : 'bg-[#222] text-gray-400 hover:text-white'
                }`}
              >
                <LayoutList className="h-4 w-4" />
                <span>Formatted View</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center">
                <Loader className="h-10 w-10 text-[#a855f7] animate-spin mb-4" />
                <p className="text-gray-400">Loading analytics data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-[#1a1a1a] rounded-xl border border-red-800 p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#a855f7] text-white rounded-lg hover:bg-[#9333ea]"
              >
                Retry
              </button>
            </div>
          ) : viewMode === 'log' ? (
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
              <pre className="p-6 text-gray-300 font-mono text-sm whitespace-pre-wrap">
                {logContent}
              </pre>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h3 className="text-gray-400 mb-2">Total Tests</h3>
                  <p className="text-2xl font-bold text-white">{formattedContent.summary.totalTests}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h3 className="text-gray-400 mb-2">Successful</h3>
                  <p className="text-2xl font-bold text-green-400">{formattedContent.summary.successfulTests || 0}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h3 className="text-gray-400 mb-2">Failed</h3>
                  <p className="text-2xl font-bold text-red-400">{formattedContent.summary.failedTests || 0}</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                  <h3 className="text-gray-400 mb-2">Last Generated</h3>
                  <p className="text-md font-bold text-white">
                    {new Date(formattedContent.summary.lastGenerated).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Test Execution Summary</h2>
                <div className="space-y-2">
                  <p className="text-gray-300">Total Tests Run: {formattedContent.summary.totalTests}</p>
                  <p className="text-gray-300">Source File: {formattedContent.summary.sourceFile}</p>
                  <p className="text-gray-300">Base URL: {formattedContent.summary.baseUrl}</p>
                  <p className="text-gray-300">Status: {formattedContent.summary.status}</p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Test Details</h2>
                <div className="space-y-6">
                    {formattedContent.tests && formattedContent.tests.length > 0 ? (
                    formattedContent.tests.map((test: TestDetails, index: number) => (
                      <div key={index} className="border-t border-gray-800 pt-4 first:border-0 first:pt-0">
                      <h3 className="text-lg font-medium text-white mb-2">{test.name || 'Unnamed Test'}</h3>
                      <p className={`mb-2 ${test.status === 'Passed' ? 'text-green-400' : 'text-red-400'}`}>
                        Status: {test.status || 'Unknown'}
                      </p>
                      <div className="space-y-1">
                        <p className="text-gray-400">Steps:</p>
                        <ul className="list-disc list-inside text-gray-300 ml-4">
                        {Array.isArray(test.steps) && test.steps.length > 0 ? (
                          test.steps.map((step: string, stepIndex: number) => (
                          <li key={stepIndex}>{step}</li>
                          ))
                        ) : (
                          <li>No steps recorded</li>
                        )}
                        </ul>
                        {Array.isArray(test.issues) && test.issues.length > 0 && (
                        <div className="mt-2">
                          <p className="text-yellow-400">Issues:</p>
                          <ul className="list-disc list-inside text-gray-300 ml-4">
                          {test.issues.map((issue: string, issueIndex: number) => (
                            <li key={issueIndex}>{issue}</li>
                          ))}
                          </ul>
                        </div>
                        )}
                      </div>
                      </div>
                    ))
                    ) : (
                    <p className="text-gray-400">No test details available.</p>
                    )}
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Important Observations</h2>
                {Array.isArray(formattedContent.observations) && formattedContent.observations.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-300 ml-4">
                    {formattedContent.observations.map((observation, index) => (
                      <li key={index}>{observation}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No observations recorded.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Analytics;