import { injectable, inject } from "inversify";
import { QueryParams } from "../RequestArgs";
import { MoApiClient } from "../MoApiClient";
import { UserContext } from "~/lib/UserContext";
import { type IApiDataListResult } from "../RequestResults";
import { DataList } from "~/lib/DataList";


export interface IClientListView {
    "id": string | undefined,
    "changedAt": string | undefined | null,
    "name": string | undefined | null,
    "surname": string | undefined,
    "patronymic": string | undefined | null,
    "gender": string;
    "birthdate": string | null;
    "mainPhone": string | undefined | null,
    "mainEmail": string | undefined | null,
    "snils": string | undefined | null
}


@injectable()
export class ClientsViews {

    constructor(@inject("MoApiClient") protected _MoApiClient: MoApiClient, @inject("UserContext") protected _UserContext: UserContext) {
    }


    async getClientListView(args: QueryParams) {
        const apires = await this._MoApiClient.send<QueryParams, IApiDataListResult>("/Clients/ClientsListView", args);
        let res = DataList.createFromApiDl<IClientListView>(apires);
        return res;
    }

}
