import { Container, inject, injectable } from 'inversify';
import type { MoApiClientSettings } from "~/src/common/lib/MoApi/MoApiClientSettings";
import { type HTTPMethod } from 'h3';
import type { IAuthorityData, IUserCredentials, IUserCredentialsServer } from '~/src/common/lib/Security';
import { sleep, excToLog } from "~/src/common/lib/Helpers";
import { Exception, NetException } from '../Exceptions';
import type { IApiResult } from './RequestResults';
import { RelationApiSection } from './ApiSectionsV1/RelationApiSection';
import { RecordsApiSection } from './ApiSectionsV1/RecordsApiSection';
import { DictionariesApiSection } from "./ApiSectionsV1/DictionariesApiSection"
import { LogLevel } from '@microsoft/signalr';
import { RtmService } from './SignalR/RtmService';
import type { EventBus } from '../EventBus';
import { DictionaryStore } from '../Dicts/DictionaryStore';
import { ScheduleApiSection } from './ApiSectionsV1/SchedulerApiSection';
import { th } from 'vuetify/locale';

//import { UseFetchOptions } from 'nuxt/dist/app/composables/fetch';


@injectable()
export class MoApiClient {

    @inject("diC")
    protected _diC: Container = null!;

    @inject("SysEventBus")
    protected _SysEventBus: EventBus = null!;

    protected readonly _APIPATH = "/api/v1";

    public get MoApiClientSettings(): MoApiClientSettings {
        return this._MoApiClientSettings;
    }

    protected _AuthToken: string = "";
    protected _currentApiHost: string = "";
    protected _RelationApiSection: RelationApiSection = new RelationApiSection(this);
    protected _RecordsApiSection: RecordsApiSection = new RecordsApiSection(this);
    protected _DictionariesApiSection: DictionariesApiSection = new DictionariesApiSection(this);
    protected _DictionaryStore: DictionaryStore = null!;
    protected _ScheduleApiSection: ScheduleApiSection = null!


    constructor(@inject("MoApiClientSettings") protected _MoApiClientSettings: MoApiClientSettings) {

    }


    init() {
        if (this._SysEventBus)
            this._SysEventBus.subscribe("exitFromAccount", () => { this._rtmService.disconnect() })
        return this;
    }

    async registerPending(data: TCompanyRegistrationData) {
        let res: { lifeTime: number, login: string } = await this.send("/RegisterCompany/RegisterPending", data);
        return res;
    }

    async registerConfirmation(data: TRegConfirmationCode) {
        let res: boolean = await this.send("/RegisterCompany/RegisterConfirmation", data);
        return res;
    }


    /**
     * Отправляет запрос к API
     * @param path Путь к API
     * @param data Данные для отправки
     * @param inParam  Флаг, указывающий, POST(false) или GET(true) метод
     * @returns Результат запроса
     */
    async send<inT, outT>(path: string, data?: inT, inParam: boolean = false) {

        if (inParam)
            var res = await this.sendRequest("GET", `${this._APIPATH}${path}?${this._convertToURLParams(data)}`, null, null);
        else
            var res = await this.sendRequest("POST", `${this._APIPATH}${path}`, data);



        if (res.bodyData && typeof res.bodyData == "object") {
            const answ = <IApiResult>res.bodyData;

            if (answ.resultCode == "OK")
                return <outT>answ.result;
            else
                if (answ.resultCode)
                    throw new NetException(answ.resultCode, answ.resultDescription, 200);
                else
                    throw new NetException("ResponseErr", "Unknown response format", 200, res.response, res.bodyData);
        }
        else
            throw new NetException("ResponseErr", "Unknown response format", 200, res.response, res.bodyData);
    }


    /**
     * Отправляет запрос к API и возвращает результат.
     * Если запрос завершается с ошибкой, возвращает null.
     * @param path - путь к API-методу
     * @param data - данные для отправки
     * @param inParam - флаг, указывающий, POST(false) или GET(true) метод
     * @returns результат запроса или null, если произошла ошибка
     */
    async trySend<inT, OutT>(path: string, data?: inT, inParam: boolean = false) {
        try {
            if (inParam)
                return await <OutT>this.sendRequest("GET", `${this._APIPATH}${path}?${this._convertToURLParams(data)}`, null, null);
            else
                return await <OutT>this.sendRequest("POST", `${this._APIPATH}${path}`, data);
        }
        catch (exc) {
            excToLog("MoApiClient.trySend", exc);
            return null;
        }
    }


    async sendMultipart(path: string, data) {
        const fd = new FormData();
        for (let item in data)
            fd.append(item, data[item]);

        return await this.send(path, fd)
    }


