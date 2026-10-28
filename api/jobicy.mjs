const allowedParameters = ['count', 'geo', 'industry', 'tag', 'cursor']

export default {
  async fetch(request) {
    if (request.method !== 'GET') {
      return Response.json({ error: 'Only GET requests are supported.' }, { status: 405, headers: { Allow: 'GET' } })
    }

    const incoming = new URL(request.url)
    const query = new URLSearchParams()
    for (const key of allowedParameters) {
      const value = incoming.searchParams.get(key)
      if (value) query.set(key, value.slice(0, 300))
    }

    try {
      const upstream = await fetch(`https://jobicy.com/api/jobs?${query.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12000),
      })
      return new Response(await upstream.arrayBuffer(), {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=900',
        },
      })
    } catch {
      return Response.json({ success: false, error: 'The Jobicy jobs feed is temporarily unavailable.' }, { status: 502 })
    }
  },
}
