import React, { useState, useRef, ChangeEvent } from 'react';
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
  Upload,
  X,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TestResults {
  [key: string]: any;
}

function Tests() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documentText, setDocumentText] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setDocumentText('');
    setWebsiteUrl('');
    setAttachedFiles([]);
    setTestResults(null);
  };

  const handleGenerateTests = async () => {
    try {
      setIsLoading(true);
      
      // Prepare the data to send to the backend
      const formData = new FormData();
      formData.append('websiteUrl', websiteUrl);
      formData.append('documentText', documentText);
      // Add any attached files
      attachedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      // Send the data to the backend
      const response = await fetch('http://localhost:5000/api/generate-tests', {
        method: 'POST',
        body: formData,
      });
      console.log(websiteUrl, documentText);

      if (!response.ok) {
        throw new Error('Failed to generate tests');
      }

      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Error generating tests:', error);
    } finally {
      setIsLoading(false);
    }
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
              { icon: <PlayCircle className="h-5 w-5" />, label: 'Tests', path: '/tests', active: true },
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

      <div className="flex-1">
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

        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create New Test</h1>
            <p className="text-gray-400">Upload your functional requirements specification to generate tests</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="website-url" className="block text-sm font-medium text-gray-400 mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="website-url"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="Enter the website URL to test..."
                    className="pl-10 pr-4 py-2 w-full bg-[#222] text-gray-300 rounded-lg border border-gray-800 focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
              </div>

              <textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder="Paste or Attach Your Functional Requirement Specification (FRS) Document Here..."
                className="w-full h-64 bg-[#222] text-gray-300 p-4 rounded-lg border border-gray-800 focus:outline-none focus:border-[#a855f7] resize-none"
              />
              
              <div className="mt-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#222] text-gray-300 rounded-lg border border-gray-800 hover:border-[#a855f7] transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span>Attach Files</span>
                </button>
              </div>

              {attachedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-white font-medium">Attached Files:</h3>
                  <div className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#222] p-2 rounded-lg"
                      >
                        <span className="text-gray-300">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                <button 
                  onClick={handleGenerateTests}
                  disabled={isLoading}
                  className={`px-6 py-2 bg-[#a855f7] text-white rounded-lg transition-colors ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#9333ea]'
                  }`}
                >
                  {isLoading ? 'Generating...' : 'Generate Tests'}
                </button>
                <button 
                  onClick={handleClear}
                  className="px-6 py-2 bg-[#222] text-gray-300 rounded-lg border border-gray-800 hover:border-[#a855f7] transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {testResults && (
            <div className="mt-8 bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Generated Tests</h2>
                <div className="space-y-4">
                  <pre className="bg-[#222] p-4 rounded-lg overflow-x-auto text-gray-300">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Tests;