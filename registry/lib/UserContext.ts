import { IAuthorityData, IUserCredentials } from "@/lib/Security";
import { injectable, inject } from "inversify";
import { NuxtApp } from "nuxt/dist/app";
import type { MoApiClient } from "./MoApi/MoApiClient";


@injectable()
export class UserContext {

  protected _isAuth: boolean = false;
  protected _AuthorityData: IAuthorityData | null = null;
  public get AuthorityData(): IAuthorityData | null { return this._AuthorityData; }

  constructor(@inject("MoApiClient") protected _moApiClient: MoApiClient, @inject("NuxtApp") protected _nuxtApp: NuxtApp) {
    this.restoreFromState()
  }

  get isAuth() {
    return this._AuthorityData != null;
  }

  async authorize(login?: string, password?: string) {
    if (this.isAuth) return;
 
    if (login && password) {
      this._moApiClient.MoApiClientSettings.Credentials = { login, password, refreshToken: null }
    }
    else
      this.restoreUserCredentials();

    try {
      this._AuthorityData = await this._moApiClient.Authorize();
    }
    finally {
      this.saveUserCredentials();

      if (this._AuthorityData)
        this._moApiClient.MoApiClientSettings.Credentials = { refreshToken: this._AuthorityData.refreshToken, login: null, password: null }//оставляем только refreshToken в Credentials
      else
        this._moApiClient.MoApiClientSettings.Credentials = null;

      this.saveToState();
    }
  }

  signout() {
    this._AuthorityData = null;
    this.saveUserCredentials();
    this._moApiClient.MoApiClientSettings.Credentials = null;
  }

  async tryAuthorize(login?: string, password?: string) {
    /*
          let cred=this._moApiClient.MoApiClientSettings.Credentials||null;
          let option: RequestInit = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: cred? JSON.stringify(cred):""
          };
      debugger;
          var res = await fetch("/api/auth/login", option)
          this._AuthorityData =  await res.json();
        return true;
    */

    if (this.isAuth) return true;

    try {
      await this.authorize(login, password);
    }
    catch (exc) {
      return false;
    }
    return true;
  }

  saveUserCredentials() {
    let credCookie = useCookie<string | null>("user_session");
    credCookie.value = this._AuthorityData?.refreshToken || null;
  }

  restoreUserCredentials() {
    let credCookie = useCookie<string | null>("user_session");
    this._moApiClient.MoApiClientSettings.Credentials = { login: null, password: null, refreshToken: credCookie.value }
  }

  saveToState() {
    const state = {
      authData: this._AuthorityData
    }
    this._nuxtApp.payload.state["user_context_class@data"] = state;
    console.debug("auth save " + state)
  }

  protected restoreFromState() {
    const state = this._nuxtApp.payload?.state["user_context_class@data"];
    console.debug("auth restore " + state)
    if (state) {
      this._AuthorityData = (<any>state).authData;
    }
  }

}


