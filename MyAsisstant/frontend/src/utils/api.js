const API_BASE = '/api'

export async function sendMessage(question, sessionId) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, sessionId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Something went wrong' }))
    throw new Error(err.message || 'Failed to get response')
  }

  return res.json()
}
