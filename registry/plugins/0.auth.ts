import type { IUserCredentials } from "@/lib/Security";
import type { UserContext } from "@/lib/UserContext";
import type { MoApiClientSettings } from "@/lib/MoApi/MoApiClientSettings";


export default defineNuxtPlugin(async (nuxtApp) => {
        // Skip plugin when rendering error page
        if (nuxtApp.payload.error) {
                return;
        }
        const redirectTo = useState("user_context_class@data");
        console.debug("plugin auth invoked")
        let credCookie = useCookie<IUserCredentials | null>("user_credentials");

        if (useNuxtApp().ssrContext)
                console.debug("rawcookie " + JSON.stringify(useNuxtApp().ssrContext?.event.node.req.headers.cookie));

        if (credCookie.value) {
                const iocc = useContainer();
                const defCtx = iocc.get<UserContext>("UserContext");
                if (!defCtx.isAuth) {
                        const moApiSettings = useContainer().get<MoApiClientSettings>("MoApiClientSettings");
                        moApiSettings.Credentials = credCookie.value;
                        await defCtx.tryAuthorize();
                        if (!defCtx.isAuth) {
                                moApiSettings.Credentials = null;
                                credCookie.value = null;
                        }
                }
        }

        addRouteMiddleware('auth.global', (to, from) => {
                console.debug("middleware auth")
                const defCtx = useContainer().get<UserContext>("UserContext");

                if (to.path.endsWith("/signout")) {
                        let credCookie = useCookie<IUserCredentials | null>("user_credentials");
                        credCookie.value = null;
                        defCtx.signOut();
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