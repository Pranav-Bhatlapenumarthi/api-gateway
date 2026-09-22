# api-gateway

A production-oriented **API Gateway built from scratch with TypeScript and Express.js**.

The project is designed to explore the internals of API gateways and progressively implement features such as service discovery, route resolution, reverse proxying, authentication, rate limiting, caching, load balancing, circuit breaking, and observability.

> **Status:** 🚧 In active development

---

## Overview

An API Gateway acts as the single entry point between clients and a collection of backend services.

Instead of clients communicating directly with individual microservices:

```text
Client
  │
  ├──────────► User Service
  ├──────────► Product Service
  └──────────► Payment Service
```

the gateway provides a unified entry point:

```text
                    ┌─────────────────┐
                    │      Client     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   API Gateway   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        User Service   Product Service  Payment Service
```

The gateway will eventually be responsible for concerns such as:

* Request routing
* Reverse proxying
* Authentication and authorization
* Rate limiting
* Response caching
* Load balancing
* Retries and timeouts
* Circuit breaking
* Service discovery
* Request logging
* Metrics and tracing

The project is being implemented incrementally, with each major capability isolated into its own module.

---

# Why Build an API Gateway From Scratch?

Existing API gateways such as NGINX, Kong, Envoy, and cloud-managed gateways already solve many of these problems.

The goal of this project isn't to replace them.

The goal is to understand **how the underlying mechanisms work** by implementing a simplified gateway ourselves.

---

# Goals

The primary goals of this project are to:

* Understand how API gateways work internally
* Build a reverse proxy from the ground up
* Learn practical distributed-systems concepts
* Design modular and testable backend components
* Explore reliability patterns used in production systems
* Build a backend infrastructure project rather than a traditional CRUD application
* Develop strong system-design and backend-engineering fundamentals

---

# Tech Stack

| Technology | Purpose                                   |
| ---------- | ----------------------------------------- |
| TypeScript | Primary programming language              |
| Node.js    | Runtime                                   |
| Express.js | HTTP server framework                     |
| npm        | Package management                        |
| PostgreSQL | Persistent storage *(planned)*            |
| Redis      | Caching and rate limiting *(planned)*     |
| Prisma     | Database access *(planned)*               |
| Zod        | Runtime configuration and data validation |
| Pino       | Structured logging                        |
| Vitest     | Unit and integration testing              |
| Docker     | Containerization *(planned)*              |
| Prometheus | Metrics *(planned)*                       |
| Grafana    | Monitoring dashboards *(planned)*         |

---

# Architecture

The gateway is being designed around small components with clearly defined responsibilities.

The eventual architecture will evolve toward:

```text
                         Client
                           │
                           ▼
                  ┌──────────────────┐
                  │    API Gateway   │
                  └────────┬─────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        Authentication  Rate Limit    Logging
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                    Route Resolver
                           │
                           ▼
                    Load Balancer
                           │
                           ▼
                    Circuit Breaker
                           │
                           ▼
                      Proxy Layer
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        User Service  Product Service  Payment Service
```

---

# Project Structure

```text
src/
│
├── config/
│   └── env.ts
│
├── core/
│   └── logger/
│       └── logger.ts
│
├── gateway/
│   │
│   ├── registry/
│   │   ├── service.model.ts
│   │   ├── serviceRegistry.ts
│   │   └── index.ts
│   │
│   └── router/
│       ├── routeResolver.ts
│       └── index.ts
│
├── app.ts
└── server.ts

tests/
└── gateway/
    └── ...
```

The project follows a modular architecture where individual components have a single, well-defined responsibility.

---

# Running Locally

## Prerequisites

Make sure you have:

* Node.js
* npm
* Git

installed.

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd api-gateway
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, you can alternatively create `.env` manually.

---

## Development

Start the development server:

```bash
npm run dev
```

---

# Git Workflow

The project uses a feature-branch workflow.

The `main` branch represents the stable version of the project.

Major features are developed independently:

```text
main
 │
 ├── feature/service-registry
 │
 ├── feature/route-resolver
 │
...
```
