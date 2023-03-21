import { IAuthorityData } from "@/lib/Security";
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

  async authorize() {
    if (this.isAuth) return;
    this._AuthorityData = await this._moApiClient.Authorize();
    this.saveToState();
  }

    signOut() {
    this._AuthorityData = null;
  }

  async tryAuthorize() {
    if (this.isAuth) return true;

    try {
      await this.authorize();
    }
    catch (exc) {
      return false;
    }
    return true;
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


