import { IUserCredentials, IUserCredentialsServer } from "@/lib/Security";
import { MoApiClient } from "@/lib/MoApi/MoApiClient";
import { MoApiClientSettings } from "~~/lib/MoApi/MoApiClientSettings";
import "reflect-metadata";
import   crypto from "crypto";
import { EncryptAes256, DecryptAes256 } from "@/lib/Security/Crypto";

export default eventHandler(async (event) => {
    console.debug("Server auth invoke");

    const rtmConfig=useRuntimeConfig();
    //let key="F1945A446668430A888955BCDBDD8394F1945A446668430A888955BCDBDD8395";
  
    let userCred: IUserCredentialsServer|undefined = await readBody(event);

    if (!userCred)
        throw createError({
            message: "User credentials not found",
            statusCode: 401
        });

    const apiClient = new MoApiClient().init(new MoApiClientSettings()) //iocc.get<MoApiClient>("MoApiClientSettings");
    apiClient.MoApiClientSettings.ip = rtmConfig.mainApiServer;
    apiClient.MoApiClientSettings.port=rtmConfig.mainApiServerPort;
    apiClient.MoApiClientSettings.appId = rtmConfig.appId;
    userCred.clientIp= null;//event.req.connection.remoteAddress || event.req.socket.remoteAddress!;
    
    console.debug(JSON.stringify(userCred));
    try {
        let authData = await apiClient.AuthorizeServer(userCred);
        console.debug("Auth OK");

        return authData;
    }
    catch (exc: any) {
        console.debug("Auth FAIL");
        throw createError({
            message: exc.code,
            statusCode: 401
        });
    }

});
