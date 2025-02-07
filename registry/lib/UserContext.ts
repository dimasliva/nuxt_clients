import type { IAuthorityData, IUserCredentials } from "@/lib/Security";
import { injectable, inject } from "inversify";
import type { NuxtApp } from "nuxt/app";
import { Container } from "inversify";
import type { MoApiClient } from "./MoApi/MoApiClient";
import type { EmployeeRecordData } from "./MoApi/Records/EmployeeRecord";
import type { IRecordsRestricions } from "./MoApi/ApiInterfaces";
import { EmployeeAppProfile } from "./EmployeeAppProfile";
import { CompanyAppProfile } from "./CompanyAppProfile";
import { BitList } from "./BitList";

export  const FEATURES_SIZE = 128;

@injectable()
export class UserContext {

  protected _isAuth: boolean = false;

  protected _AuthorityData: IAuthorityData | null = null;
  public get AuthorityData(): IAuthorityData | null { return this._AuthorityData; }

  private _CompanyProfile: CompanyAppProfile | null = null;
  public get CompanyProfile(): CompanyAppProfile | null { return this._CompanyProfile; }

  private _EmployeeAppProfile: EmployeeAppProfile | null = null;
  public get EmployeeAppProfile(): EmployeeAppProfile | null { return this._EmployeeAppProfile; }

  private _CompanyLicense: any | null = null;
  public get CompanyLicense(): any | null { return this._CompanyLicense; }

  private _userRights: any | null = null;
  public get UserRights(): any | null { return this._userRights; }

  private _userFeatureAccess: any | null = null;
  public get UserFeatureAccess(): any | null { return this._userFeatureAccess; }

  private _EmployeeData: EmployeeRecordData | null = null;
  public get EmployeeData(): EmployeeRecordData | null { return this._EmployeeData; }

  private _RecordsRestricions: IRecordsRestricions | null = null;
  public get RecordsRestricions(): IRecordsRestricions | null { return this._RecordsRestricions; }



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
      const appEmployeeContext: any = await this._moApiClient.send("/Employees/GetAppEmployeeContext");
      this._EmployeeData = appEmployeeContext.employee;
      this._EmployeeAppProfile = new EmployeeAppProfile(this._moApiClient, appEmployeeContext.employeeAppProfile),
        this._CompanyProfile = new CompanyAppProfile(this._moApiClient, appEmployeeContext.companyAppProfile);
      this._CompanyLicense = appEmployeeContext.companyLicenseData;
      this._userRights = appEmployeeContext.userRecordsRights;
      this._userFeatureAccess =  new BitList(FEATURES_SIZE).fromBase64(appEmployeeContext.userFeatureAccess);
      this._RecordsRestricions = appEmployeeContext.recordRestrictions;
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



  chkLicModule(modname: string): boolean {
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


  public chkTokenTrait(token: string, trait: string): boolean {
    if (this._userRights.hasOwnProperty("#allrecords")) {
      return this._userRights["#allrecords"].includes(trait);
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


