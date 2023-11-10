
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



    setRoles(obj: { [roleName: string]: { [recName: string]: string } }) {
         this.roles = obj;
    }



    getRole(roleName: string): { [recName: string]: string } | undefined {
        return this.roles[roleName];
    }



    setRole(roleName: string, role: { [recName: string]: string }) {
         this.roles[roleName] = role;;
    }



    deleteRole(roleName: string) {
        delete this.roles[roleName];
    }

}