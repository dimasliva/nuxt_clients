import { IAuthorityData, IUserCredentials } from "@/lib/Security";
import { injectable, inject } from "inversify";
import { NuxtApp } from "nuxt/dist/app";
import { Container } from "inversify";
import type { MoApiClient } from "./MoApi/MoApiClient";
import type { IEmployeeRecordData } from "./MoApi/Records/EmployeeRecord";


@injectable()
export class UserContext {

  protected _isAuth: boolean = false;

  protected _AuthorityData: IAuthorityData | null = null;
  public get AuthorityData(): IAuthorityData | null { return this._AuthorityData; }

  private _CompanyProfile: any | null = null;
  public get CompanyProfile(): any | null { return this._CompanyProfile; }

  private _EmployeeAppProfile: any | null = null;
  public get EmployeeAppProfile(): any | null { return this._EmployeeAppProfile; }

  private _CompanyLicense: any | null = null;
  public get CompanyLicense(): any | null { return this._CompanyLicense; }

  private _EmployeeData: IEmployeeRecordData | null = null;
  public get EmployeeData(): any | null { return this._EmployeeData; }

  //private _CompanyData: IEmployeeRecordData | null = null;
  //public get CompanyData(): any | null { return this._CompanyData; }

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
      let authorityData = await this._moApiClient.AuthorizeClient();
      //получение профилей
      this._EmployeeData = (<IEmployeeRecordData[]>await this._moApiClient.send("/Employees/GetEmployees", [authorityData.userId]))[0];
      this._EmployeeAppProfile = await this._moApiClient.send("/Employees/GetAppProfile", authorityData.userId);
      //this._CompanyData = await this._moApiClient.send("/Company/GetCompany");
      this._CompanyProfile = await this._moApiClient.send("/Company/GetCompany");
      this._CompanyLicense = await this._moApiClient.send("/Company/GetLicense");
      this._AuthorityData = authorityData;
    }
    catch (exc) {
      this._AuthorityData = null;
      throw exc;
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


