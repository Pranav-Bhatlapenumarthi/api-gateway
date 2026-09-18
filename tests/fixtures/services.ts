import type { Service } from "../../src/gateway/registry/service.model.js";

export const userService: Service = {
  name: "user-service",
  prefix: "/users",
  target: "http://localhost:3001",
  enabled: true,
};

export const orderService: Service = {
  name: "order-service",
  prefix: "/orders",
  target: "http://localhost:3002",
  enabled: true,
};

export const adminService: Service = {
  name: "admin-service",
  prefix: "/admin",
  target: "http://localhost:3003",
  enabled: true,
};