    async downloadFile(path: string, pars) {
        let res = await this.sendRequest("GET", `${this._APIPATH}${path}?${this._convertToURLParams(pars)}`, null, null);
        return res.bodyData as Blob;
    }


    async checkConnection() {
        return false;
    }



    async sendRequest(method: HTTPMethod, path: string, content: string | any, contenttype: string | null = "application/json") {
        let baseurl = "";
        try {
            if (this._currentApiHost)
                baseurl = `https://${this._currentApiHost}`;
            else
                if (this._MoApiClientSettings.ip)
                    baseurl = `${this._MoApiClientSettings.tls ? 'https' : 'http'}://${this._MoApiClientSettings.ip}:${this._MoApiClientSettings.port}`;

            const fulluri = `${baseurl}${path}`;
            const ATTEMPS = 4;
            let attemp = ATTEMPS;
            let bodyData: string | object | null = null;
            let response: Response | null = null;

            while (attemp--) {

                const headers: { [key: string]: string } = {};
                if (this._AuthToken)
                    headers["Authorization"] = `Bearer ${this._AuthToken}`;

                try {
                    let option: RequestInit = {
                        method: method,
                        headers: headers,
                        mode: "cors"
                    };

                    if (content != null) {
                        if (content.constructor && content.constructor == FormData) {
                            option.body = content;
                            contenttype = null;
                        }
                        else {
                            if (typeof content.toJson === "function")
                                option.body = content.toJson();
                            else
                                option.body = JSON.stringify(content);
                        }
                    }

                    if (contenttype)
                        headers["Content-Type"] = contenttype;

                    response = await fetch(fulluri, option);

                    if (response.status == 200) {

                        const contType = response.headers.get("content-type")?.split(";") || [];
                        switch (contType[0]) {
                            case "application/json":
                                bodyData = await response.json();
                                break;

                            case 'application/octet-stream':
                                bodyData = await response.blob();
                                break;

                            default:
                                bodyData = await response.text();
                                break;
                        }
                        return { response, bodyData };
                    }
                    else
                        if (response.status == 429) {
                            const contType = response.headers.get("content-type")?.split(";") || [];
                            if (contType[0] == "application/json" && (bodyData = await response.json())) {
                                await sleep((<any>bodyData).await || 1000);
                            }
                            else
                                if (ATTEMPS - attemp == 1)
                                    await sleep(1000);
                                else
                                    await sleep(2000);
                            continue;
                        }
                        else
                            if (response.status >= 500 && response.status < 600) {
                                if (ATTEMPS - attemp == 1)
                                    await sleep(1000);
                                else
                                    if (ATTEMPS - attemp == 2)
                                        await sleep(5000);
                                    else
                                        await sleep(10000);
                                continue;
                            }
                }
                catch (exc) {
                    continue;
                }

                if (response.status == 401 || response.status == 403) {
                    await this.AuthorizeClient();
                    continue;
                }
            }

            throw new NetException("RequestErr", "Request Error", response?.status || 0, response, bodyData);
        }
        catch (exc) {
            excToLog("sendRequest", exc);
            throw exc;
        }
    }


