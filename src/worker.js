// alturainvestama.com menyajikan versi akar dari public/site/; domain lain (qilo.one) lewat apa adanya.
const ROOT_PREFIX = "/site";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.hostname.endsWith("alturainvestama.com")) return env.ASSETS.fetch(request);
    url.pathname = ROOT_PREFIX + url.pathname;
    const res = await env.ASSETS.fetch(new Request(url, request));
    const loc = res.headers.get("Location");
    if (res.status >= 300 && res.status < 400 && loc) {
      const out = new Response(null, res);
      const target = new URL(loc, url);
      if (target.pathname.startsWith(ROOT_PREFIX + "/")) target.pathname = target.pathname.slice(ROOT_PREFIX.length);
      out.headers.set("Location", target.pathname + target.search);
      return out;
    }
    return res;
  },
};
