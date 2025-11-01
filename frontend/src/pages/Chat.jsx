import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

const demoMessages = [
  {
    id: 1,
    author: 'You',
  timestamp: 'Today at 9:12 AM',
    content: 'Thanks for sharing that resource yesterday. I tried the exercise you suggested and it clicked!'
  },
  {
    id: 2,
    author: 'Amelia',
  timestamp: 'Today at 9:18 AM',
    content: 'Love to hear it! Want to dive into motion planning today? I can prep a short walkthrough.'
  },
  {
    id: 3,
    author: 'You',
  timestamp: 'Today at 9:22 AM',
    content: 'Absolutely. I will bring the prototype we discussed so we can apply it live.'
  },
]

const chatTips = [
  'Summarise takeaways at the end of each session so the AI can track your streak.',
  'Share resources directly in chat to build your shared knowledge library.',
  'Log blockers so the AI can suggest mentors who have solved similar challenges.',
]

export default function Chat() {
  const { matchId } = useParams()

  const matchName = useMemo(() => {
    if (!matchId) return 'Your match'
    return `Match ${matchId}`
  }, [matchId])

  return (
    <div className="px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-primary-950 via-primary-900 to-primary-700 p-10 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">Live collaboration</p>
              <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Keep the momentum with {matchName}</h1>
              <p className="mt-4 max-w-2xl text-white/80">
                Use this space to trade insights, drop resources, and capture breakthroughs. The AI watches context to
                tailor future learning nudges for both of you.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 text-sm backdrop-blur">
              <div className="flex items-center justify-between text-white/80">
                <span>Session streak</span>
                <span className="text-lg font-semibold">6 days</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/20">
                <div className="h-1.5 w-4/5 rounded-full bg-white" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-wide text-white/70">Next milestone: 10 day learning streak</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="card flex h-full flex-col gap-6">
            <header className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{matchName}</h2>
                <p className="text-sm text-slate-500">AI cohort pairing - shared focus on motion design</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-600">
                <span className="rounded-full bg-primary-50 px-3 py-1">Live soon</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">15 min</span>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded-2xl bg-slate-50 p-4">
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {demoMessages.map((message) => (
                  <div key={message.id} className={`max-w-xl rounded-2xl px-4 py-3 shadow-sm ${message.author === 'You' ? 'ml-auto bg-primary-500 text-white' : 'bg-white text-slate-700'}`}>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{message.author}</span>
                      <span className={message.author === 'You' ? 'text-white/80' : 'text-slate-400'}>{message.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <label htmlFor="chat-message" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Compose reply
                </label>
                <textarea
                  id="chat-message"
                  className="mt-2 h-28 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Share notes, drop a resource link, or capture next steps."
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Attachments - 0</span>
                    <span>AI summary ready</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm">Preview AI summary</button>
                    <button className="btn-primary text-sm">Send message</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="card space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Session plan</h2>
              <p className="mt-1 text-sm text-slate-500">AI suggests covering these checkpoints today.</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                  <div>
                    <p className="font-semibold text-slate-800">Review yesterday's prototype feedback</p>
                    <p className="text-slate-500">Identify two moments to add micro-interactions</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                  <div>
                    <p className="font-semibold text-slate-800">Share Figma component library tips</p>
                    <p className="text-slate-500">Document reusable easing presets together</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                  <div>
                    <p className="font-semibold text-slate-800">Capture key learnings</p>
                    <p className="text-slate-500">Post-session AI summary will highlight commitments</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Conversation tips</h3>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                {chatTips.map((tip) => (
                  <li key={tip} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    - {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-5 text-sm text-primary-700">
              Next: enable real-time co-editing so you can sketch alongside your match without leaving SkillSwap.
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}
