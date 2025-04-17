export const useClientAddModalTabProfile = () => {
  const { t } = useI18n();
  const name = ref<string>("");
  const lastname = ref<string>("");
  const surname = ref<string>("");
  const birthdate = ref<string>("");
  const gender = ref<string>(t("male"));
  const genders = [t("male"), t("female")];

  const store = useClientModalStore();
  const { userInfo } = storeToRefs(store);

  return {
    userInfo,
    name,
    lastname,
    surname,
    birthdate,
    gender,
    genders,
  };
};
