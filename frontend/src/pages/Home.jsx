import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-12rem)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700" />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(59,156,122,0.45), transparent 45%), radial-gradient(circle at 80% 0%, rgba(68,189,153,0.3), transparent 40%)' }} />
        <div className="relative max-w-5xl mx-auto text-center text-white space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            Skill Exchange Reinvented
          </span>
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight">
            Grow faster with curated, AI-powered mentorship
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/80">
            SkillSwap matches you with peers who complement your strengths, helps you coach like a pro, and keeps momentum with intelligent nudges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-base md:text-lg"
            >
              Sign up now
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost text-base md:text-lg"
            >
              Preview the experience
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Why SkillSwap?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center shadow-primary-900/30">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">AI Matching</h3>
              <p className="text-sm text-slate-600">
                Our adaptive graph looks beyond keywords to pair you with partners who unlock the next level.
              </p>
            </div>
            
            <div className="card text-center shadow-primary-900/30">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-3">Skill Legacy</h3>
              <p className="text-sm text-slate-600">
                Watch your knowledge ripple through the community with beautifully visualized impact trails.
              </p>
            </div>
            
            <div className="card text-center shadow-primary-900/30">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-3">Gamification</h3>
              <p className="text-sm text-slate-600">
                Earn beautifully crafted badges and unlock studio passes as you mentor and grow together.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 text-white backdrop-blur">
            <h2 className="text-3xl font-bold text-center mb-8">How SkillSwap flows</h2>
            <div className="grid md:grid-cols-4 gap-6 text-left">
              {[{
                step: 'Sign up',
                copy: 'Tell us what you love teaching and where you want to level up.'
              }, {
                step: 'Get paired',
                copy: 'Our graph balances skills, goals, and cadence to find your perfect partner.'
              }, {
                step: 'Co-create',
                copy: 'Run live sessions, swap resources, and capture breakthroughs in one workspace.'
              }, {
                step: 'See the ripple',
                copy: 'Track impact, unlock achievements, and let the AI steer your next move.'
              }].map((item, index) => (
                <div key={item.step} className="space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg font-semibold">
                    {index + 1}
                  </div>
                  <h4 className="text-xl font-semibold text-white">{item.step}</h4>
                  <p className="text-sm text-white/75">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to swap skills and grow together?</h2>
            <p className="text-xl text-white/70 mb-8">Join a curated waitlist of mentors and learners who trade their strengths, elevate new abilities, and keep the exchange balanced.</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-10 py-4"
            >
              Join SkillSwap
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
