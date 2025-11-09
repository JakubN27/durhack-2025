import serverless from 'serverless-http'
import app from './server.js'

const handler = serverless(app, {
  basePath: '/api'
})

export default handler
