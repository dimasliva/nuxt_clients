import { IUserCredentials, IUserCredentialsServer } from "@/lib/Security";
import { MoApiClient } from "@/lib/MoApi/MoApiClient";
import { MoApiClientSettings } from "~~/lib/MoApi/MoApiClientSettings";
import "reflect-metadata";
import   crypto from "crypto";
import { EncryptAes256, DecryptAes256 } from "@/lib/Security/Crypto";

export default eventHandler(async (event) => {
    console.debug("Server OK");

    let key="F1945A446668430A888955BCDBDD8394F1945A446668430A888955BCDBDD8395";
  
    let userCred: IUserCredentialsServer|undefined = await readBody(event);

    if (!userCred || typeof userCred!="object")
    {
        let crypted=getCookie(event, "user_session");

        if(crypted){
            userCred=JSON.parse(DecryptAes256(key,crypted)||"null");
            console.debug("cred from cookie: " + JSON.stringify(userCred));
        }
    }
    else
       console.debug("cred from req: " + JSON.stringify(userCred));


    if (!userCred)
        throw createError({
            message: "User credentials not found",
            statusCode: 401
        });

    const apiClient = new MoApiClient().init(new MoApiClientSettings()) //iocc.get<MoApiClient>("MoApiClientSettings");
    apiClient.MoApiClientSettings.ip = "172.16.121.60";

    apiClient.MoApiClientSettings.Credentials = userCred;
    try {
        let authData = await apiClient.AuthorizeServer(userCred);
        console.debug("Auth OK");

        setCookie(event, "user_session", EncryptAes256(key,JSON.stringify(userCred)))
        return authData;
    }
    catch (exc: any) {
        console.debug("Auth FAIL");
        deleteCookie(event, "user_session");
        throw createError({
            message: exc.code,
            statusCode: 401
        });
    }

});
