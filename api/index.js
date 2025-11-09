import serverless from 'serverless-http'
import app from '../backend/server.js'

const handler = serverless(app)

export default async function (req, res) {
  // Log to debug what Vercel sends us
  console.log('Received request:', {
    url: req.url,
    method: req.method,
    headers: req.headers
  })
  
  return handler(req, res)
}
