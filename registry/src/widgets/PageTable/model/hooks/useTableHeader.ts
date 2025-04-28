import type { ITableHeader } from "~/src/widgets/PageTable/model/types/pagetable";

export const useTableHeader = () => {
  const { t } = useI18n();

  // Выносим ключи в отдельный объект
  const keys = {
    id: "id",
    name: "name",
    surname: "surname",
    patronymic: "patronymic",
    birthdate: "birthdate",
    gender: "gender",
    mainPhone: "mainPhone",
    mainEmail: "mainEmail",
    snils: "snils",
    fio: "fio",
  };

  const idColumn: ITableColumn = {
    key: keys.id,
    title: "ID",
    align: "start",
    sortable: true,
    width: "30%",
  };

  const nameColumn: ITableColumn = {
    key: keys.name,
    title: t("name"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const surnameColumn: ITableColumn = {
    key: keys.surname,
    title: t("surname"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const patronymicColumn: ITableColumn = {
    key: keys.patronymic,
    title: t("patronymic"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const birthdateColumn: ITableColumn = {
    key: keys.birthdate,
    title: t("birthdate"),
    sortable: true,
    align: "start",
    width: "100px",
  };

  const genderColumn: ITableColumn = {
    key: keys.gender,
    title: t("gender"),
    sortable: true,
    align: "start",
    width: "100px",
  };

  const mainPhoneColumn: ITableColumn = {
    key: keys.mainPhone,
    title: t("mainphone"),
    sortable: true,
    align: "start",
    width: "100px",
  };

  const mainEmailColumn: ITableColumn = {
    key: keys.mainEmail,
    title: t("email"),
    sortable: true,
    align: "start",
    width: "100px",
  };

  const snilsColumn: ITableColumn = {
    key: keys.snils,
    title: t("snils"),
    sortable: true,
    align: "start",
    width: "100px",
  };

  const fioColumn: ITableColumn = {
    key: keys.fio,
    title: t("fio"),
    sortable: true,
    align: "start",
    width: "200px",
  };

  const tableHeader: ITableHeader = {
    [keys.id]: idColumn,
    [keys.name]: nameColumn,
    [keys.surname]: surnameColumn,
    [keys.patronymic]: patronymicColumn,
    [keys.birthdate]: birthdateColumn,
    [keys.gender]: genderColumn,
    [keys.mainPhone]: mainPhoneColumn,
    [keys.mainEmail]: mainEmailColumn,
    [keys.snils]: snilsColumn,
    [keys.fio]: fioColumn,
  };

  return {
    keys, // Возвращаем объект с ключами
    idColumn,
    nameColumn,
    surnameColumn,
    patronymicColumn,
    birthdateColumn,
    genderColumn,
    mainPhoneColumn,
    mainEmailColumn,
    snilsColumn,
    tableHeader,
    fioColumn,
  };
};
