import { MoApiClient } from "@/lib/MoApi/MoApiClient";
import { MoApiClientSettings } from "@/lib/MoApi/MoApiClientSettings";
import { UserContext } from "@/lib/UserContext";
import { Container } from "inversify";


export default (container:Container) => {
    if (!container.isBound("UserContext")) {
        const appConfig=useAppConfig();
        let moApiClientSettings = new MoApiClientSettings();
        moApiClientSettings.ip = appConfig.apiAddress;
        moApiClientSettings.port = appConfig.apiPort;

        container.bind('NuxtApp').toConstantValue(useNuxtApp());
        container.bind('NuxtAppConfig').toConstantValue(appConfig);
        container.bind('MoApiClient').to(MoApiClient).inSingletonScope();
        container.bind('MoApiClientSettings').toConstantValue(moApiClientSettings);
        container.bind('UserContext').to(UserContext).inSingletonScope();
        console.info("startup init");

    }
}
