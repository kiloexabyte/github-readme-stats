type ResponseFn = (config: {
  body: string;
  url: string;
  method: string;
}) => [number, any];

interface Handler {
  method: string;
  url: string | RegExp;
  response: [number, any] | ResponseFn | "networkError";
  once: boolean;
}

interface ChainMethods {
  onPost: (url: string | RegExp) => ReplyMethods;
  onGet: (url: string | RegExp) => ReplyMethods;
}

interface ReplyMethods {
  reply: (statusOrFn: number | ResponseFn, data?: any) => ChainMethods;
  replyOnce: (status: number, data: any) => ChainMethods;
  networkError: () => ChainMethods;
}

export default class FetchMock {
  private handlers: Handler[] = [];

  constructor() {
    global.fetch = this.mockFetch.bind(this) as typeof global.fetch;
  }

  onPost(url: string | RegExp): ReplyMethods {
    return this.createChain("POST", url);
  }

  onGet(url: string | RegExp): ReplyMethods {
    return this.createChain("GET", url);
  }

  private createChain(method: string, url: string | RegExp): ReplyMethods {
    const chainMethods: ChainMethods = {
      onPost: this.onPost.bind(this),
      onGet: this.onGet.bind(this),
    };

    return {
      reply: (statusOrFn: number | ResponseFn, data?: any) => {
        if (typeof statusOrFn === "function") {
          this.handlers.push({
            method,
            url,
            response: statusOrFn,
            once: false,
          });
        } else {
          this.handlers.push({
            method,
            url,
            response: [statusOrFn, data],
            once: false,
          });
        }
        return chainMethods;
      },
      replyOnce: (status: number, data: any) => {
        this.handlers.push({
          method,
          url,
          response: [status, data],
          once: true,
        });
        return chainMethods;
      },
      networkError: () => {
        this.handlers.push({
          method,
          url,
          response: "networkError",
          once: false,
        });
        return chainMethods;
      },
    };
  }

  reset(): void {
    this.handlers = [];
  }

  private async mockFetch(
    input: string | URL | Request,
    init?: globalThis.RequestInit,
  ): Promise<Response> {
    let url: string;
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.url;
    }
    const method = (init?.method || "GET").toUpperCase();

    const handlerIndex = this.handlers.findIndex((h) => {
      if (h.method !== method) {
        return false;
      }
      if (typeof h.url === "string") {
        return h.url === url;
      }
      return h.url.test(url);
    });

    if (handlerIndex === -1) {
      throw new TypeError(`No mock handler found for ${method} ${url}`);
    }

    const handler = this.handlers[handlerIndex];
    if (handler.once) {
      this.handlers.splice(handlerIndex, 1);
    }

    if (handler.response === "networkError") {
      throw new TypeError("Network Error");
    }

    let status: number;
    let body: any;

    if (typeof handler.response === "function") {
      const config = {
        body: (init?.body as string) || "",
        url,
        method,
      };
      [status, body] = handler.response(config);
    } else {
      [status, body] = handler.response;
    }

    const jsonStr = JSON.stringify(body);
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: "",
      json: async () => JSON.parse(jsonStr),
      text: async () => jsonStr,
    } as unknown as Response;
  }
}
