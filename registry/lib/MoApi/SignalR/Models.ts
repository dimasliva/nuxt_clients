import { HubConnection, LogLevel } from '@microsoft/signalr';
import type { LiteralUnion } from './Ts-helpers';

export interface SignalREvents { }
export interface SignalRCommands { }


export type SignalRCommandKey = LiteralUnion<keyof SignalRCommands>;
export type SignalRCommandPayload<
  K extends SignalRCommandKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P = K extends keyof SignalRCommands ? SignalRCommands[K] : any[]
> = P extends false ? never[] : P extends unknown[] ? P : [P];

export type SignalREventKey = LiteralUnion<keyof SignalREvents>;
export type SignalREventPayload<
  K extends SignalREventKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P = K extends keyof SignalREvents ? SignalREvents[K] : any[]
> = P extends false ? never[] : P extends unknown[] ? P : [P];

export interface VueSignalRConfig {
  //autoOffInsideComponentScope: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConnectionError?: (error: any) => Promise<void>;
  logLevel?: LogLevel | null;
}

export interface SignalROnOptions<Payload extends unknown[]> {
  skip?: (...payload: Payload) => boolean;
  once?: boolean;
}
