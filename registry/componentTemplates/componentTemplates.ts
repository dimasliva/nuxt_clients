import type { Container } from "inversify";
import type { SetupContext } from "vue";
import type { IFrameHeaderData } from "~/lib/PageMap";


export interface IRenderedTemplateComponentProps {
    settingsStorage?: IDataStorageCell;
}



export interface IRenderedTemplateComponent {
    render();
    setup(ctx: SetupContext): Promise<void>;
    getFrameHeaderData?(): IFrameHeaderData | null | undefined;
}



export const StandartComponentEvents = ["selectItem", "deselectItem", "doubleClickItem", "clickItem", "addItem", "updateItem", "deleteteItem"];