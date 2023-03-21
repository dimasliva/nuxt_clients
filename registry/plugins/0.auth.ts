
import type { UserContext } from "@/lib/UserContext";


export default defineNuxtPlugin(async (nuxtApp) => {
        // Skip plugin when rendering error page
        if (nuxtApp.payload.error) {
                return;
        }
        const iocc = useContainer();
        const defCtx = iocc.get<UserContext>("UserContext");
        await defCtx.tryAuthorize();

        addRouteMiddleware('auth.global', (to, from) => {
                console.debug("middleware auth")
                const defCtx = useContainer().get<UserContext>("UserContext");

                if (to.path.endsWith("/signout")) {
                        defCtx.signout();
                        return navigateTo('/signin')
                }

                if (!defCtx.isAuth) {
                        if (!to.path.endsWith("/signin"))
                                return navigateTo('/signin')
                }
                else
                        if (to.path.endsWith("/signin"))
                                return navigateTo('/dashboard')
        },
                { global: true }
        );
})