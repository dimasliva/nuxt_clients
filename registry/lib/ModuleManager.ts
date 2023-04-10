import { injectable, inject } from "inversify";
import { Component } from "nuxt/schema";
import { EnumArray } from "./EnumArray";
import { UserContext } from "./UserContext";

export interface IModulesMenu {
    id: string;
    title: string;
    icon: string;
    getPagePath: () => string;
}


export interface IModuleItemsMenu {
    id: string;
    title: string;
    getForm: () => { form: Component | string, prop: any } | null;
    childs: IModuleItemsMenu[]|null
}


@injectable()
export class ModuleManager {

    constructor(@inject("UserContext") protected _userContext: UserContext) {
    }

    getModulesMenu(): EnumArray<IModulesMenu> {
        const res=new EnumArray<IModulesMenu>();
        res.push({ id: "control_panel", title: "Панель управления", getPagePath:()=> "/dashboard", icon: "mdi-view-dashboard" });
        res.push({ id: "admin_panel", title: "Администрирование", getPagePath:()=> "/administration", icon: "mdi-account-tie" });
        res.push({ id: "patients", title: "Пациенты", getPagePath:()=>  "/administration", icon: "mdi-account-heart" });
        res.push({ id: "data_bases", title: "База данных",getPagePath:()=>  "/administration", icon: "mdi-server" });
        return res;
    }

    getModuleItemsMenu():EnumArray<IModuleItemsMenu>{

        const res=new EnumArray<IModuleItemsMenu>();

        res.push({ id: "employees", title: "Панель Сотрудники", getForm:()=>{return {form: "Table", prop:null}}, childs:null }); 
        return res;
    }
}

