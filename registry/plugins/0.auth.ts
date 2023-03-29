
import type { UserContext } from "@/lib/UserContext";
import { EmployeeRecord } from "@/lib/MoApi/Records/EmployeeRecord";
import type { RecordsStore } from "@/lib/MoApi/Records/RecordsStore";
import   ioccAfterAuthConfig  from "@/ioccAuthConfig";


export default defineNuxtPlugin(async (nuxtApp) => {
        // Skip plugin when rendering error page
        if (nuxtApp.payload.error) {
                return;
        }
        const iocc = useContainer();
        const userCtx = iocc.get<UserContext>("UserContext");
        await userCtx.tryAuthorize();
        ioccAfterAuthConfig(userCtx,iocc);

        /*
        if (userCtx.isAuth) {
                //получение профилей

                const sessionContainer = useSessionContainer();
                try {
                        const recStore = sessionContainer.get<RecordsStore>("RecordsStore");
                        let empl = await recStore.fetch(EmployeeRecord, userCtx.AuthorityData!.userId);


                }
                finally {
                        sessionContainer.unbindAllAsync();
                }
        }
        */

        addRouteMiddleware('auth.global', (to, from) => {
                console.debug("middleware auth")
                const userCtx = useContainer().get<UserContext>("UserContext");

                if (to.path.endsWith("/signout")) {
                        userCtx.signout();
                        return navigateTo('/signin')
                }

                if (!userCtx.isAuth) {
                        if (!to.path.endsWith("/signin") && !to.path.endsWith("/registration"))
                                return navigateTo('/signin')
                }
                else
                        if (to.path.endsWith("/signin") || to.path.endsWith("/registration"))
                                return navigateTo('/dashboard')
        },
                { global: true }
        );
})