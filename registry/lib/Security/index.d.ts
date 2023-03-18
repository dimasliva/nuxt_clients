

export  interface IUserCredentials {
        login: string|null;
        password: string|null;
        refreshToken:string|null;

    }

    export  interface IAuthorityData {
        accountId: string;
        companyId: string|null;
        userId: string;
        token: string;
        refreshToken:string;
        hosts: string[]
    }
    

