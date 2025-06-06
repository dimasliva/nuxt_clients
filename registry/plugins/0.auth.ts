

import type { UserContext } from "~/src/common/lib/UserContext";
import ioccAfterAuthConfig from "~/src/configs/ioccAuthConfig";


export default defineNuxtPlugin(async (nuxtApp) => {
        // Skip plugin when rendering error page
        if (nuxtApp.payload.error) {
                return;
        }

        /*
        nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
                nuxtApp.$snackbar.showMessage({ timeout: 10000, text: error, color: 'error' })
              }
         */

        const iocc = useContainer();
        const userCtx = iocc.get<UserContext>("UserContext");
        await userCtx.tryAuthorize();
        ioccAfterAuthConfig(userCtx, iocc);

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