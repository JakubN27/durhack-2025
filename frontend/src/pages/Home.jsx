import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-12rem)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to SkillSwap
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            AI-powered skill exchange platform. Learn from others, teach what you know.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 text-lg px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why SkillSwap?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">AI Matching</h3>
              <p className="text-gray-600">
                Our advanced AI pairs you with the perfect learning partners based on your skills and interests.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-3">Skill Legacy</h3>
              <p className="text-gray-600">
                Track your impact and see how your knowledge spreads through the community.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-3">Gamification</h3>
              <p className="text-gray-600">
                Earn badges and achievements as you help others learn and grow.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2">Sign Up</h4>
                <p className="text-sm text-gray-600">Create your account and tell us what you want to learn</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2">Get Matched</h4>
                <p className="text-sm text-gray-600">AI finds you the best learning partners</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2">Start Learning</h4>
                <p className="text-sm text-gray-600">Connect and exchange knowledge in real-time</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  4
                </div>
                <h4 className="font-semibold mb-2">Track Progress</h4>
                <p className="text-sm text-gray-600">See your impact and earn achievements</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-4">Ready to start your learning journey?</h2>
            <p className="text-xl text-gray-600 mb-8">Join thousands of learners and teachers today</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-10 py-4"
            >
              Join SkillSwap Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
