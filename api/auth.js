export const config = { runtime: 'edge' }

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })

  try {
    const { username, password } = await req.json()

    const validUser = process.env.APP_USERNAME
    const validPass = process.env.APP_PASSWORD

    if (!validUser || !validPass) {
      return new Response(JSON.stringify({ error: '系統未設定帳號密碼' }), { status: 500, headers: corsHeaders })
    }

    if (username !== validUser || password !== validPass) {
      // Add small delay to prevent brute force
      await new Promise(r => setTimeout(r, 800))
      return new Response(JSON.stringify({ error: '帳號或密碼錯誤' }), { status: 401, headers: corsHeaders })
    }

    // Generate a session token using timestamp + secret
    const secret = process.env.SESSION_SECRET || 'default-secret-change-me'
    const payload = `${username}:${Date.now()}:${secret}`
    const encoder = new TextEncoder()
    const data = encoder.encode(payload)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return new Response(JSON.stringify({ success: true, token }), { headers: corsHeaders })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
}
