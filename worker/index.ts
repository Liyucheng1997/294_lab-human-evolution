interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const assetResponse = await env.ASSETS.fetch(request);

    if ((url.pathname === "/" || url.pathname === "/index.html") && assetResponse.ok) {
      const html = await assetResponse.text();
      return new Response(html.replaceAll("__SITE_ORIGIN__", url.origin), {
        status: assetResponse.status,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-cache",
        },
      });
    }

    return assetResponse;
  },
};
