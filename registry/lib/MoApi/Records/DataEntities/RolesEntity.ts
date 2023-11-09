
import { DataEntity } from "./DataEntity";


export default class RolesEntity extends DataEntity {

    roles: { [roleName: string]: { [recName: string]: string } } = null!

    override fromJsonObj(obj: any) {
        this.roles = obj;
    }

    override  getJsonObj() {
        return this.roles;
    }

    getRoles() {
        return this.roles;
    }


    getRole(roleName: string): { [recName: string]: string } | undefined {
        return this.roles[roleName];
    }
}