import statsCard from "./api/index.js";
import repoCard from "./api/pin.js";
import langCard from "./api/top-langs.js";
import wakatimeCard from "./api/wakatime.js";
import gistCard from "./api/gist.js";

const routes: Record<string, Function> = {
  "/": statsCard,
  "/pin": repoCard,
  "/top-langs": langCard,
  "/wakatime": wakatimeCard,
  "/gist": gistCard,
};

const port = Number(process.env.port) || 9000;

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const handler = routes[url.pathname];
    if (!handler) return new Response("Not Found", { status: 404 });

    const query: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (query[k] = v));

    const headers = new Headers();
    let body = "";

    await handler(
      { query },
      {
        setHeader: (k: string, v: string) => headers.set(k, v),
        send: (data: string) => {
          body = data;
        },
      },
    );

    return new Response(body, { headers });
  },
});

console.log(`Listening on http://localhost:${port}`);
