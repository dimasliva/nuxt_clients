import { UserContext } from "~~/lib/UserContext";

export const getComponent = async (componentName) => {


    let compModule: any | null = null;
    let path=`@/components/forms/${componentName}.vue`
    let path2="@/components/forms/Table.vue"
    let name="Table"
    compModule = await import(`@/components/forms/${componentName}.vue`);
    if (!compModule)
        return null;

    if (compModule.RequiredRights) {
        let iocc = useContainer();
        let userCtx = iocc.get<UserContext>("UserContext");

        let modules = compModule.RequiredRights.Modules;
        for (let module of modules) {
            if (chkLicModule(userCtx, module)) {
                let roles = compModule.RequiredRights.Roles;
                for (let role of roles) {
                    if (chkRole(userCtx, role))
                        return compModule?.default || null
                }
            }
        }
    }

    return null;
}


function chkLicModule(userCtx: UserContext, licModule: string) {
    let lics = userCtx.CompanyLicense;
    if (lics[licModule]) {
        let untilDate = lics[licModule].untilMax;
        if (untilDate) {
            let licDate = new Date(untilDate);
            return (new Date()) < licDate;
        }
        else
            return true;
    }
    return false;
}

let _rolesCaheArr: string[] | null = null;

function chkRole(userCtx: UserContext, role) {
    if (!_rolesCaheArr) {
        let roles = userCtx.EmployeeData?.roles;
        _rolesCaheArr = roles?.split(",") || null;
    }

    if (!_rolesCaheArr)
        return false;

    return _rolesCaheArr.includes(role)
}