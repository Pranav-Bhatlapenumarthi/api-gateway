import { describe, it, expect, beforeEach } from "vitest";

import { ServiceRegistry } from "../../src/gateway/registry/serviceRegistry.js";
import { RouteResolver } from "../../src/gateway/router/routeResolver.js";

describe("RouteResolver", () => {
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

    resolver = new RouteResolver(registry);
  });

  it("should resolve an exact route", () => {
    const service = resolver.resolve("/users");
    expect(service?.name).toBe("user-service");
  });

  it("should resolve a nested route", () => {
    const service = resolver.resolve("/users/123");
    expect(service?.name).toBe("user-service");
  });

  it("should resolve another service", () => {
    const service = resolver.resolve("/orders/123");
    expect(service?.name).toBe("order-service");
  });

  it("should choose the longest matching prefix", () => {
    registry.register({
      name: "user-profile-service",
      prefix: "/users/profile",
      target: "http://localhost:3004",
      enabled: true,
    });
    const service = resolver.resolve("/users/profile/123");
    expect(service?.name).toBe("user-profile-service");
  });

  it("should return undefined for an unknown route", () => {
    const service = resolver.resolve("/products");
    expect(service).toBeUndefined();
  });

  it("should respect route boundaries", () => {
    registry.register({
      name: "user-admin-service",
      prefix: "/users-admin",
      target: "http://localhost:3004",
      enabled: true,
    });
    const service = resolver.resolve("/users-admin/123");
    expect(service?.name).toBe("user-admin-service");
  });

  it("should not match /users when path starts with /users-admin", () => {
    const service = resolver.resolve("/users-admin/123");
  
    expect(service?.name).not.toBe("user-service");
  });

  it("should handle trailing slashes consistently", () => {
    const service = resolver.resolve("/users/");
  
    expect(service?.name).toBe("user-service");
  });

  it("should resolve routes containing query parameters", () => {
    const service = resolver.resolve("/users/123?active=true");
    expect(service?.name).toBe("user-service");
  });

  it("should not resolve a disabled service", () => {
    registry.register({
      name: "admin-service",
      prefix: "/admin",
      target: "http://localhost:3003",
      enabled: false,
    });

    const service = resolver.resolve("/admin/users");

    expect(service).toBeUndefined();
  });
});