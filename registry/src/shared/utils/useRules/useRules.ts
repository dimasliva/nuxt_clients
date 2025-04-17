export const useRules = () => {
const { t, locale } = useI18n();

  const emailRules = {
    required: value => !!value || t('required'),
    counter: value => value.length <= 210 ||  t('maxcharacters', 210),
    email: value => {
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return pattern.test(value) ||  t('invalidEmail')
    },
  };

  const phoneRules = [
    (value) => {
      if (value.length === 0) return true;
      const phonePattern = /^7\d{10}$/;
      return (
        phonePattern.test(value) ||
        "Введите ваш номер телефона в формате 7XXXXXXXXXX."
      );
    },
  ];

  const snilsRules = [
    (value) => {
      if (value.length === 0) return true;
      const snilsPattern = /^\d{11}$/;
      return snilsPattern.test(value) || "Введите ваш СНИЛС";
    },
  ];

  const fioRules = [
    (value) => {
      if (value.trim().length === 0) return true;

      const fioPattern = /^[а-яё]+(\s[а-яё]+)?(\s[а-яё]+)?$/i;
      return (
        fioPattern.test(value) ||
        "Введите ваше ФИО в формате: Фамилия или Фамилия Имя"
      );
    },
  ];

  return {
    emailRules,
    phoneRules,
    snilsRules,
    fioRules,
  };
};
