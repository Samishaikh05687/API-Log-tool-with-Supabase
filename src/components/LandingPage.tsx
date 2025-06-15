import { Activity, Shield, BarChart3, Zap, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Real-time API Monitoring",
      description: "Track all your API calls with detailed request/response logging and performance metrics."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Advanced Debugging",
      description: "Intercept, replay, and modify API requests to debug issues faster than ever."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Get insights into response times, error rates, and usage patterns with beautiful dashboards."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Mock API Generation",
      description: "Generate mock responses from real API calls for testing and development."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Share API logs and insights with your team for better collaboration."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Export & Integration",
      description: "Export logs in multiple formats and integrate with your existing tools."
    }
  ]

  const testimonials = [
    {
      name: "Aman Gupta",
      role: "Senior Developer at TechCorp",
      content: "API Logger Pro has revolutionized how we debug and monitor our APIs. The real-time insights are invaluable."
    },
    {
      name: "Nikita Rai",
      role: "DevOps Engineer at StartupXYZ",
      content: "The performance monitoring features helped us identify bottlenecks we never knew existed."
    },
    {
      name: "Naziya Ali",
      role: "Full Stack Developer",
      content: "The mock generation feature saves us hours of development time. Absolutely essential tool."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-70 to-orange-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">API Logger Pro</h1>
                <p className="text-xs text-orange-600">Professional API Monitoring</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Now with Real-time Monitoring
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Monitor & Debug
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-orange-300 to-orange-600">
              Your APIs
            </span>
            Like a Pro
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            The most powerful API logging and debugging tool for modern developers.
            Track, analyze, and optimize your API performance with real-time insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 rounded-full to-orange-600 text-white  hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg font-semibold flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 rounded-full border-2 border-gray-200 hover:border-orange-300 transition-all duration-200 text-lg font-semibold">
              Watch Demo
            </button>
          </div>

          <div className="mt-16 flex justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex mb-16">
            <div>

                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                All-in-one platform for effortless API monitoring and debugging
                </h2>

            </div>
            <div className=''>
              <p className="text-xl text-gray-600 text-start max-w-3xl mx-auto"> Comprehensive tools for API monitoring, debugging, and optimization.Dramatically reintermediate effective applications
                after high-payoff core competence.</p>
              <button className='border  px-3 rounded-full py-2 mt-6 border-gray-200 hover:border-orange-300 transition-all duration-200'>Learn More</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-white to-orange-50 rounded-2xl border border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-serif text-gray-900 mb-4">
              Trusted by 250+ developers worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about API Logger Pro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-orange-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif text-white mb-6">
            Ready to supercharge your API development?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of developers who trust API Logger Pro for their API monitoring needs.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-white text-orange-600 rounded-full hover:scale-105 hover:bg-gray-50 transition-all duration-100 shadow-xl hover:shadow-2xl text-lg font-semibold"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">API Logger Pro</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 API Logger Pro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}