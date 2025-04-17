export const useClientAddModalTabContact = () => {
  const mainPhone = ref<string>("");
  const backupPhone = ref<string>("");
  const email = ref<string>("");
  

  return {
    email,
    mainPhone,
    backupPhone
  };
};
