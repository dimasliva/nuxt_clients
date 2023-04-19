import { injectable } from "inversify";

export interface IPageData {
    title: string;
    icon: string;
    mainMenu?: IMenu
    mainBtnBar?:IBtnMenu[]
}

@injectable()
export class PageMap {
    protected _map: { [path: string]: IPageData | null } = {};

    getPageData(path: string) {
        return this._map[path];
    }

    setPageData(path: string, pageData: IPageData) {
        this._map[path] = pageData;
    }
}