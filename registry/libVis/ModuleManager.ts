import { injectable, inject } from "inversify";
import { EnumArray } from "~/lib/EnumArray";
import { UserContext } from "~/lib/UserContext";
import { chkRights } from "~/lib/Utils"

export interface IModuleItemsMenu {
    id: string;
    title: string;
    icon: string;
    getPagePath: () => string;
    requiredModule?: string[] | null; //если хотя бы один из модулей в списке доступен, то меню появляется
    requiredRights?: { [rec: string]: string } | null;//должны имется все указанные права
    childs?: IModuleItemsMenu[] | null
}


@injectable()
export class ModuleManager {

    constructor(@inject("UserContext") protected _userContext: UserContext) {
    }

    getModuleItemsMenu(): EnumArray<IModuleItemsMenu> {
        const res = new EnumArray<IModuleItemsMenu>();
        res.push({ id: "control_panel", title: "Панель управления", getPagePath: () => "/dashboard", icon: "mdi-view-dashboard" });


        if (chkRights(null, { "#CompanyAdmin": "r" }))
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

        this.addListsMenu(res);

        return res;
    }


    addListsMenu(rootMenu: EnumArray<IModuleItemsMenu>) {
        let menuItem: IModuleItemsMenu = {
            id: "lists",
            title: "Списки",
            getPagePath: () => "",
            icon: "mdi-account-tie",
            childs: []
        };

        if (chkRights(null, { "dbClient": "r" }))
            menuItem.childs!.push({ id: "clients", title: "Клиенты", getPagePath: () => "/list/clients", icon: "mdi-account-circle" })


        if (menuItem.childs!.length > 0)
            rootMenu.push(menuItem)
    }

}
