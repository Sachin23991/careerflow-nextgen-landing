// Minimal ambient module declarations to silence TS errors when @types packages are not installed.
// Replace with real type packages (@types/express, proper shared schema types) when available.

declare module "express" {
  // Minimal types used by the server files
  export interface Express {}
  export interface Request { [key: string]: any; }
  export interface Response { [key: string]: any; sendFile?: (p: string) => void; status?: (n: number) => Response; set?: (h: any) => Response; end?: (body?: any) => void; }
  export type NextFunction = (...args: any[]) => void;

  const express: any;
  export default express;
}

declare module "@shared/schema" {
  // Provide minimal placeholders for the schema types referenced by server code.
  // Replace with the real types from your shared package when available.
  export type User = any;
  export type InsertUser = any;
  export const User: any;
  export default any;
}
