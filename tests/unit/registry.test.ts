import { describe, it, expect, beforeEach } from "vitest";

import { ServiceRegistry } from "../../src/gateway/registry/serviceRegistry.js";
import type { Service } from "../../src/gateway/registry/service.model.js";

describe("ServiceRegistry", () => {
  let registry: ServiceRegistry;

  const userService: Service = {
    name: "user-service",
    prefix: "/users",
    target: "http://localhost:3001",
    enabled: true,
  };

  const orderService: Service = {
    name: "order-service",
    prefix: "/orders",
    target: "http://localhost:3002",
    enabled: true,
  };

  beforeEach(() => {
    registry = new ServiceRegistry();
  });

  it("should register a service", () => {
    registry.register(userService);
    const service = registry.get("user-service");
    expect(service).toEqual(userService);
  });

  it("should register multiple services", () => {
    registry.register(userService);
    registry.register(orderService);
    expect(registry.getAll()).toHaveLength(2);
  });

  it("should reject duplicate service names", () => {
    registry.register(userService);
    expect(() => {
      registry.register(userService);
    }).toThrow();
  });

  it("should reject duplicate route prefixes", () => {
    registry.register(userService);
    const anotherUserService: Service = {
      ...userService,
      name: "another-user-service",
      target: "http://localhost:4000",
    };

    expect(() => {
      registry.register(anotherUserService);
    }).toThrow();
  });

  it("should return undefined for an unknown service", () => {
    const service = registry.get("does-not-exist");
    expect(service).toBeUndefined();
  });

  it("should remove a registered service", () => {
    registry.register(userService);
    registry.remove("user-service");
    expect(registry.get("user-service")).toBeUndefined();
  });
});
