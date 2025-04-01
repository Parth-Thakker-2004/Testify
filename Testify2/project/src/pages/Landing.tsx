import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker, 
  Zap, 
  Link, 
  FileBarChart, 
  ChevronRight,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#111]">
      {/* Header/Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#111] opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20" />
        
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Beaker className="h-8 w-8 text-[#a855f7]" />
              <span className="ml-2 text-2xl font-bold text-white">Testify</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-400 hover:text-[#a855f7] transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-[#a855f7] transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-400 hover:text-[#a855f7] transition-colors">Pricing</a>
            </div>
            <button 
              onClick={handleGetStarted}
              className="bg-[#a855f7] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#9333ea] transition-all"
            >
              Sign In
            </button>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Go Beyond
              <br />
              <span className="text-[#a855f7]">Testing</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Keep your applications secure and reliable with AI-powered testing tools built for the modern world of development.
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-[#a855f7] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#9333ea] transition-all inline-flex items-center"
            >
              Try Testify for Free
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need for reliable testing
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features that make testing easier and more efficient
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Beaker className="h-8 w-8 text-[#a855f7]" />,
                title: "Automated Test Generation",
                description: "AI-powered test case generation based on your website structure"
              },
              {
                icon: <Zap className="h-8 w-8 text-[#a855f7]" />,
                title: "Quick Results",
                description: "Get comprehensive test results in minutes, not hours"
              },
              {
                icon: <Link className="h-8 w-8 text-[#a855f7]" />,
                title: "Easy Integration",
                description: "Seamlessly integrate with your existing development workflow"
              },
              {
                icon: <FileBarChart className="h-8 w-8 text-[#a855f7]" />,
                title: "Detailed Reports",
                description: "Get actionable insights with detailed test reports"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-[#222] p-8 rounded-xl border border-gray-800 hover:border-[#a855f7] transition-colors duration-300"
              >
                <div className="bg-[#2a2a2a] w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-24 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How Testify Works
            </h2>
            <p className="text-xl text-gray-400">
              Four simple steps to automated testing success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Connect Website",
                description: "Simply provide your website URL or API endpoint"
              },
              {
                step: "2",
                title: "Generate Tests",
                description: "Our AI analyzes your site and creates test cases"
              },
              {
                step: "3",
                title: "Run Tests",
                description: "Execute tests across multiple browsers and devices"
              },
              {
                step: "4",
                title: "Get Results",
                description: "Review detailed reports and fix issues"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-[#222] p-8 rounded-xl border-2 border-gray-800 hover:border-[#a855f7] transition-colors duration-300">
                  <div className="text-4xl font-bold text-[#a855f7] mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-gray-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by developers worldwide
            </h2>
            <p className="text-xl text-gray-400">
              See what our customers have to say about Testify
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Testify has completely transformed our testing process. We've cut our QA time in half.",
                author: "Sarah Chen",
                role: "Lead Developer at TechCorp"
              },
              {
                quote: "The automated test generation is incredible. It catches edge cases we wouldn't have thought of.",
                author: "Michael Rodriguez",
                role: "CTO at StartupX"
              },
              {
                quote: "Easy to set up, powerful features, and great support. Exactly what we needed.",
                author: "Emily Thompson",
                role: "QA Manager at DevFlow"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-[#222] p-8 rounded-xl border border-gray-800">
                <div className="flex items-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <CheckCircle2 key={star} className="h-5 w-5 text-[#a855f7] mr-1" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#222] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your testing process?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of developers who trust Testify for their testing needs.
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-[#a855f7] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#9333ea] transition-all inline-flex items-center"
            >
              Get Started Free
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#111] text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Beaker className="h-8 w-8 text-[#a855f7]" />
                <span className="ml-2 text-2xl font-bold text-white">Testify</span>
              </div>
              <p>Automated testing platform for modern web applications.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-[#a855f7] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>© 2024 Testify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;