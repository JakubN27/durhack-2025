import serverless from 'serverless-http'
import app from './backend/server.js'

const handler = serverless(app)

export default async function (req, res) {
  // serverless-http returns a handler compatible with Node.js req/res
  return handler(req, res)
}
