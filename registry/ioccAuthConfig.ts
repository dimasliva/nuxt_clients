import { MoApiClient } from "@/lib/MoApi/MoApiClient";
import { MoApiClientSettings } from "@/lib/MoApi/MoApiClientSettings";
import { UserContext } from "@/lib/UserContext";
import { Container } from "inversify";


export default (userCtx:UserContext, container:Container) => {
//todo конфигурацию на основе профилей
        console.info("iocc after auth");
}
