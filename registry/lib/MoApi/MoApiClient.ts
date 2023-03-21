import { inject, injectable } from 'inversify';
import type {MoApiClientSettings} from "@/lib/MoApi/MoApiClientSettings";
import { HTTPMethod } from 'h3';
import { IAuthorityData } from '@/lib/Security';
import { sleep } from "@/lib/Helpers";

//import { UseFetchOptions } from 'nuxt/dist/app/composables/fetch';


@injectable()
export  class MoApiClient {

    @inject("MoApiClientSettings")
    protected _MoApiClientSettings: MoApiClientSettings = null!;

    public  get MoApiClientSettings(): MoApiClientSettings {
        return this._MoApiClientSettings;
    }
    
    protected _AuthToken: string = "";

    init(_MoApiClientSettings: MoApiClientSettings) {
        this._MoApiClientSettings = _MoApiClientSettings;
        return this;
    }

    async checkConnection() {
        return false;
    }

    async sendRequest(method: HTTPMethod, path: string, content: string | any, contenttype: string = "application/json") {
        const baseurl = `${this._MoApiClientSettings.tls ? 'https' : 'http'}://${this._MoApiClientSettings.ip}:${this._MoApiClientSettings.port}`;
        const fulluri = `${baseurl}${path}`;
        const ATTEMPS=4;
        let attemp = ATTEMPS;
        let bodyData: string | object | null = null;
        let response: Response | null = null;

        while (attemp--) {

            const headers: { [key: string]: string } = {};
            if (this._AuthToken)
                headers["Authorization"] = `Bearer ${this._AuthToken}`;

            if (contenttype)
                headers["Content-Type"] = contenttype;

            try {
                let option: RequestInit = {
                    method: method,
                    headers: headers,
                    mode:"cors"
                };

                if (content != null) {
                    if (typeof (content) == "object")
                        option.body = JSON.stringify(content);
                    else
                        option.body = content;
                }
                response = await fetch(fulluri, option);


                if (response.status == 200) {

                    const contType = response.headers.get("content-type")?.split(";") || [];
                    switch (contType[0]) {
                        case "application/json":
                            bodyData = await response.json();
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
                        sleep(1000);
                    else
                        if (ATTEMPS - attemp == 2)
                            sleep(5000);
                        else
                            sleep(10000);
                    continue;
                }
            }
            catch {
                continue;
            }

            if (response.status == 401 || response.status == 403) {
                await this.Authorize();
                continue;
            }
        }

        throw { code: "RequestErr", statusCode: response?.status || 0, message: "Request Error", response }
    }

    async Authorize() {

        if (this._MoApiClientSettings.Credentials == null)
            throw { code: "AuthErr", statusCode: 0, message: "No credentials", response: null }

        const baseurl = `${this._MoApiClientSettings.tls ? 'https' : 'http'}://${this._MoApiClientSettings.ip}:${this._MoApiClientSettings.port}`;
        const fulluri = `${baseurl}/api/v1/users/Auth`;
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
                    refreshToken:cred.refreshToken,
                    appId:this._MoApiClientSettings.appId
                }),
                mode:"cors"
            };
            try {
                response = await fetch(`${baseurl}/api/v1/users/Auth`, option);

                if (response.status == 200) {
                    if (response.headers.get("content-type")?.startsWith("application/json")) {
                        let data = await response.json();
                        if (data.resultCode == "OK") {
                            this._AuthToken = data.result.token;
                            return <IAuthorityData>data.result;
                        }
                        throw { code: "AuthErr", statusCode: response.status, message: await response.text(), response, bodyData: data }
                    }
                    else
                        throw { code: "AuthErr", statusCode: response.status, message: await response.text(), response, bodyData: await response.text() }

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
                        throw { code: "AuthErr", statusCode: response.status, message: "Authorization Error", response }

            }
            catch (exc) {
                console.error("Exception in function Authorize:"+JSON.stringify(exc));
                if (attemp == 1)
                    throw exc;
                continue;
            }
        }

        throw { code: "AuthErr", statusCode: response?.status || 0, message: "Authorization Error", response }
    }

}

