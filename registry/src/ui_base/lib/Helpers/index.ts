
import type { UserContext } from "~/src/common/lib/UserContext";
import { errToast, warnToast } from "~/src/common/composables/useToast";



export async function action<T=void>(func: () => Promise<T>) {

    const t = useNuxtApp().$i18n.t;

    try {
        return await func();
    }
    catch (exc: any) {
        if (exc.statusCode == '429')
            errToast(t(`err_msg_FrequentRequests`));
        else
            if (exc.statusCode == '403' || exc.statusCode == '401')
                errToast(t(`err_msg_access_denied`));
            else
                errToast(t(`err_msg_${exc.code}`));

        throw exc;
    }
}


export async function chkMaxItemsLimit(data: any[]) {
    const iocc = useContainer();
    const userCtx = iocc.get<UserContext>('UserContext');
    const t = useNuxtApp().$i18n.t;

    if (data.length == userCtx.RecordsRestricions?.maxRowsPerRequest)
        warnToast(t("reachMaxListRows"));
}



const _genderMap={
    "m":"М",
    "f":"Ж",
    "u":"",
  }
  
  export  const getGenderStr=(genVal:string)=>_genderMap[genVal] || _genderMap['u'];
  
  