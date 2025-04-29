import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export const useSetClientSd = () => {
  const store = useClientModalStore();
  const { openUserPhoto, getParamsSetClientSd } = storeToRefs(store);
  
  const {  } = store;

  const { mutate: updateSetClientSd, isPending: isPendingUpdateClient } =
    useMutation({
      mutationKey: ["set clientsd ", openUserPhoto.value.id],
      mutationFn: () => ClientService.SetClientSd(getParamsSetClientSd.value),
      onSuccess: (response) => {
        toast.success("Аватар успешно изменён!");
      },
      onError: (error: any) => {
        toast.error("Произошла ошибка при изменении аватара!");
      },
    });

  return {
    updateSetClientSd,
    isPendingUpdateClient,
  };
};
