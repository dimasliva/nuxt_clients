import { injectable, inject } from "inversify";
import { EnumArray } from "./EnumArray";
import { UserContext } from "./UserContext";

export interface IModuleItemsMenu {
    id: string;
    title: string;
    icon: string;
    getPagePath: () => string;
    childs?: IModuleItemsMenu[] | null
}


@injectable()
export class ModuleManager {

    constructor(@inject("UserContext") protected _userContext: UserContext) {
    }

    getModuleItemsMenu(): EnumArray<IModuleItemsMenu> {
        const res = new EnumArray<IModuleItemsMenu>();
        res.push({ id: "control_panel", title: "Панель управления", getPagePath: () => "/dashboard", icon: "mdi-view-dashboard" });
        res.push({
            id: "admin_panel",
            title: "Администрирование",
            getPagePath: () => "",
            icon: "mdi-account-tie",
            childs: [
                { id: "employees", title: "Сотрудники", getPagePath: () => "/administration/employees", icon: "mdi-account-circle" },
                { id: "reports", title: "Отчеты", getPagePath: () => "/administration/reports", icon: "mdi-account-circle" }
            ]
        });
        res.push({
            id: "lists",
            title: "Списки",
            getPagePath: () => "",
            icon: "mdi-account-tie",
            childs: [
                { id: "clients", title: "Клиенты", getPagePath: () => "/list/clients", icon: "mdi-account-circle" },
            ]
        });

        res.push({ id: "data_bases", title: "База данных", getPagePath: () => "/data", icon: "mdi-server" });
        return res;
    }
}

