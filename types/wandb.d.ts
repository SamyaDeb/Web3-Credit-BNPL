declare module 'wandb' {
  export function init(config: any): Promise<any>;
  export function log(data: Record<string, any>): Promise<void>;
  export function finish(): Promise<void>;
}
