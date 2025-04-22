export const useClientAddModalTabProfile = () => {
  const { t } = useI18n();
  const genders = [t("male"), t("female")];

  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store); 

  const newAvatar = ref<string | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);

  const handleChangeAvatarClick = () => {
    if (fileInput.value) {
      fileInput.value.click();
    }
  };

  const onChangeAvatar = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newAvatar.value = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  const onDeleteAvatar = () => {
    newAvatar.value = null;
  };

  watch(userInfo, () => {
    console.log("useClientAddModalTabProfile userInfo", userInfo.value);
  });

  return {
    userInfo,
    genders,
    newAvatar,
    fileInput,
    handleChangeAvatarClick,
    onChangeAvatar,
    onDeleteAvatar,
  };
};
