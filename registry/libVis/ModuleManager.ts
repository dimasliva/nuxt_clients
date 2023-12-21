import { injectable, inject } from "inversify";
import { EnumArray } from "~/lib/EnumArray";
import { UserContext } from "~/lib/UserContext";
import { chkRights } from "~/lib/Utils"

export interface IModuleItemsMenu {
    id: string;
    title: string;
    icon: string;
    getPagePath: () => string;
    requiredFeature?: string[] | null; //если хотя бы один из фич в списке доступен, то меню появляется
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
                    { id: "roles", title: "Роли", getPagePath: () => "/administration/rights", icon: "mdi-account-circle" },
                    { id: "reports", title: "Отчеты", getPagePath: () => "/administration/reports", icon: "mdi-account-circle" },
                    { id: "journal", title: "ЖПЗ", getPagePath: () => "/administration/test_journal", icon: "mdi-calendar" },
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
            childs: [
                { id: "price_list", title: "Прайс-листы", getPagePath: () => "/list/price_list", icon: "mdi-list-box" },
            ]
        };

        if (chkRights(null, { "dbClient": "r" }))
            menuItem.childs!.push({ id: "clients", title: "Клиенты", getPagePath: () => "/list/clients", icon: "mdi-account-circle" })

         if (chkRights(null, { "dbPosition": "r" }))
            menuItem.childs!.push({ id: "positions", title: "Должности", getPagePath: () => "/list/positions", icon: "mdi-account-circle" })


        if (menuItem.childs!.length > 0)
            rootMenu.push(menuItem)
    }

}
