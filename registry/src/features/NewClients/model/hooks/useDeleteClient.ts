import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export const useDeleteClient = () => {
  
  const { mutate: deleteClient, isPending: isPendingDeleteClient } =
    useMutation({
      mutationKey: ["delete client"],
      mutationFn: (id: string) => ClientService.deleteClient(id),
      onSuccess: (response) => {
        toast.success("Клиент успешно удалён!");
      },
      onError: (error: any) => {
      toast.error("Ошибка при удалении клиента!");
      },
    });

  return {
    deleteClient,
    isPendingDeleteClient,
  };
};
