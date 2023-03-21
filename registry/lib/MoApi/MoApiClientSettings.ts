import { inject, injectable } from 'inversify';
import { IUserCredentials } from '@/lib/Security';

@injectable()
export  class MoApiClientSettings {

    protected _ip: string = "localhost";
    protected _port: number = 7132;
    protected _tls: boolean = true;

    @inject("IUserCredentials")
    private _Credentials: IUserCredentials | null = null;

    public get Credentials(): IUserCredentials | null { return this._Credentials; }
    public set Credentials(value: IUserCredentials | null) { this._Credentials = value; }

    private _appId: string="";
    public get appId(): string {return this._appId;}
    public set appId(value: string) { this._appId = value;}


    get ip() { return this._ip; }
    set ip(v) { this._ip = v; }

    get port() { return this._port; }
    set port(v) { this._port = v; }

    get tls() { return this._tls; }
    set tls(v) { this._tls = v; }
}