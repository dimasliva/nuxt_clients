import { MoApiClient } from "~/src/common/lib/MoApi/MoApiClient";
import { MoApiClientSettings } from "~/src/common/lib/MoApi/MoApiClientSettings";
import { UserContext } from "~/src/common/lib/UserContext";
import { Container } from "inversify";


export default (userCtx:UserContext, container:Container) => {
//todo конфигурацию на основе профилей
        console.debug("iocc after auth init");
}
