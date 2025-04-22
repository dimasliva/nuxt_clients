import { useMutation } from "@tanstack/vue-query";

export const useUpdateClient = () => {
    const store = useClientModalStore();
    const {openUserId, userInfo} = storeToRefs(store)
    const {  getUser } = store;

    const {
        mutate: updateClient,
        isPending: isPendingUpdateClient,
      } = useMutation({
        mutationKey: ["update client ", openUserId.value],
        mutationFn: () =>
          ClientService.updateClient(getUser),
        onSuccess: (response) => {
          console.log('useUpdateClient response', response)
        //   toast.success("Модули успешно изменены");
    
        //   cancelEdit();
        },
        onError: (error: any) => {
        //   toast.error("Ошибка при редактировании модулей");
        //   toast.error(error.response.data.message);
        },
      });

    return {
      updateClient, isPendingUpdateClient,
    }
}