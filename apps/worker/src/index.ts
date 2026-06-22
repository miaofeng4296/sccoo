interface Env {
  TUNNEL_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // Forward to the tunnel
    const targetUrl = `https://${env.TUNNEL_URL}${url.pathname}${url.search}`;

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      });

      // Clone and return
      const resHeaders = new Headers(response.headers);
      resHeaders.set('x-proxied-by', 'cloudflare-worker');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });
    } catch (e) {
      return new Response(`Proxy Error: ${e}`, { status: 502 });
    }
  },
};
