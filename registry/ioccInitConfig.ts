import { MoApiClient } from "@/lib/MoApi/MoApiClient";
import { MoApiClientSettings } from "@/lib/MoApi/MoApiClientSettings";
import { UserContext } from "@/lib/UserContext";
import { Container } from "inversify";
import { ModuleManager } from "./libVis/ModuleManager";
import { PageMap } from "./lib/PageMap";
import { RecordsStore } from "~/lib/MoApi/Records/RecordsStore";
import { EventBus } from "~/lib/EventBus";
import MemoryCache from "./lib/Cache/MemoryCache";
import { PageMemoryCacheStore } from "./lib/Cache/PageMemoryCacheStore";


export default (container: Container) => {
    if (!container.isBound("UserContext")) {
        container.options.autoBindInjectable = true;
        const AppConfig = useAppConfig();
        let moApiClientSettings = new MoApiClientSettings();

        container.bind('diC').toConstantValue(container);
        container.bind('NuxtApp').toConstantValue(useNuxtApp());
        container.bind('NuxtAppConfig').toConstantValue(AppConfig);
        container.bind('MoApiClient').to(MoApiClient).inSingletonScope();
        container.bind('MoApiClientSettings').toConstantValue(moApiClientSettings);
        container.bind('UserContext').to(UserContext).inSingletonScope();
        container.bind('ModuleManager').to(ModuleManager).inSingletonScope();
        container.bind('PageMap').to(PageMap).inSingletonScope();
        container.bind("RecordsStore").to(RecordsStore);
        container.bind("SysEventBus").toConstantValue(new EventBus());
        container.bind('Cache').to(MemoryCache).inSingletonScope();
        container.bind('PageCacheStore').to(PageMemoryCacheStore).inSingletonScope();
    
        container.get<MoApiClient>("MoApiClient").init();

        console.debug("iocc init");
    }
}