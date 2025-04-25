import { defineStore } from "pinia";
import {
  EClientTabs,
  EGenderProfile,
  type IAddClientParams,
  type IClientAddress,
  type IClientAddresses,
  type IClientAddressResponse,
  type IClientDocuments,
  type IClientPhoto,
  type IOpenUser,
  type IOtherDocumentsRequestParams,
  type IProfileActualAddress,
  type IRectsOtherDocument,
  type IRequestSetClientDocumentsParams,
  type IRequestSetClientSdParams,
  type ISetClientAddresses,
  type IUpdateClient,
  type IUpdateClientContacts,
} from "../types/clients";
import {
  ClientCountryText,
  ClientDocumentsText,
  ClientRegionText,
  ClientSettlementText,
} from "../constants/clients";
import type {
  IRecData1,
  IRecData2,
  IRecData3,
} from "~/src/features/Records/model/types/records";

export const useClientModalStore = defineStore("clientModalStore", {
  state: () => ({
    activeTab: EClientTabs.profile as EClientTabs,
    actualAddress: {} as IProfileActualAddress,
    permanentAddress: {} as IProfileActualAddress,
    userInfo: {
      avatarPreview: "",
      photoId: null,
      avatar: null,
      changedAt: "",
      birthdate: "",
      selectedGender: "",
      gender: EGenders.m,
      id: "",
      name: "",
      patronymic: "",
      surname: "",
      contacts: {
        mainPhone: "",
        reservPhone: "",
        mainEmail: "",
      },
      documents: {
        id: "",
        changedAt: "",
        snils: "",
        mainDocument: 0,
        mainDocumentSeries: "",
        mainDocumentNumber: "",
        mainDocumentWhen: "",
        mainDocumentWho: "",
        mainDocumentWhoCode: "",
        otherDocuments: [],
        advData: null,
        mainDocumentText: "",
      },
      addresses: {
        id: "",
        mainAddress: {
          building: "",
          corp: "",
          country: 0,
          district: "",
          flat: "",
          regionCode: 0,
          settlement: "",
          settlementType: 0,
          street: "",
          zip: "",
          countryText: "",
          regionText: "",
          settlementText: "",
        },
        permanentRegistration: null,
        addressesEqual: null,
        advData: null,
        changedAt: "",
      },
    } as IOpenUser,
    notChangedUserInfo: {
      avatarPreview: "",
      photoId: null,
      avatar: null,
      changedAt: "",
      birthdate: "",
      selectedGender: "",
      gender: EGenders.m,
      id: "",
      name: "",
      patronymic: "",
      surname: "",
      contacts: {
        mainPhone: "",
        reservPhone: "",
        mainEmail: "",
      },
      documents: {
        id: "",
        changedAt: "",
        snils: "",
        mainDocument: 0,
        mainDocumentSeries: "",
        mainDocumentNumber: "",
        mainDocumentWhen: "",
        mainDocumentWho: "",
        mainDocumentWhoCode: "",
        otherDocuments: [],
        advData: null,
        mainDocumentText: "",
      },
      addresses: {
        id: "",
        mainAddress: {
          building: "",
          corp: "",
          country: 0,
          district: "",
          flat: "",
          regionCode: 0,
          settlement: "",
          settlementType: 0,
          street: "",
          zip: "",
          countryText: "",
          regionText: "",
          settlementText: "",
        },
        permanentRegistration: null,
        addressesEqual: null,
        advData: null,
        changedAt: "",
      },
    } as IOpenUser,
    isEditDocument: false as boolean,
    openUserId: "-1" as string,
    editOtherDocument: {} as IRectsOtherDocument,
    openUserPhoto: {} as IClientPhoto,
    updatedAvatar: null as FormData | null,
    paramsUpdateFilelink: {} as IResponseFile,
    paramsUpdateClientContacts: {} as IUpdateClientContacts,
  }),
  actions: {
    switchTab(tab: EClientTabs) {
      this.activeTab = tab;
    },
    setAvatar(data: Blob | null, avatarFromAPI?: boolean) {
      const avatar = data ? URL.createObjectURL(data) : "";
      this.userInfo.avatarPreview = avatar;
      if (avatarFromAPI) {
        this.notChangedUserInfo.avatarPreview = avatar;
      }
    },
    setEditOtherDocument(data: IRectsOtherDocument) {
      this.editOtherDocument = { ...data };
    },
    updateOtherDocumentByEdit(edit: IRectsOtherDocument) {
      const index = this.userInfo.documents.otherDocuments.findIndex(
        (val) => val.typeCode === edit.typeCode
      );
      if (index !== -1) {
        const date = new Date(edit.when);
        const formattedDate = date.toISOString().split("T")[0];
        edit.when = formattedDate;
        this.userInfo.documents.otherDocuments[index] = edit;
      }
    },
    deleteAvatar() {
      this.userInfo.avatarPreview = "";
    },
    setIsEditDocument(value: boolean) {
      this.isEditDocument = value;
    },
    setParamsUpdateFilelink(data: IResponseFile) {
      this.paramsUpdateFilelink = data;
      this.openUserPhoto.id = data.id;
      this.paramsUpdateFilelink.client = this.openUserId;
      this.paramsUpdateFilelink.title = `#clientPhoto@${this.openUserId}`;
    },
    async changeAvatar(file: File) {
      try {
        const blob = new Blob([file], { type: file.type });
        this.setAvatar(blob);
        const formData = new FormData();
        formData.append("filetype", "1");
        if (this.openUserPhoto.id) {
          formData.append("FilelinkId", this.openUserPhoto.id);
        }
        formData.append("File", file);
        this.updatedAvatar = formData;
      } catch (error) {
        console.error("Error changing avatar:", error);
      }
    },
    setDefaultUserData() {
      this.notChangedUserInfo = {
        ...this.userInfo,
        documents: {
          ...this.userInfo.documents,
          otherDocuments: [...this.userInfo.documents.otherDocuments],
        },
        addresses: {
          ...this.userInfo.addresses,
          mainAddress: {
            ...this.userInfo.addresses.mainAddress,
            countryText: this.userInfo.addresses.mainAddress.countryText,
            regionText: this.userInfo.addresses.mainAddress.regionText,
            settlementText: this.userInfo.addresses.mainAddress.settlementText,
          },
          permanentRegistration: this.userInfo.addresses.permanentRegistration
            ? { ...this.userInfo.addresses.permanentRegistration }
            : null,
        },
        contacts: {
          ...this.userInfo.contacts,
        },
      };
    },

    resetUserInfo() {
      this.openUserPhoto = { id: null, changedAt: "" };
      this.openUserId = "-1";

      const findCountry = ClientCountryText.find(
        (val) => val.key === ClientRussiaCountryKey
      );
      const findRegion = ClientRegionText.find((val) => val.key === 1);
      const findSettlement = ClientSettlementText.find((val) => val.key === 1);

      const defaultContacts = {
        mainEmail: "",
        mainPhone: "",
        reservPhone: "",
        changedAt: "",
      };

      const defaultDocuments = {
        advData: null,
        changedAt: "",
        id: "",
        mainDocumentText: ClientDocumentTypes[0].value,
        snils: "",
        mainDocumentNumber: "",
        mainDocumentSeries: "",
        mainDocumentWhen: "",
        mainDocumentWho: "",
        mainDocumentWhoCode: "",
        otherDocuments: [],
        mainDocument: 1,
      };

      const defaultAddress = {
        building: "",
        corp: "",
        country: 1,
        district: "",
        flat: "",
        regionCode: 1,
        settlement: "",
        settlementType: 1,
        countryText: findCountry ? findCountry.value : "",
        regionText: findRegion ? findRegion.value : "",
        settlementText: findSettlement ? findSettlement.value : "",
        street: "",
        zip: "",
      };

      const defaultAddresses = {
        mainAddress: { ...defaultAddress },
        permanentRegistration: { ...defaultAddress },
        addressesEqual: false,
        advData: null,
        changedAt: "",
        id: "",
      };

      const commonUserInfo = {
        avatarPreview: "",
        photoId: null,
        avatar: null,
        birthdate: "",
        gender: EGenders.m,
        selectedGender: EGenderProfile.male,
        id: "",
        name: "",
        patronymic: "",
        surname: "",
        changedAt: "",
        contacts: { ...defaultContacts },
        documents: { ...defaultDocuments },
        addresses: { ...defaultAddresses },
      };

      this.userInfo = { ...commonUserInfo };
      this.notChangedUserInfo = { ...commonUserInfo };
    },

    setOpenUserId(value: string) {
      this.openUserId = value;
    },
    setDefaultActiveTab() {
      this.activeTab = EClientTabs.profile;
    },
    formatRecordResponse(result: any[]): IRecordResponse {
      return {
        photo: result[0] ? (result[0] as IRecDataPhoto) : null,
        documents: result[1] ? (result[1] as IRecData1) : null,
        contacts: result[2] ? (result[2] as IRecData2) : null,
        addresses: result[3] ? (result[3] as IRecData3) : null,
      };
    },
    setUserInfo(data: IRecordResponse) {
      if (data.photo) {
        this.openUserPhoto.id = data.photo.photo;
        this.openUserPhoto.changedAt = data.photo.changedAt;
      } else {
        this.openUserPhoto.id = null;
        this.openUserPhoto.changedAt = "";
      }
      this.setDocument(data.documents);
      this.setContactData(data.contacts);
      this.setRegistration(data.addresses);
    },
    setFIOData(data: IUser) {
      const selectedGender =
        data.gender === EGenders.m
          ? EGenderProfile.male
          : data.gender === EGenders.f
          ? EGenderProfile.female
          : EGenderProfile.male;

      const { id, name, changedAt, surname, patronymic, birthdate } = data;

      const userData = {
        id,
        name,
        changedAt,
        surname,
        patronymic,
        selectedGender,
        birthdate,
      };

      Object.assign(this.userInfo, userData);
      Object.assign(this.notChangedUserInfo, userData);
    },

    setContactData(data: IRecData2 | null) {
      const createContactObject = (
        data: IRecData2 | null
      ): IClientContacts => ({
        mainEmail: data?.mainEmail || "",
        mainPhone:
          data?.mainPhone && data.mainPhone.length > 0
            ? `+${data.mainPhone}`
            : "",
        reservPhone:
          data?.reservPhone && data.reservPhone.length > 0
            ? `+${data.reservPhone}`
            : "",
        ...(data ? { changedAt: data.changedAt } : {}),
      });

      this.userInfo.contacts = createContactObject(data);
      this.notChangedUserInfo.contacts = createContactObject(data);
      console.log("this.userInfo.contacts", this.userInfo.contacts);
    },

    setDocument(data: IRecData1 | null) {
      const defaultDocumentValues = {
        snils: "",
        changedAt: "",
        mainDocument: 1,
        otherDocuments: [],
        mainDocumentNumber: "",
        mainDocumentSeries: "",
        mainDocumentWhen: "",
        mainDocumentWho: "",
        mainDocumentWhoCode: "",
        mainDocumentText: ClientDocumentTypes[0].value,
      };

      const updateDocuments = (
        documents: IClientDocuments,
        data: IRecData1 | null
      ) => {
        if (data) {
          documents.snils = data.snils || "";
          documents.changedAt = data.changedAt;
          documents.mainDocument = data.mainDocument;
          documents.otherDocuments = [...data.otherDocuments]; // Создаем новый массив
          documents.mainDocumentNumber = data.mainDocumentNumber || "";
          documents.mainDocumentSeries = data.mainDocumentSeries || "";
          documents.mainDocumentWhen = data.mainDocumentWhen || "";
          documents.mainDocumentWho = data.mainDocumentWho || "";
          documents.mainDocumentWhoCode = data.mainDocumentWhoCode || "";

          const clientDocument = ClientDocumentTypes.find(
            (val) => val.key === documents.mainDocument
          );
          documents.mainDocumentText = clientDocument
            ? clientDocument.value
            : defaultDocumentValues.mainDocumentText;
        } else {
          Object.assign(documents, defaultDocumentValues);
        }
      };

      this.userInfo.documents = {} as IClientDocuments;
      updateDocuments(this.userInfo.documents, data);

      this.notChangedUserInfo.documents = {} as IClientDocuments;
      updateDocuments(this.notChangedUserInfo.documents, data);
    },

    setRegistration(data: IRecData3 | null) {
      this.userInfo.addresses = {} as IClientAddresses;
      this.notChangedUserInfo.addresses = {} as IClientAddresses;

      if (data) {
        let permanentRegistration: IClientAddress = data.permanentRegistration;
        let mainRegistration: IClientAddress = data.mainAddress;
        this.userInfo.addresses.mainAddress = { ...mainRegistration };
        this.userInfo.addresses.permanentRegistration = {
          ...permanentRegistration,
        };
        this.userInfo.addresses.changedAt = data.changedAt;
        this.userInfo.addresses.id = data.id;
        this.userInfo.addresses.addressesEqual = data.addressesEqual;

        this.notChangedUserInfo.addresses.mainAddress = { ...mainRegistration };
        this.notChangedUserInfo.addresses.permanentRegistration = {
          ...permanentRegistration,
        };
        this.notChangedUserInfo.addresses.changedAt = data.changedAt;
        this.notChangedUserInfo.addresses.id = data.id;
        this.notChangedUserInfo.addresses.addressesEqual = data.addressesEqual;

        this.setMainCountryText(mainRegistration.country);
        this.setPermanentCountryText(permanentRegistration.country);

        this.setMainRegionText(mainRegistration.regionCode);
        this.setPermanentRegionText(permanentRegistration.regionCode);

        this.setMainSettlementText(mainRegistration.settlementType);
        this.setPermanentSettlementText(permanentRegistration.settlementType);
      } else {
        const emptyAddress = {
          building: "",
          corp: "",
          country: ClientRussiaCountryKey,
          district: "",
          flat: "",
          regionCode: 1,
          settlement: "",
          settlementType: 1,
          countryText: "",
          regionText: "",
          settlementText: "",
          street: "",
          zip: "",
        };
        this.userInfo.addresses.mainAddress = emptyAddress;
        this.userInfo.addresses.permanentRegistration = emptyAddress;
        this.userInfo.addresses.changedAt = "";
        this.userInfo.addresses.id = "";
        this.userInfo.addresses.addressesEqual = false;
      }
    },

    setMainCountryText(key: number) {
      const mainCountryText = ClientCountryText.find((val) => val.key === key);
      this.userInfo.addresses.mainAddress.countryText = mainCountryText
        ? mainCountryText.value
        : "";
      this.notChangedUserInfo.addresses.mainAddress.countryText =
        mainCountryText ? mainCountryText.value : "";
    },
    setPermanentCountryText(key: number) {
      const permanentCountryText = ClientCountryText.find(
        (val) => val.key === key
      );
      if (this.userInfo.addresses.permanentRegistration) {
        this.userInfo.addresses.permanentRegistration.countryText =
          permanentCountryText ? permanentCountryText.value : "";
      }
      if (this.notChangedUserInfo.addresses.permanentRegistration) {
        this.notChangedUserInfo.addresses.permanentRegistration.countryText =
          permanentCountryText ? permanentCountryText.value : "";
      }
    },
    setMainRegionText(key: number) {
      const mainRegionText = ClientRegionText.find((val) => val.key === key);
      this.userInfo.addresses.mainAddress.regionText = mainRegionText
        ? mainRegionText.value
        : "";

      this.notChangedUserInfo.addresses.mainAddress.regionText = mainRegionText
        ? mainRegionText.value
        : "";
    },
    setPermanentRegionText(key: number) {
      const permanentRegionText = ClientRegionText.find(
        (val) => val.key === key
      );
      if (this.userInfo.addresses.permanentRegistration) {
        this.userInfo.addresses.permanentRegistration.regionText =
          permanentRegionText ? permanentRegionText.value : "";
      }

      if (this.notChangedUserInfo.addresses.permanentRegistration) {
        this.notChangedUserInfo.addresses.permanentRegistration.regionText =
          permanentRegionText ? permanentRegionText.value : "";
      }
    },
    setMainSettlementText(key: number) {
      const mainSettlementText = ClientSettlementText.find(
        (val) => val.key === key
      );
      this.userInfo.addresses.mainAddress.settlementText = mainSettlementText
        ? mainSettlementText.value
        : "";

      this.notChangedUserInfo.addresses.mainAddress.settlementText =
        mainSettlementText ? mainSettlementText.value : "";
    },
    setPermanentSettlementText(key: number) {
      const permanentSettlementText = ClientSettlementText.find(
        (val) => val.key === key
      );
      if (this.userInfo.addresses.permanentRegistration) {
        this.userInfo.addresses.permanentRegistration.settlementText =
          permanentSettlementText ? permanentSettlementText.value : "";
      }

      if (this.notChangedUserInfo.addresses.permanentRegistration) {
        this.notChangedUserInfo.addresses.permanentRegistration.settlementText =
          permanentSettlementText ? permanentSettlementText.value : "";
      }
    },
    setClientChangedAt(value: string) {
      this.userInfo.changedAt = value;
      this.notChangedUserInfo.changedAt = value;
    },
    setClientId(value: string) {
      this.userInfo.id = value;
      this.notChangedUserInfo.id = value;
      this.openUserId = value;
    },
    setChangedAt(changedAt: string) {
      this.userInfo.changedAt = changedAt;
      this.notChangedUserInfo.changedAt = changedAt;
    },
    addOtherDocument(doc: IRectsOtherDocument) {
      let arr = [...this.userInfo.documents.otherDocuments];
      arr.push(doc);
      this.userInfo.documents.otherDocuments = [...arr];
    },
    removeOtherDocument(doc: IRectsOtherDocument) {
      const index = this.userInfo.documents.otherDocuments.indexOf(doc);
      this.userInfo.documents.otherDocuments.splice(index, 1);
    },
    setContactsChangedAt(changedAt: string) {
      this.userInfo.contacts.changedAt = changedAt;
      this.notChangedUserInfo.contacts.changedAt = changedAt;
    },

    setAddressCountry(value: string) {
      this.actualAddress.county = value;
    },
    setAddressRegion(value: string) {
      this.actualAddress.region = value;
    },
    setDocumentsChangedAt(value: string) {
      this.userInfo.documents.changedAt = value;
      this.notChangedUserInfo.documents.changedAt = value;
    },
    setAddressesChangedAt(value: string) {
      this.userInfo.addresses.changedAt = value;
      this.notChangedUserInfo.addresses.changedAt = value;
    },
    setAddressLocationType(value: string) {
      this.actualAddress.localityType = value;
    },
  },
  getters: {
    getUser(): IUpdateClient {
      let date = new Date(this.userInfo.birthdate);
      date.setDate(date.getDate() + 1);
      let formattedBirthdate = date.toISOString().split("T")[0];

      return {
        id: this.userInfo.id,
        changedAt: this.userInfo.changedAt,
        name: this.userInfo.name,
        surname: this.userInfo.surname,
        patronymic: this.userInfo.patronymic,
        gender: this.userInfo.gender,
        birthdate: formattedBirthdate,
        notActive: null,
        advData: null,
      };
    },
    getParamsUpdateClientContacts(): IUpdateClientContacts {
      const res: IUpdateClientContacts = {
        id: this.openUserId,
        mainEmail: this.userInfo.contacts.mainEmail,
        mainPhone: this.userInfo.contacts.mainPhone.replace("+", ""),
        reservPhone: this.userInfo.contacts.reservPhone
          ? this.userInfo.contacts.reservPhone.replace("+", "")
          : null,
        otherContacts: null,
        advData: null,
      };

      if (this.userInfo.contacts.changedAt) {
        res.changedAt = this.userInfo.contacts.changedAt;
      }
      return res;
    },
    getParamsSetClientSd(): IRequestSetClientSdParams {
      let response: IRequestSetClientSdParams = {
        id: this.openUserId,
        photo: this.userInfo.avatarPreview ? this.openUserPhoto.id : null,
        advData: null,
        citizenship: null,
        comments: null,
        individualId: null,
        kinship: null,
      };

      if (this.openUserPhoto.changedAt !== "") {
        response.changedAt = this.openUserPhoto.changedAt;
      }
      return response;
    },
    getParamsSetClientDocuments(): IRequestSetClientDocumentsParams {
      const doc = ClientDocumentsText.find(
        (val) => val.value === this.userInfo.documents.mainDocumentText
      );

      let formattedDate: string | null = null;
      if (this.userInfo.documents.mainDocumentWhen) {
        const date = new Date(this.userInfo.documents.mainDocumentWhen);
        date.setDate(date.getDate() + 1);
        formattedDate = date.toISOString().split("T")[0];
      }

      const otherDocuments: IOtherDocumentsRequestParams[] =
        this.userInfo.documents.otherDocuments.map((doc) => {
          const inputDate = doc.when;
          let formattedDate = inputDate;
          if (inputDate.split(".").length > 1) {
            const [day, month, year] = inputDate.split(".");
            formattedDate = `${year}-${month}-${day}`;
          }

          return {
            ...doc,
            when: formattedDate,
            type: null,
            who: null,
            whoCode: null,
          };
        });

      const res: IRequestSetClientDocumentsParams = {
        id: this.userInfo.id,
        snils: this.userInfo.documents.snils,
        mainDocument: doc ? doc.key : 1,
        mainDocumentSeries: this.userInfo.documents.mainDocumentSeries,
        mainDocumentNumber: this.userInfo.documents.mainDocumentNumber,
        mainDocumentWhen: formattedDate,
        mainDocumentWho: this.userInfo.documents.mainDocumentWho,
        mainDocumentWhoCode: this.userInfo.documents.mainDocumentWhoCode,
        otherDocuments: otherDocuments,
        advData: null,
      };
      if (this.userInfo.documents.changedAt !== "") {
        res.changedAt = this.userInfo.documents.changedAt;
      }
      return res;
    },
    getParamsAddClient(): IAddClientParams {
      const birthdate = this.userInfo.birthdate.length
        ? this.userInfo.birthdate
        : null;
      return {
        advData: null,
        birthdate: birthdate,
        gender: this.userInfo.gender,
        name: this.userInfo.name,
        notActive: null,
        patronymic: this.userInfo.patronymic,
        surname: this.userInfo.surname,
      };
    },
    getParamsSetClientAddresses(): ISetClientAddresses {
      const getAddressData = (address: IClientAddress) => {
        const countryText = address.countryText;
        const country = ClientCountryText.find(
          (val) => val.value === countryText
        );

        const settlementText = address.settlementText;
        const settlement = ClientSettlementText.find(
          (val) => val.value === settlementText
        );

        const regionText = address.regionText;
        const region = ClientRegionText.find((val) => val.value === regionText);

        return {
          building: address.building,
          corp: address.corp,
          country: country ? country.key : ClientRussiaCountryKey,
          district: address.district,
          flat: address.flat,
          regionCode: region ? region.key : address.regionCode,
          settlement: address.settlement,
          settlementType: settlement ? settlement.key : address.settlementType,
          street: address.street,
          zip: address.zip,
        };
      };

      const mainAddress = getAddressData(this.userInfo.addresses.mainAddress);

      let permanentRegistration: IClientAddressResponse | null = null;
      if (this.userInfo.addresses.permanentRegistration) {
        permanentRegistration = getAddressData(
          this.userInfo.addresses.permanentRegistration
        );
      }

      const res: ISetClientAddresses = {
        addressesEqual: this.userInfo.addresses.addressesEqual,
        advData: null,
        id: this.openUserId,
        mainAddress,
        permanentRegistration,
      };

      if (this.userInfo.addresses.changedAt !== "") {
        res.changedAt = this.userInfo.addresses.changedAt;
      }

      return res;
    },
    getIsUserInfoValidated(): boolean {
      function isEqual(obj1: any, obj2: any): boolean {
        if (obj1 === obj2) return true;

        if (
          obj1 == null ||
          obj2 == null ||
          typeof obj1 !== "object" ||
          typeof obj2 !== "object"
        ) {
          return false;
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (const key of keys1) {
          if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
            return false;
          }
        }

        return true;
      }

      function isValidated(userInfo: IOpenUser): boolean {
        let isError = false;
        function isValidatedName(value: string) {
          const hasNumbers = /\d/.test(value);

          if (value.length >= 2 && value.length <= 128 && !hasNumbers) {
            return false;
          }
          return true;
        }
        function isValidatedEmail(value: string) {
          const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (emailPattern.test(value) || value.length === 0) {
            return false;
          }
          return true; 
        }

        if (
          isValidatedName(userInfo.name) ||
          isValidatedName(userInfo.surname) ||
          isValidatedEmail(userInfo.contacts.mainEmail)
        ) {
          isError = true;
        }
        return isError;
      }

      return (
        !isEqual(this.userInfo, this.notChangedUserInfo) &&
        !isValidated(this.userInfo)
      );
    },
  },
});
