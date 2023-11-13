import { MoApiClient } from "@/lib/MoApi/MoApiClient";
import { MoApiClientSettings } from "@/lib/MoApi/MoApiClientSettings";
import { UserContext } from "@/lib/UserContext";
import { Container } from "inversify";
import { ModuleManager } from "./libVis/ModuleManager";
import { PageMap } from "./lib/PageMap";
import { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { EventBus } from "~/lib/EventBus";


export default (container: Container) => {
    if (!container.isBound("UserContext")) {
        container.options.autoBindInjectable = true;
        const AppConfig = useAppConfig();
        let moApiClientSettings = new MoApiClientSettings();

        container.bind('NuxtApp').toConstantValue(useNuxtApp());
        container.bind('NuxtAppConfig').toConstantValue(AppConfig);
        container.bind('MoApiClient').to(MoApiClient).inSingletonScope();
        container.bind('MoApiClientSettings').toConstantValue(moApiClientSettings);
        container.bind('UserContext').to(UserContext).inSingletonScope();
        container.bind('ModuleManager').to(ModuleManager).inSingletonScope();
        container.bind('PageMap').to(PageMap).inSingletonScope();
        container.bind("RecordsStore").to(RecordsStore);
        container.bind("SysEventBus").toConstantValue(new EventBus());

        console.debug("iocc init");
    }
}