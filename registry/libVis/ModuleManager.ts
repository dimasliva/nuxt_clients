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
                    { id: "reports", title: "Отчеты", getPagePath: () => "/administration/reports", icon: "mdi-account-circle" }
                ]
            });

        this.addListsMenu(res);
        this.addBookingMenu(res);

        return res;
    }



    addListsMenu(rootMenu: EnumArray<IModuleItemsMenu>) {
        let menuItem: IModuleItemsMenu = {
            id: "lists",
            title: "Списки",
            getPagePath: () => "",
            icon: "mdi-account-tie",
            childs: [
                // { id: "price_list", title: "Прайс-листы", getPagePath: () => "/list/price_list", icon: "mdi-list-box" },
                { id: "product_catalogs", title: "Товары и услуги", getPagePath: () => "/list/product_catalogs", icon: "mdi-invoice-text-multiple-outline" },
            ]
        };

        var menuList = {
            "dbClient": { rights: "r", item: { id: "clients", title: "Клиенты", getPagePath: () => "/list/clients", icon: "mdi-account-multiple" } },
            "dbPosition": { rights: "r", item: { id: "positions", title: "Должности", getPagePath: () => "/list/positions", icon: "mdi-card-account-details-outline" } },
            "dbDealOrder": { rights: "r", item: { id: "deal_orders", title: "Заказы", getPagePath: () => "/list/deal_orders", icon: "mdi-handshake-outline" } },
            "dbDeal": { rights: "r", item: { id: "deals", title: "Сделки", getPagePath: () => "/list/deals", icon: "mdi-handshake-outline" } },
            "dbScheduleItemGroup": { rights: "r", item: { id: "schedule_item_group", title: "Разделы расписания", getPagePath: () => "/list/schedule_item_group", icon: "mdi-book-clock-outline" } },
            "dbCompanyOrganization": { rights: "r", item: { id: "company_organizations", title: "Организации компании", getPagePath: () => "/list/company_organizations", icon: "mdi-handshake-outline" } },
           
        }

        for (const key in menuList) {
            const { rights, item } = menuList[key];
            if (chkRights(null, { key: rights })) {
                menuItem.childs!.push(item);
            }
        }

        if (menuItem.childs!.length > 0)
            rootMenu.push(menuItem)
    }


    addBookingMenu(res: EnumArray<IModuleItemsMenu>) {
        res.push({
            id: "booking",
            title: "Предварительная запись",
            getPagePath: () => "",
            icon: "mdi-account-tie",
            childs: [
                { id: "journal", title: "ЖПЗ", getPagePath: () => "/booking/test_journal", icon: "mdi-calendar" },
            ]
        });
    }

}
