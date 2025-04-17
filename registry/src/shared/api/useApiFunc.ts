import type { AxiosInstance } from "axios";


const errorCatch = (error: any): string => {
    const message = error?.response?.data?.message;
  
    return message
      ? typeof error.response.data.message === "object"
        ? message[0]
        : message
      : error.message;
  };

export function setBearer(axiosInstance: AxiosInstance) {
    axiosInstance.interceptors.request.use((config) => {
      const accessToken = getAccessToken();
  
      if (config && config.headers && accessToken)
        config.headers.Authorization = `Bearer ${accessToken}`;
  
      return config;
    });
  
    axiosInstance.interceptors.response.use(
      (config) => config,
      async (error) => {
        const originalRequest = error.config;
  
        if (
          error.response.status === 401 &&
          error.config &&
          !error.config._isRetry
        ) {
          const errorMessage = errorCatch(error);
  
        //   if (errorMessage === "timeout") {
        //     originalRequest._isRetry = true;
  
        //     try {
        //       await AuthService.getNewTokens();
  
        //       return axiosInstance.request(originalRequest);
        //     } catch (err) {
        //       if (errorCatch(error) === "The refresh token is invalid.") {
        //         removeFromStorage();
        //         removeUserFromStorage();
        //         window.location.reload();
        //       }
        //     }
        //   } else if (errorMessage === "Unauthenticated.") {
        //     removeFromStorage();
        //     removeUserFromStorage();
        //     window.location.reload();
        //   }
        }
  
        throw error;
      },
    );
  }
  