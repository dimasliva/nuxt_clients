export class CUserContext{
    protected _isAuth:boolean=false;
  
    get isAuth(){
      return this._isAuth;
    }
  
    set isAuth(val:boolean){
      this._isAuth=val;
    }
  
  }
  
  var defCtx=new CUserContext()
  
  export default defCtx;