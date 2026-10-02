import type { Request, Response } from "express";

export interface ProxyOptions {
  timeout?: number;
}

export interface ProxyTarget {
  target: string;
}

export interface ProxyRequest {
  request: Request;
  response: Response;
  target: ProxyTarget;
}