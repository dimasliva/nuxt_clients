import { inject, injectable } from 'inversify';
import type { MoApiClientSettings } from "@/lib/MoApi/MoApiClientSettings";
import { HTTPMethod } from 'h3';
import { IAuthorityData, IUserCredentials, IUserCredentialsServer } from '@/lib/Security';
import { sleep, excToLog } from "@/lib/Helpers";
import { Exception, NetException } from '../Exceptions';
import { IApiResult } from './RequestResults';
import { RelationApiSection } from './ApiSectionsV1/RelationApiSection';

//import { UseFetchOptions } from 'nuxt/dist/app/composables/fetch';


@injectable()
export class MoApiClient {

    @inject("MoApiClientSettings")
    protected _MoApiClientSettings: MoApiClientSettings = null!;

    protected readonly _APIPATH = "/api/v1";

    public get MoApiClientSettings(): MoApiClientSettings {
        return this._MoApiClientSettings;
    }

    protected _AuthToken: string = "";
    protected _currentApiHost: string = "";
    protected _RelationApiSection: RelationApiSection = new RelationApiSection(this);


    init(_MoApiClientSettings: MoApiClientSettings) {
        this._MoApiClientSettings = _MoApiClientSettings;
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


    async trySend<inT, OutT>(path: string, data?: inT, inParam: boolean = false) {
        try {
            if (inParam)
                return await <OutT>this.sendRequest("POST", `${this._APIPATH}${path}?${this._convertToURLParams(data)}`, null, null);
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
                        else
                            option.body = JSON.stringify(content);
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
                catch {
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
                        return <IAuthorityData>data;
                    }
                    else
                        throw new NetException("AuthErr", "Ошибка авторизации", response.status, response, await response.text());
                }
                else
                    if (response.status >= 500 && response.status < 600) {
                        if (ATTEMPS - attemp == 1)
                            sleep(1000);
                        else
                            if (ATTEMPS - attemp == 2)
                                sleep(5000);
                            else
                                sleep(10000);
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



    getRelationApiSection = () => this._RelationApiSection;


    _convertToURLParams(obj: any): string {
        const params: any = [];

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];

                if (typeof value === 'object') {
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