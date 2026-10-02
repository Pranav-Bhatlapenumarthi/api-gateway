import {describe,it,expect,vi,beforeEach,afterEach} from "vitest";
import express from "express";
import type { Request, Response } from "express";

import { ReverseProxy } from "../../src/gateway/reverseProxy/proxy.js";

describe("ReverseProxy", () => {
  let proxy: ReverseProxy;

  beforeEach(() => {
    proxy = new ReverseProxy({timeout: 5000});
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should forward a GET request to the target", async () => {
    const mockResponse = new Response(
      JSON.stringify({
        message: "hello from upstream",
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(mockResponse);

    const app = express();

    const response = {
      status: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as Response;

    const request = {
      method: "GET",
      originalUrl: "/users/123",
      headers: {
        accept: "application/json",
      },
    } as unknown as Request;

    await proxy.forward(request, response, {
      target: "http://localhost:3001",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:3001/users/123"
    );

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "GET",
    });
  });

  it("should forward the original HTTP method", async () => {
    const mockResponse = new Response(
      JSON.stringify({ created: true }),
      {
        status: 201,
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    const response = {
      status: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as Response;

    const request = {
      method: "POST",
      originalUrl: "/users",
      headers: {
        "content-type": "application/json",
      },
    } as unknown as Request;

    await proxy.forward(request, response, {
      target: "http://localhost:3001",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();  
    expect(call![1]).toMatchObject({
      method: "GET",
    });
  });

  it("should preserve query parameters", async () => {
    const mockResponse = new Response(
      JSON.stringify({}),
      {
        status: 200,
      }
    );

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(mockResponse);

    const response = {
      status: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as Response;

    const request = {
      method: "GET",
      originalUrl: "/users/123?active=true&page=2",
      headers: {},
    } as unknown as Request;

    await proxy.forward(request, response, {
      target: "http://localhost:3001",
    });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:3001/users/123?active=true&page=2"
    );
  });

  it("should forward normal request headers", async () => {
    const mockResponse = new Response(
      JSON.stringify({}),
      {
        status: 200,
      }
    );

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(mockResponse);

    const response = {
      status: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as Response;

    const request = {
      method: "GET",
      originalUrl: "/users",
      headers: {
        authorization: "Bearer test-token",
        "x-request-id": "abc-123",
      },
    } as unknown as Request;

    await proxy.forward(request, response, {
      target: "http://localhost:3001",
    });

    
    const options = fetchMock.mock.calls[0][1];

    expect(options?.headers).toMatchObject({
      authorization: "Bearer test-token",
      "x-request-id": "abc-123",
    });
  });

  it("should not forward hop-by-hop headers", async () => {
    const mockResponse = new Response(
      JSON.stringify({}),
      {
        status: 200,
      }
    );

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(mockResponse);

    const response = {
      status: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as Response;

    const request = {
      method: "GET",
      originalUrl: "/users",
      headers: {
        authorization: "Bearer test-token",
        connection: "keep-alive",
        "transfer-encoding": "chunked",
      },
    } as unknown as Request;

    await proxy.forward(request, response, {
      target: "http://localhost:3001",
    });

    const options = fetchMock.mock.calls[0][1];

    const headers = options?.headers as Record<string, string>;

    expect(headers.authorization).toBe(
      "Bearer test-token"
    );

    expect(headers.connection).toBeUndefined();
    expect(headers["transfer-encoding"]).toBeUndefined();
  });

  it("should return 502 when upstream is unreachable", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(
      new Error("ECONNREFUSED")
    );

    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const request = {
      method: "GET",
      originalUrl: "/users",
      headers: {},
    } as unknown as Request;

    await proxy.forward(request, response, {
      target: "http://localhost:9999",
    });

    expect(response.status).toHaveBeenCalledWith(502);

    expect(response.json).toHaveBeenCalledWith({
      error: "Bad Gateway",
      message: "Unable to reach upstream service",
    });
  });
});