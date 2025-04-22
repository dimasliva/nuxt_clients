import { useMutation } from "@tanstack/vue-query";

export const useUpdateClient = () => {
    const store = useClientModalStore();
    const {openUserId, userInfo} = storeToRefs(store)
    const {  getUser } = store;

    const {
        mutate: updateModulesInGroup,
        isPending: isPendingUpdateModulesInGroup,
      } = useMutation({
        mutationKey: ["update client ", openUserId.value],
        mutationFn: () =>
          ClientService.updateClient(getUser),
        onSuccess: () => {
        //   toast.success("Модули успешно изменены");
    
        //   cancelEdit();
    
        //   queryClient.invalidateQueries({
        //     queryKey: ["get all groups"],
        //   });
        },
        onError: (error: any) => {
        //   toast.error("Ошибка при редактировании модулей");
        //   toast.error(error.response.data.message);
        },
      });
}