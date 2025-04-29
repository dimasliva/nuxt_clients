import type { INumberRules, ITextRules } from "./types/rules";

export const useRules = () => {
  const { t, locale } = useI18n();

  const emailRules = {
    required: (value) => !!value || t("required"),
    counter: (value) => value.length <= 210 || t("maxcharacters", 210),
    email: (value) => {
      if (!value) return true;
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t("invalidEmail");
    },
  };

  const phoneRules = [
    (value) => {
      if (!value) return true;
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
      if (!value) return true;
      if (value.length === 0) return true;
      const snilsPattern = /^\d{11}$/;
      return snilsPattern.test(value) || "Введите ваш СНИЛС";
    },
  ];

  const numberRules: INumberRules = {
    required: (value) => !!value || t("required"),
    isNumber: (value) => !isNaN(Number(value)) || "Значение должно быть числом",
    min: (value, min) =>
      Number(value.length) >= min || `Не меньше ${min} ${getNoun(min, "символ", "символа", "символов")}`,
    max: (value, max) =>
      Number(value.length) <= max || `Не больше ${max} ${getNoun(max, "символ", "символа", "символов")}`,
    equal: (value, equal) =>
      (value.length === equal ||value.length === 0 ) || `Должно быть ${equal} ${getNoun(equal, "символ", "символа", "символов")} `,
  };

  const textRules = {
    required: (value: string) => !!value || t("required"),
    noNumbers: (value: string) =>
      value === "" || !/\d/.test(value) || t("noNumbersAllowed"),
    noSpaces: (value: string) =>
      value === "" || !/\s/.test(value) || t("spacesNotAllowed"),
    min: (value: string, min: number) =>
      value === "" ||
      (value && value.length >= min) ||
      `Не меньше ${min} символов`,
    max: (value: string, max: number) =>
      value === "" ||
      (value && value.length <= max) ||
      `Не больше ${max} символов`,
  };
  

  const fioRules = [
    (value) => {
      if (!value) return true;
      if (value.trim().length === 0) return true;
      const fioPattern = /^[а-яёa-zA-Z]+(\s[а-яёa-zA-Z]+)?(\s[а-яёa-zA-Z]+)?$/i;
      return (
        fioPattern.test(value) ||
        "Введите ваше ФИО в формате: Фамилия Имя Отчество"
      );
    },
  ];

  return {
    numberRules,
    emailRules,
    phoneRules,
    snilsRules,
    textRules,
    fioRules,
  };
};
