export const useClientAddModalTabProfile = () => {
  const { t } = useI18n();
  const genders = [t("male"), t("female")];
  const fileInput = ref<HTMLInputElement | null>(null);

  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store); 
  const { changeAvatar, deleteAvatar } = store

  const {textRules} = useRules()

  const handleChangeAvatarClick = () => {
    if (fileInput.value) {
      fileInput.value.click();
    }
  };

  const onChangeAvatar = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      changeAvatar(input.files[0])
      
    }
  };

  const onDeleteAvatar = () => {
    deleteAvatar()
  };

  return {
    genders,
    userInfo,
    fileInput,
    textRules,
    handleChangeAvatarClick,
    onChangeAvatar,
    onDeleteAvatar,
  };
};
