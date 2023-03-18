import { MoApiClient } from "@/lib/MoApi/MoApiClient";
import { MoApiClientSettings } from "@/lib/MoApi/MoApiClientSettings";
import { UserContext } from "@/lib/UserContext";
import { Container } from "inversify";


export default (container:Container) => {
    if (!container.isBound("UserContext")) {
        let moApiClientSettings = new MoApiClientSettings();
        moApiClientSettings.ip = "172.16.121.60";

        container.bind('NuxtApp').toConstantValue(useNuxtApp());
        container.bind('MoApiClient').to(MoApiClient).inSingletonScope();
        container.bind('MoApiClientSettings').toConstantValue(moApiClientSettings);
        container.bind('UserContext').to(UserContext).inSingletonScope();
        console.info("startup init");

    }
}
