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
    getVisElem: () => { type: string, value: any} | null;
    childs: IModuleItemsMenu[]|null
}


@injectable()
export class ModuleManager {

    constructor(@inject("UserContext") protected _userContext: UserContext) {
    }

    getModulesMenu(): EnumArray<IModulesMenu> {
        const res=new EnumArray<IModulesMenu>();
        res.push({ id: "control_panel", title: "Панель управления", getPagePath:()=> "/dashboard", icon: "mdi-view-dashboard" });
        res.push({ id: "admin_panel", title: "Администрирование", getPagePath:()=> [{title: "Cотрудники", path: "/administration/employees", icon: "mdi-account-circle"},{title: "Отчеты", path: "/administration/reports", icon: "mdi-account-circle"}], icon: "mdi-account-tie" });
        res.push({ id: "patients", title: "ЖПЗ", getPagePath:()=>  "/journal", icon: "mdi-account-heart" });
        res.push({ id: "data_bases", title: "База данных",getPagePath:()=>  "/data", icon: "mdi-server" });
        return res;
    }

    getModuleItemsMenu():EnumArray<IModuleItemsMenu>{

        const res=new EnumArray<IModuleItemsMenu>();

        res.push({ id: "employees", title: "Панель Сотрудники", getVisElem:()=>{return { type: "page", value: "/dashboard"} }, childs:null }); 
        return res;
    }
}

