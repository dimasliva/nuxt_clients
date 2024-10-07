import type { Container } from "inversify";
import type { SetupContext } from "vue";
import type { IFrameHeaderData } from "~/lib/PageMap";


export interface IRenderedTemplateComponentProps {
    settingsStorage?: IDataStorageCell;
}



export interface IRenderedTemplateComponent {
    render();
    setup(props: any, ctx: SetupContext): Promise<void>;
    emits?(): string[];
    expose?(): any;

    getFrameHeaderData?(): IFrameHeaderData | null | undefined;
}



export const StandartComponentEvents = ["selectItem", "deselectItem", "doubleClickItem", "clickItem", "addItem", "updateItem", "deleteteItem"];