import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from "vitest";

import express from "express";
import http from "node:http";

import { ReverseProxy } from "../../src/gateway/reverseProxy/proxy.js";

describe("ReverseProxy integration", () => {
  let upstreamServer: http.Server;
  let gatewayServer: http.Server;

  let upstreamPort: number;
  let gatewayPort: number;

  const proxy = new ReverseProxy({
    timeout: 5000,
  });

  beforeAll(async () => {
    /*
     * -------------------------
     * UPSTREAM SERVICE
     * -------------------------
     */

    const upstreamApp = express();

    upstreamApp.use(express.json());

    upstreamApp.get("/users/:id", (req, res) => {
      res.json({
        service: "user-service",
        userId: req.params.id,
      });
    });

    upstreamApp.post("/users", (req, res) => {
      res.status(201).json({
        service: "user-service",
        received: req.body,
      });
    });

    upstreamApp.get("/headers", (req, res) => {
      res.json({
        authorization: req.headers.authorization,
        requestId: req.headers["x-request-id"],
      });
    });

    upstreamServer = upstreamApp.listen(0);

    await new Promise<void>((resolve) => {
      upstreamServer.once("listening", () => {
        const address =
          upstreamServer.address();

        if (
          address &&
          typeof address !== "string"
        ) {
          upstreamPort = address.port;
        }

        resolve();
      });
    });

    /*
     * -------------------------
     * GATEWAY
     * -------------------------
     */

    const gatewayApp = express();

    gatewayApp.use((req, res) => {
      proxy.forward(req, res, {
        target: `http://localhost:${upstreamPort}`,
      });
    });

    gatewayServer = gatewayApp.listen(0);

    await new Promise<void>((resolve) => {
      gatewayServer.once("listening", () => {
        const address =
          gatewayServer.address();

        if (
          address &&
          typeof address !== "string"
        ) {
          gatewayPort = address.port;
        }

        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      upstreamServer.close(() => resolve());
    });

    await new Promise<void>((resolve) => {
      gatewayServer.close(() => resolve());
    });
  });

  it("should proxy a GET request", async () => {
    const response = await fetch(
      `http://localhost:${gatewayPort}/users/123`
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      service: "user-service",
      userId: "123",
    });
  });

  it("should proxy a POST request and forward the body", async () => {
    const response = await fetch(
      `http://localhost:${gatewayPort}/users`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Pranav",
          age: 20,
        }),
      }
    );

    expect(response.status).toBe(201);

    const body = await response.json();

    expect(body).toEqual({
      service: "user-service",
      received: {
        name: "Pranav",
        age: 20,
      },
    });
  });

  it("should preserve query parameters", async () => {
    const response = await fetch(
      `http://localhost:${gatewayPort}/users/123?active=true`
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      service: "user-service",
      userId: "123",
    });
  });

  it("should forward request headers", async () => {
    const response = await fetch(
      `http://localhost:${gatewayPort}/headers`,
      {
        headers: {
          Authorization: "Bearer test-token",
          "X-Request-ID": "abc-123",
        },
      }
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      authorization: "Bearer test-token",
      requestId: "abc-123",
    });
  });
});