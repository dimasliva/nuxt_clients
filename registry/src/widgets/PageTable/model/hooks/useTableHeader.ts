import type { ITableHeader } from "~/src/widgets/PageTable/model/types/pagetable";

export const useTableHeader = () => {
  const { t } = useI18n();

  const idColumn: ITableColumn = {
    key: "id",
    title: "ID",
    align: "start",
    sortable: true,
    width: "30%",
  };

  const nameColumn: ITableColumn = {
    key: "name",
    title: t("name"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const surnameColumn: ITableColumn = {
    key: "surname",
    title: t("surname"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const patronymicColumn: ITableColumn = {
    key: "patronymic",
    title: t("patronymic"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const birthdateColumn: ITableColumn = {
    key: "birthdate",
    title: t("birthdate"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const genderColumn: ITableColumn = {
    key: "gender",
    title: t("gender"),
    sortable: true,
    align: "start",
    width: "300px",
  };

  const mainPhoneColumn: ITableColumn = {
    key: "mainPhone",
    title: t("mainphone"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const mainEmailColumn: ITableColumn = {
    key: "mainEmail",
    title: t("email"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const snilsColumn: ITableColumn = {
    key: "snils",
    title: t("snils"),
    sortable: true,
    align: "start",
    width: "30%",
  };

  const fioColumn: ITableColumn = {
    key: "fio",
    title: t("fio"),
    sortable: true,
    align: "start",
    width: "100px",
  };

  const tableHeader: ITableHeader = {
    id: idColumn,
    name: nameColumn,
    surname: surnameColumn,
    patronymic: patronymicColumn,
    birthdate: birthdateColumn,
    gender: genderColumn,
    mainPhone: mainPhoneColumn,
    mainEmail: mainEmailColumn,
    snils: snilsColumn,
    fio: fioColumn,
  };

  return {
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
