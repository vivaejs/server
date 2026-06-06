import type { Middleware, Method } from "../index";

export interface Plugin {
  path?: string;
  method?: Method;
  middleware: Middleware;
}

export function serve(options?: {
  directory?: string;
  autoEncoding?: boolean;
  headers?: {
    [fileExtension: string]: {
      [header: string]: string;
    };
  };
}): Plugin;
