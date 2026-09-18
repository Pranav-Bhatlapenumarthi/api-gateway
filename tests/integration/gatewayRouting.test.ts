import { describe, it, expect, beforeEach } from "vitest";

import { ServiceRegistry } from "../../src/gateway/registry/serviceRegistry.js";
import { RouteResolver } from "../../src/gateway/router/routeResolver.js";

describe("Gateway routing integration", () => {
  let registry: ServiceRegistry;
  let resolver: RouteResolver;

  beforeEach(() => {
    registry = new ServiceRegistry();

    registry.register({
      name: "user-service",
      prefix: "/users",
      target: "http://localhost:3001",
      enabled: true,
    });

    registry.register({
      name: "order-service",
      prefix: "/orders",
      target: "http://localhost:3002",
      enabled: true,
    });

    registry.register({
      name: "admin-service",
      prefix: "/admin",
      target: "http://localhost:3003",
      enabled: true,
    });

    resolver = new RouteResolver(registry);
  });

  it("should route user requests to user-service", () => {
    const service = resolver.resolve("/users/123");

    expect(service).toMatchObject({
      name: "user-service",
      prefix: "/users",
      target: "http://localhost:3001",
      enabled: true,
    });
  });

  it("should route order requests to order-service", () => {
    const service = resolver.resolve("/orders/456");

    expect(service).toMatchObject({
      name: "order-service",
      prefix: "/orders",
      target: "http://localhost:3002",
      enabled: true,
    });
  });

  it("should route admin requests to admin-service", () => {
    const service = resolver.resolve("/admin/users");

    expect(service).toMatchObject({
      name: "admin-service",
      prefix: "/admin",
      target: "http://localhost:3003",
      enabled: true,
    });
  });

  it("should return no service for an unknown route", () => {
    const service = resolver.resolve("/products");

    expect(service).toBeUndefined();
  });

  it("should select the most specific service", () => {
    registry.register({
      name: "user-profile-service",
      prefix: "/users/profile",
      target: "http://localhost:3004",
      enabled: true,
    });

    const service = resolver.resolve("/users/profile/123");

    expect(service?.name).toBe("user-profile-service");
  });

  it("should not route requests to disabled services", () => {
    registry.register({
      name: "payment-service",
      prefix: "/payments",
      target: "http://localhost:3005",
      enabled: false,
    });

    const service = resolver.resolve("/payments/123");

    expect(service).toBeUndefined();
  });
});