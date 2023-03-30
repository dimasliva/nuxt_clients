
export class Exception {

    code: string;
    message: string;


    constructor(code: string, message: string) {
        this.code = code||"--";
        this.message = message
    }

    toLog(excIn:string=""){
       console.error(`Exception ${excIn? " in "+excIn :""}: code: "${this.code}"  message: "${this.message}"`)
    }
}


export class NetException extends  Exception{

    response?:Response|null;
    bodyData?:any;
    statusCode:number=0;

    constructor(code: string, message: string, statusCode:number,  response?: Response|null, bodyData?:string | object|null) {
        super(code,message);
        this.statusCode = statusCode;
        this.response = response;
        this.bodyData = bodyData;
    }

     toLog(excIn:string=""){
       let bd= "";
       if(this.bodyData)
        bd= (typeof this.bodyData=="string")? this.bodyData: JSON.stringify(this.bodyData);
        
       console.error(`Exception ${excIn? " in "+excIn :""}: code: "${this.code}"  message: "${this.message}"  status: "${this.statusCode}"  body: "${bd}"`);
    }
}