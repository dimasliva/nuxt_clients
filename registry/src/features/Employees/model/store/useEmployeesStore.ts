
export const useEmployeesStore = defineStore("employeesStore", {
  state: () => {
    return {
      updateAppProfileParams: {
        compSettings: {},
        pageSettings: {},
      } as IUpdateAppProfileParamsRequestParams,

    };
  },
  actions: {
    setUpdateAppProfileParams(val: IUpdateAppProfileParamsRequestParams) {

    },

  },
  getters: {
   
  },
});
