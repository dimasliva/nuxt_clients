import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export const useUpdateAppProfile = () => {
  const store = useEmployeesStore();
  const { updateAppProfileParams } = storeToRefs(store);

  const { } = store;

  const { mutate: updateAppProfile, isPending: isPendingUpdateAppProfile } = useMutation({
    mutationKey: ["update app profile"],
    mutationFn: () => EmployeesService.updateAppProfile(updateAppProfileParams.value),
    onSuccess: (response) => {
        console.log('profile updated')
    },
    onError: (error: any) => {
      toast.error("Ошибка при обновлении профиля!");
    },
  });

  return {
    updateAppProfile,
    isPendingUpdateAppProfile,
  };
};