    async AuthorizeServer(userCredentials: IUserCredentialsServer) {

        if (userCredentials == null)
            throw new Exception("AuthErr", "No credentials");

        const baseurl = `${this._MoApiClientSettings.tls ? 'https' : 'http'}://${this._MoApiClientSettings.ip}:${this._MoApiClientSettings.port}`;
        const fulluri = `${baseurl}/api/v1/users/Auth`;
        const ATTEMPS = 3;
        let attemp = ATTEMPS;
        let bodyData: string | object | null = null;
        let response: Response | null = null;
        while (attemp--) {

            let option: RequestInit = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    login: userCredentials.login,
                    password: userCredentials.password,
                    refreshToken: userCredentials.refreshToken,
                    clientIp: userCredentials.clientIp,
                    appId: this._MoApiClientSettings.appId
                }),
                mode: "no-cors"
            };
            try {
                response = await fetch(`${baseurl}/api/v1/users/Auth`, option);

                if (response.status == 200) {
                    if (response.headers.get("content-type")?.startsWith("application/json")) {
                        let data = await response.json();
                        if (data.resultCode == "OK") {
                            return <IAuthorityData>data.result;
                        }
                        throw new NetException(data.resultCode, data.resultDescription, response.status, response, data);
                    }
                    else
                        throw new NetException("AuthErr", "Ошибка авторизации", response.status, response, await response.text());
                }
                else
                    if (response.status >= 500 && response.status < 600) {
                        console.debug("AuthorizeServer: auth attemp:" + (ATTEMPS - attemp))
                        if (ATTEMPS - attemp == 1)
                            await sleep(1000);
                        else
                            if (ATTEMPS - attemp == 2)
                                await sleep(5000);
                            else
                                await sleep(10000);
                        continue;
                    }

                    else
                        throw new NetException("AuthErr", "Ошибка авторизации", response.status, response, await response.text());

            }
            catch (exc) {
                excToLog("AuthorizeServer", exc);

                if (attemp == 1)
                    throw exc;
                continue;
            }
        }

        throw new NetException("AuthErr", "Ошибка авторизации", response?.status || 0, response, await response?.text());
    }


    async AuthorizeClient() {

        if (this._MoApiClientSettings.Credentials == null)
            throw new Exception("AuthErr", "No credentials");

        const fulluri = `/api/auth/auth`;
        const ATTEMPS = 3;
        let attemp = ATTEMPS;
        let bodyData: string | object | null = null;
        let response: Response | null = null;
        while (attemp--) {
            let cred = this._MoApiClientSettings.Credentials;

            let option: RequestInit = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    login: cred.login,
                    password: cred.password,
                    refreshToken: cred.refreshToken
                }),
                mode: "same-origin"
            };
            try {
                response = await fetch(fulluri, option);

                if (response.status == 200) {
                    if (response.headers.get("content-type")?.startsWith("application/json")) {
                        let data = await response.json();
                        this._AuthToken = data.token;
                        this._currentApiHost = data.hosts[0];
                        console.debug("Target api server: " + this._currentApiHost);
                        this.connectRtMessaging();
                        return <IAuthorityData>data;
                    }
                    else
                        throw new NetException("AuthErr", "Ошибка авторизации", response.status, response, await response.text());
                }
                else
                    if (response.status >= 500 && response.status < 600) {
                        if (ATTEMPS - attemp == 1)
                            await sleep(1000);
                        else
                            if (ATTEMPS - attemp == 2)
                                await sleep(5000);
                            else
                                await sleep(10000);
                        continue;
                    }
                    else
                        throw new NetException("AuthErr", "Ошибка авторизации", response.status, response);

            }
            catch (exc) {
                excToLog("AuthorizeClient", exc);

                if (attemp == 1)
                    throw exc;
                continue;
            }
        }

        throw new NetException("AuthErr", "Ошибка авторизации", response?.status || 0, response);
    }


    protected _rtmService: RtmService = null!;
    protected _rtmServiceLastConnDate: number = Date.now();

    async connectRtMessaging() {

        //ограничение по частоте реконнекта
        let diff = Date.now() - this._rtmServiceLastConnDate;
        if (diff < 2000)
            await sleep(2000 - diff);
        this._rtmServiceLastConnDate = Date.now();

        if (!this._currentApiHost || !this._AuthToken) {
            await this.AuthorizeClient();
            return; // connectRtMessaging рекуретно вызывается из AuthorizeClient при успешной авторизации
        }

        if (!this._rtmService) {
            this._rtmService = new RtmService({
                onConnectionError: async (err) => {
                    while (true)
                        try { await this.AuthorizeClient(); break; } catch { await sleep(15000); };//connectRtMessaging асинхронно вызывается из AuthorizeClient при успешной авторизации
                },
                logLevel: LogLevel.Debug
            });

            this._rtmService.on("onGroupСontentChanged", (...args) => {
                this._SysEventBus.publish("onGroupСontentChanged", ...args);
            })

            this._rtmService.on("exitFromAccount", (...args) => {
                this._SysEventBus.publish("exitFromAccount", ...args);
            })
        }

        this._rtmService.reconnect(`https://${this._currentApiHost}/api/rtm`, this._AuthToken, true);
    }



    async sendRtm(methodName, ...params) {
        if (this._rtmService) {
            this._rtmService.invokeQ(methodName, ...params);
        }
    }



    getRelationApiSection = () => this._RelationApiSection;

    getRecordsApiSection = () => this._RecordsApiSection;

    getDictionariesApiSection = () => this._DictionariesApiSection;

    getDictionaryStore = () => this._DictionaryStore || (this._DictionaryStore = new DictionaryStore(this, this._SysEventBus));

    getScheduleApiSection = () => this._ScheduleApiSection || (this._ScheduleApiSection = this._diC.get(ScheduleApiSection));





    _convertToURLParams(obj: any): string {
        const params: any = [];

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];

                if (typeof value === 'object') {
                    if (typeof value.toJson === "function")
                        value = value.toJson();
                    else
                        value = JSON.stringify(value);
                }

                params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        }

        return params.join('&');
    }

}


export type TCompanyRegistrationData = {
    email: string;
    login: string;
    password: string;
    companyTitle: string;
    companyFullTitle: string;
    emplName: string;
    emplSurname: string;
    emplPatronymic?: string | null;
    emplBirthdate: string;
}


export type TRegConfirmationCode = {
    login: string,
    code: string
}