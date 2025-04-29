interface ICompSettings {

  }
  
  interface IPageSettings {
    [key: string]: {
      tcols: string[];
    };
  }
  
export interface IUpdateAppProfileParamsRequestParams {
    compSettings: ICompSettings;
    pageSettings: IPageSettings;
  }