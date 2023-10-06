//import { getCurrentInstance, onBeforeUnmount } from 'vue';
import { resolveMethodName } from './Mapping';
import {
    SignalRCommandKey,
    SignalRCommandPayload,
    SignalREventKey,
    SignalREventPayload,
    SignalROnOptions,
    VueSignalRConfig,
} from './Models';
import { HubConnectionBuilder, type HubConnection, LogLevel } from '@microsoft/signalr';


export class RtmService {

    _connected = false;
    _invokeQueue: (() => void)[] = [];
    _activeListenersSet = new Set();
    _rtmListenersSet = new Map<string, { callback: Function, payloads: any }[]>();
    _connection: HubConnection = null!;

    get isConnected() { return this._connected };

    constructor(protected _options: VueSignalRConfig) { }



    async reconnect(uri: string, token: string, errOnFail: boolean) {
        this._connected = false;
        if (this._connected) {
            try {
                await this._connection.stop();
            }
            catch { }
        }


        this._connection = new HubConnectionBuilder()
            .withUrl(uri, { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .configureLogging(this._options.logLevel == null ? LogLevel.Warning : this._options.logLevel)
            .build();

        try {

            await this._connection.start();
            this._connection.onclose(this._onReconnect);
            this._connected = true;

            //регистрация подписчиков в новом соединении
            this._rtmListenersSet.forEach((element, methodName) => {
                element.forEach((item) => this._on(methodName, <any>item.callback, item.payloads))
            });

            while (this._invokeQueue.length) {
                const action = this._invokeQueue.shift();
                // "action?.()" syntax isn't transpiled by TS due to esnext target
                // and would break projects using the package
                action && action();
            }
        }
        catch (exc) {
            if (errOnFail)
                this._onReconnect(exc, true);
            else
                throw exc
        }
    }



    protected async _onReconnect(err, forceErrOnFail: boolean = false) {
        if (forceErrOnFail || this._connected) {
            this._connected = false;
            this._connection = null!;
            if (this._options.onConnectionError)
                this._options.onConnectionError(err);
        }
    }


    invokeQ<Key extends SignalRCommandKey>(methodName: Key, ...payload: SignalRCommandPayload<Key>) {
        return new Promise((resolve, reject) => {
            const invokeFn = () =>
                this._connection
                    .invoke(resolveMethodName(methodName), ...payload)
                    .then(resolve)
                    .catch(reject);

            if (this._connected) {
                void invokeFn();
            } else {
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                this._invokeQueue.push(invokeFn);
            }
        });
    }



    async invoke<Key extends SignalRCommandKey>(methodName: Key, ...payload: SignalRCommandPayload<Key>) {
        return this._connection.invoke(resolveMethodName(methodName), ...payload);
    }


    protected _on<Key extends SignalREventKey>(methodName: Key, callback: (...payload: SignalREventPayload<Key>) => void, { skip, once }: SignalROnOptions<SignalREventPayload<Key>>) {
        const originalMethodName = resolveMethodName(methodName);
        this._connection.on(originalMethodName, (...payload) => {
            // Needed to make TS happy with a cast
            const _payload = payload as Parameters<typeof callback>;
            if (skip && skip(..._payload)) {
                return;
            }

            if (once) {
                this.off(methodName, callback);
            }

            callback(..._payload);
        });
    }



    on<Key extends SignalREventKey>(methodName: Key, callback: (...payload: SignalREventPayload<Key>) => void, { skip, once }: SignalROnOptions<SignalREventPayload<Key>> = {}) {
        if (this._connected)
            this._on(methodName, callback, { skip, once });
        let item = this._rtmListenersSet.get(methodName);
        if (item) {
            if (!item.find((item) => item.callback === callback))
                item.push({ callback, payloads: { skip, once } })
        }
        else
            this._rtmListenersSet.set(methodName, [{ callback, payloads: { skip, once } }]);

        /*
    if (this._options.autoOffInsideComponentScope) {
        // Auto-unregister listener if inside a component
        const instance = getCurrentInstance();
        if (instance) {
            this._activeListenersSet.add(callback);

            onBeforeUnmount(() => {
                if (this._activeListenersSet.delete(callback)) {
                    this.off(methodName, callback);
                }
            });
        }
    }
    */
    }



    once<Key extends SignalREventKey>(methodName: Key, callback: (...payload: SignalREventPayload<Key>) => void, options: SignalROnOptions<SignalREventPayload<Key>> = {}) {
        this.on<Key>(methodName, callback, { ...options, once: true });
    }



    off<Key extends SignalREventKey>(methodName: Key, callback?: (...payload: SignalREventPayload<Key>) => void) {
        const originalMethodName = resolveMethodName(methodName);

        let item = this._rtmListenersSet.get(methodName);
        debugger;
        if (callback) {
            if (this._connected) {
                this._connection.off(originalMethodName, (...payload) => {
                    // Needed to make TS happy with a cast
                    const _payload = payload as Parameters<typeof callback>;
                    callback(..._payload);
                });
            }

            if (item) {
                const inx = item.findIndex((item, index) => item.callback === callback);
                if (inx != -1)
                    item.splice(inx, 1);
            }
        } else {
            if (this._connected)
                this._connection.off(originalMethodName);
            if (item)
                item.length = 0;
        }
    }

}