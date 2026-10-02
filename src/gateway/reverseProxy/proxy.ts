import type { Request, Response } from "express";
import { Readable } from "node:stream";
import type {
  ProxyOptions,
  ProxyTarget,
} from "./proxy.types.js";

export class ReverseProxy {
  private readonly timeout: number;
 
  constructor(options: ProxyOptions = {}) {
    this.timeout = options.timeout ?? 10_000;
  }

  async forward( req: Request,res: Response, target: ProxyTarget ): Promise<void> {
    const upstreamUrl = this.buildUpstreamUrl( target.target, req.originalUrl,);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {
      const headers = this.buildRequestHeaders(req);
      const method = req.method.toUpperCase();
      const hasBody: boolean | undefined = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

      // 1. Build the base options without the body property
      const fetchOptions: RequestInit & { duplex?: 'half' } = {
        method,
        headers,
        signal: controller.signal,
      };
      
      // 2. Only add the body if the request has one, and convert 'req' properly
      if (hasBody) {
        fetchOptions.body = Readable.toWeb(req) as unknown as BodyInit;
        fetchOptions.duplex = 'half';
      }
      
      const upstreamResponse = await fetch(upstreamUrl, fetchOptions);
      clearTimeout(timeout);

      // Forward upstream status code
      res.status(upstreamResponse.status);

      // Forward response headers
      this.forwardResponseHeaders(upstreamResponse.headers,res);

      // Forward response body
      if (upstreamResponse.body) {
        const responseStream = Readable.fromWeb(upstreamResponse.body as any);
        responseStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof Error && error.name === "AbortError") {
        if (!res.headersSent) {
          res.status(504).json({
            error: "Gateway Timeout",
            message: "Upstream service did not respond in time",
          });
        }

        return;
      }

      console.error("Reverse proxy error:", error);

      if (!res.headersSent) {
        res.status(502).json({
          error: "Bad Gateway",
          message: "Unable to reach upstream service",
        });
      }
    }
  }

  private buildUpstreamUrl(
    target: string,
    originalUrl: string,
  ): string {
    const baseUrl = target.endsWith("/")
      ? target.slice(0, -1)
      : target;

    const path = originalUrl.startsWith("/")
      ? originalUrl
      : `/${originalUrl}`;

    return `${baseUrl}${path}`;
  }

  private buildRequestHeaders(
    req: Request,
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    const hopByHopHeaders = new Set([
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailer",
      "transfer-encoding",
      "upgrade",
    ]);

    for (const [key, value] of Object.entries(req.headers)) {
      if (hopByHopHeaders.has(key.toLowerCase())) {
        continue;
      }

      if (value === undefined) {
        continue;
      }

      if (Array.isArray(value)) {
        headers[key] = value.join(", ");
      } else {
        headers[key] = value;
      }
    }

    return headers;
  }

  private forwardResponseHeaders(
    headers: Headers,
    res: Response,
  ): void {
    const hopByHopHeaders = new Set([
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailer",
      "transfer-encoding",
      "upgrade",
    ]);

    headers.forEach((value, key) => {
      if (hopByHopHeaders.has(key.toLowerCase())) {
        return;
      }

      res.setHeader(key, value);
    });
  }
}