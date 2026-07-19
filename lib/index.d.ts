type Method =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH"
  | "PROPFIND"
  | "PROPPATCH"
  | "MKCOL"
  | "COPY"
  | "MOVE"
  | "LOCK"
  | "UNLOCK"
  | "VERSION-CONTROL"
  | "REPORT"
  | "CHECKIN"
  | "CHECKOUT"
  | "UNCHECKOUT"
  | "MKWORKSPACE"
  | "UPDATE"
  | "LABEL"
  | "MERGE"
  | "BASELINE-CONTROL"
  | "MKACTIVITY"
  | "ACL"
  | "SEARCH";

interface VivaeObject {
  url: URL;
  path: string;
  query: { [key: string]: string | number | boolean } | {};
  params: { [param: string]: string } | {};
  method: Method;
  status: number;

  send(body: string | object): void;

  setHeaders(headers: { [key: string]: string }): void;

  respond(options: {
    status?: number;
    headers?: { [key: string]: string };
  }): this;
}

type Middleware = (v: VivaeObject, next: (error?: any) => void) => void;

interface VivaeConfig {
  allowQueries?: boolean;
}

export interface Plugin {
  path?: string;
  method?: Method;
  middleware: Middleware;
}

interface VivaeServer {
  use(path: string, method: Method | Method[], middleware: Middleware): void;
  use(path: string, middleware: Middleware): void;
  use(method: Method | Method[], middleware: Middleware): void;
  use(middleware: Middleware): void;
  plugin(plugin: Plugin): void;

  fetch: (request: Request) => Promise<Response>;
  listen(port?: number, callback?: () => void): void;
}

declare function vivae(config?: VivaeConfig): VivaeServer;

export { vivae, VivaeServer, VivaeConfig, Middleware, Method, VivaeObject };
