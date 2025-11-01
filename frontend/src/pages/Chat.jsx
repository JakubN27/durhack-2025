import { useParams } from 'react-router-dom'

export default function Chat() {
  const { matchId } = useParams()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat</h1>
      
      <div className="card">
        <p className="text-gray-600">Chat for match: {matchId}</p>
        <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
      </div>
    </div>
  )
}
