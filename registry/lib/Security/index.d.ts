

export  interface IUserCredentials {
        login: string;
        password: string
    }

    export  interface IAuthorityData {
        accountId: string;
        companyId: string|null;
        userId: string;
        token: string;
        hosts: string[]
    }
    

