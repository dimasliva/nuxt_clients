import { useMutation } from "@tanstack/vue-query";

export const useUpdateClientContacts = () => {
  const store = useClientModalStore();
    const {openUserId, getParamsUpdateClientContacts} = storeToRefs(store)

  const { setChangedAt, setContactsChangedAt } = store

    const {
        mutate: updateClientContacts,
        isPending: isPendingUpdateClientContacts,
      } = useMutation({
        mutationKey: ["update client contacts", openUserId.value],
        mutationFn: () =>
          ClientService.updateClientContacts(getParamsUpdateClientContacts.value),
        onSuccess: (response) => {
          setChangedAt(response.result.changedAt)
          setContactsChangedAt(response.result.changedAt)
        },
        onError: (error: any) => {
        },
      });

    return {
      updateClientContacts, isPendingUpdateClientContacts,
    }
}