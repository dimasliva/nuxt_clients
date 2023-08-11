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

  private _CompanyRoles: any | null = null;
  public get CompanyRoles(): any | null { return this._CompanyRoles; }

  private _userRights: any | null = null;
  public get UserRights(): any | null { return this._userRights; }

  private _EmployeeData: IEmployeeRecordData | null = null;
  public get EmployeeData(): IEmployeeRecordData | null { return this._EmployeeData; }

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
      this._CompanyProfile = await this._moApiClient.send("/Company/GetProfile");
      this._CompanyLicense = await this._moApiClient.send("/Company/GetLicense");
      this._CompanyRoles = await this._moApiClient.send("/Roles/GetRoles");
      this._userRights = this._createUserRights(this._EmployeeData.roles || "", this._CompanyRoles.roles)
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


  protected _createUserRights(userRoles: string, companyRoles) {

    const res: { [rectoken: string]: string } = {};
    const roleTokens = companyRoles;
    const roles = userRoles.split(",");
    for (const role of roles) {
      if (roleTokens.hasOwnProperty(role)) {
        const tokens = roleTokens[role];

        for (let tokenn in tokens) {
          let token = tokens[tokenn];
          const tk = tokenn.toLowerCase();
          if (res.hasOwnProperty(tk)) {
            let currTraits = res[tk];
            for (const c of token) {
              if (!currTraits.includes(c)) {
                currTraits += c;
              }
            }
            res[tk] = currTraits;
          } else {
            res[tk] = token;
          }
        }
      }
    }
    return res;
  }


  ChkLicModule(modname: string): boolean {
    if (this._CompanyLicense.hasOwnProperty(modname)) {
      const dtn = new Date();
      const untiDate = new Date(this._CompanyLicense[modname].untilMax);
      if (dtn > untiDate) {
        return false;
      }
    } else {
      return false;
    }
    return true;
  }


  public ChkTokenTrait(token: string, trait: string): boolean {
    if (this._userRights.hasOwnProperty("#companyadmin")) {
      return this._userRights["#companyadmin"].includes(trait);
    }
    token = token.toLowerCase();
    return this._userRights.hasOwnProperty(token) && this._userRights[token].includes(trait);
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


