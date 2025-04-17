export interface IModuleItemsMenu {
    id: string;
    title: string;
    icon: string;
    getPagePath: () => string;
    requiredFeature?: string[] | null; 
    requiredRights?: { [rec: string]: string } | null;
    childs?: IModuleItemsMenu[] | null;

}