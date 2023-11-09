import type { ICouplingData, IRelData } from "../ApiInterfaces";
import type { MoApiClient } from "../MoApiClient";

const _apiPath = "/relations";

export class RelationApiSection {


    constructor(protected _apiClient: MoApiClient) { }


    async getChilds(parentId: string, parentRecCode: number, childsRecCode: number) {
        return await this._apiClient.send<any, IRelData[]>(`${_apiPath}/GetChilds`, { parentId, parentRecCode, childsRecCode }, true);
    }


    async addChild(parentId: string, parentRecCode: number, childId: string, childsRecCode: number, relType: number) {
        return await this._apiClient.send<any, boolean>(`${_apiPath}/AddChild`, { parentId, parentRecCode, childId, childsRecCode, relType }, true);
    }


    async delChild(parentId: string, parentRecCode: number, childId: string, childsRecCode: number) {
        return await this._apiClient.send<any, boolean>(`${_apiPath}/DelChild`, { parentId, parentRecCode, childId, childsRecCode }, true);
    }


    async updateRelation(parentId: string, parentRecCode: number, childId: string, childsRecCode: number, relType: number) {
        return await this._apiClient.send<any, boolean>(`${_apiPath}/UpdateRelation`, { parentId, parentRecCode, childId, childsRecCode, relType }, true);
    }


    async getParents(childId: string, childRecCode: number, parentsRecCode: number) {
        return await this._apiClient.send<any, IRelData[]>(`${_apiPath}/GetParents`, { childId, childRecCode, parentsRecCode }, true);
    }


    async addCoupling(masterId: string, masterRecCode: number, slaveId: string, slaveRecCode: number) {
        return await this._apiClient.send<any, boolean>(`${_apiPath}/AddCoupling`, { masterId, masterRecCode, slaveId, slaveRecCode }, true);
    }


    async getCouplings(masterId: string, masterRecCode: number, slaveRecCode: number) {
        return await this._apiClient.send<any, ICouplingData[]>(`${_apiPath}/GetCouplings`, { masterId, masterRecCode, slaveRecCode }, true);
    }



    async delCoupling(masterId: string, masterRecCode: number, slaveId: string, slaveRecCode: number) {
        return await this._apiClient.send<any, boolean>(`${_apiPath}/DelCoupling`, { masterId, masterRecCode, slaveId, slaveRecCode }, true);
    }



}