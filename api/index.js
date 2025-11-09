import serverless from 'serverless-http'
import app from './server.js'

const handler = serverless(app)

export default async function (req, res) {
  console.log('Original URL:', req.url)
  
  // Extract path parameter from Vercel routing
  const url = new URL(req.url, `https://${req.headers.host}`)
  const pathParam = url.searchParams.get('path')
  
  if (pathParam) {
    // Reconstruct the full /api/{path} URL
    const queryString = Array.from(url.searchParams.entries())
      .filter(([key]) => key !== 'path')
      .map(([key, val]) => `${key}=${val}`)
      .join('&')
    
    req.url = `/api/${pathParam}${queryString ? '?' + queryString : ''}`
    console.log('Reconstructed URL:', req.url)
  }
  
  return handler(req, res)
}
