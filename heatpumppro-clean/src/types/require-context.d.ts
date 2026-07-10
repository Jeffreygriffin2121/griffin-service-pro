declare interface RequireContext {
  keys(): string[];
  <T = unknown>(id: string): T;
}

declare interface NodeRequire {
  context(path: string, recursive?: boolean, filter?: RegExp): RequireContext;
}