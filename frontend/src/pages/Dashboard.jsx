export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Active Matches</h3>
          <p className="text-4xl font-bold text-primary-600">0</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Points</h3>
          <p className="text-4xl font-bold text-primary-600">0</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Skills Taught</h3>
          <p className="text-4xl font-bold text-primary-600">0</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button className="btn-primary w-full">Complete Your Profile</button>
          <button className="btn-secondary w-full">Find Matches</button>
        </div>
      </div>
    </div>
  )
}
