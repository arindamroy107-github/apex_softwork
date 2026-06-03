import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'ApexSoftworks API online' }))
    }
    if (route === '/root' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'ApexSoftworks API online' }))
    }

    // Create an inquiry - POST /api/inquiries
    if (route === '/inquiries' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const name = (body.name || '').toString().trim()
      const email = (body.email || '').toString().trim()
      const brief = (body.brief || '').toString().trim()

      if (!name || !email) {
        return handleCORS(NextResponse.json(
          { error: 'name and email are required' },
          { status: 400 }
        ))
      }

      const inquiry = {
        id: uuidv4(),
        name,
        email,
        brief,
        created_at: new Date().toISOString(),
      }

      await db.collection('inquiries').insertOne({ ...inquiry })
      return handleCORS(NextResponse.json({ ok: true, inquiry }, { status: 201 }))
    }

    // List inquiries - GET /api/inquiries
    if (route === '/inquiries' && method === 'GET') {
      const items = await db.collection('inquiries')
        .find({})
        .sort({ created_at: -1 })
        .limit(200)
        .toArray()
      const cleaned = items.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleaned))
    }

    // legacy status endpoints kept for template compatibility
    if (route === '/status' && method === 'POST') {
      const body = await request.json()
      if (!body.client_name) {
        return handleCORS(NextResponse.json({ error: 'client_name is required' }, { status: 400 }))
      }
      const statusObj = { id: uuidv4(), client_name: body.client_name, timestamp: new Date() }
      await db.collection('status_checks').insertOne(statusObj)
      return handleCORS(NextResponse.json(statusObj))
    }
    if (route === '/status' && method === 'GET') {
      const statusChecks = await db.collection('status_checks').find({}).limit(1000).toArray()
      const cleaned = statusChecks.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleaned))
    }

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
