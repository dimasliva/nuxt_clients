import { injectable } from "inversify";

export interface IFrameHeaderData {
    title: string;
    icon?: string;
    mainMenu?: IMenu
    mainBtnBar?:IBtnMenu[]
}

@injectable()
export class PageMap {
    protected _map: { [path: string]: IFrameHeaderData | null } = {};

    getFrameHeaderData(path: string) {
        return this._map[path];
    }

    setPageData(path: string, frameHeaderData: IFrameHeaderData) {
        this._map[path] = frameHeaderData;
    }
}