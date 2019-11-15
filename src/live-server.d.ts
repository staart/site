declare module "live-server" {
  export function start(params: {
    port?: number;
    host?: string;
    root?: string;
    open?: boolean;
    ignore?: string;
    file?: string;
    wait?: number;
    mount?: string[][];
    logLevel?: number;
    middleware?: any[];
  }): void;
}
