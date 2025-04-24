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
      avatarPreview: null,
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
    setAvatar(data: Blob | null) {
      this.userInfo.avatarPreview = data ? URL.createObjectURL(data) : "";
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
    resetUserInfo() {
      this.openUserPhoto = { id: null, changedAt: "" };
      this.openUserId = "-1";

      const findCountry = ClientCountryText.find(
        (val) => val.key === ClientRussiaCountryKey
      );
      const findRegion = ClientRegionText.find((val) => val.key === 1);
      const findSettlement = ClientSettlementText.find((val) => val.key === 1);

      this.userInfo = {
        avatarPreview: null,
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
        contacts: {
          mainEmail: "",
          mainPhone: "",
          reservPhone: "",
          changedAt: "",
        },
        documents: {
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
        },
        addresses: {
          mainAddress: {
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
          },
          permanentRegistration: {
            building: "",
            corp: "",
            country: 1,
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
          },
          addressesEqual: false,
          advData: null,
          changedAt: "",
          id: "",
        },
      };
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
      let selectedGender = EGenderProfile.male;
      switch (data.gender) {
        case EGenders.m:
          selectedGender = EGenderProfile.male;
          break;
        case EGenders.f:
          selectedGender = EGenderProfile.female;
          break;
        default:
          break;
      }

      this.userInfo.id = data.id;
      this.userInfo.name = data.name;
      this.userInfo.changedAt = data.changedAt;
      this.userInfo.surname = data.surname;
      this.userInfo.patronymic = data.patronymic;
      this.userInfo.selectedGender = selectedGender;
      this.userInfo.birthdate = data.birthdate;
    },
    setContactData(data: IRecData2 | null) {
      this.userInfo.contacts = {} as IClientContacts;
      if (data) {
        console.log("setContactData", data);
        this.userInfo.contacts = {
          mainEmail: data.mainEmail,
          mainPhone: data.mainPhone,
          reservPhone: data.reservPhone || "",
          changedAt: data.changedAt,
        };
      } else {
        this.userInfo.contacts = {
          mainEmail: "",
          mainPhone: "",
          reservPhone: "",
        };
      }
    },
    setDocument(data: IRecData1 | null) {
      this.userInfo.documents = {} as IClientDocuments;
      if (data) {
        this.userInfo.documents.snils = data.snils || "";
        this.userInfo.documents.changedAt = data.changedAt;
        this.userInfo.documents.mainDocument = data.mainDocument;
        this.userInfo.documents.otherDocuments = data.otherDocuments;
        this.userInfo.documents.mainDocumentNumber =
          data.mainDocumentNumber || "";
        this.userInfo.documents.mainDocumentSeries =
          data.mainDocumentSeries || "";
        this.userInfo.documents.mainDocumentWhen = data.mainDocumentWhen || "";
        this.userInfo.documents.mainDocumentWho = data.mainDocumentWho || "";
        this.userInfo.documents.mainDocumentWhoCode =
          data.mainDocumentWhoCode || "";
        const clientDocument = ClientDocumentTypes.find(
          (val) => val.key === this.userInfo.documents.mainDocument
        );
        this.userInfo.documents.mainDocumentText = clientDocument
          ? clientDocument.value
          : ClientDocumentTypes[0].value;
      } else {
        this.userInfo.documents.mainDocument = 1;
        this.userInfo.documents.otherDocuments = [];
        this.userInfo.documents.mainDocumentNumber = "";
        this.userInfo.documents.mainDocumentSeries = "";
        this.userInfo.documents.mainDocumentWhen = "";
        this.userInfo.documents.mainDocumentWho = "";
        this.userInfo.documents.mainDocumentWhoCode = "";
        this.userInfo.documents.mainDocumentText = ClientDocumentTypes[0].value;
      }
    },

    setRegistration(data: IRecData3 | null) {
      this.userInfo.addresses = {} as IClientAddresses;

      if (data) {
        let permanentRegistration: IClientAddress = data.permanentRegistration;
        let mainRegistration: IClientAddress = data.mainAddress;
        this.userInfo.addresses.mainAddress = mainRegistration;
        this.userInfo.addresses.permanentRegistration = permanentRegistration;
        this.userInfo.addresses.changedAt = data.changedAt;
        this.userInfo.addresses.id = data.id;
        this.userInfo.addresses.addressesEqual = data.addressesEqual;

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
    setClientChangedAt(value: string) {
      this.userInfo.changedAt = value;
    },
    setClientId(value: string) {
      this.userInfo.id = value;
      this.openUserId = value;
    },
    setChangedAt(changedAt: string) {
      this.userInfo.changedAt = changedAt;
    },
    addOtherDocument(doc: IRectsOtherDocument) {
      this.userInfo.documents.otherDocuments.push(doc);
    },
    removeOtherDocument(doc: IRectsOtherDocument) {
      const index = this.userInfo.documents.otherDocuments.indexOf(doc);
      this.userInfo.documents.otherDocuments.splice(index, 1);
    },
    setContactsChangedAt(changedAt: string) {
      this.userInfo.contacts.changedAt = changedAt;
    },
    setMainCountryText(key: number) {
      const mainCountryText = ClientCountryText.find((val) => val.key === key);
      this.userInfo.addresses.mainAddress.countryText = mainCountryText
        ? mainCountryText.value
        : "";
    },
    setPermanentCountryText(key: number) {
      const permanentCountryText = ClientCountryText.find(
        (val) => val.key === key
      );
      if (this.userInfo.addresses.permanentRegistration) {
        this.userInfo.addresses.permanentRegistration.countryText =
          permanentCountryText ? permanentCountryText.value : "";
      }
    },
    setMainRegionText(key: number) {
      const mainRegionText = ClientRegionText.find((val) => val.key === key);
      this.userInfo.addresses.mainAddress.regionText = mainRegionText
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
    },
    setMainSettlementText(key: number) {
      const mainSettlementText = ClientSettlementText.find(
        (val) => val.key === key
      );
      this.userInfo.addresses.mainAddress.settlementText = mainSettlementText
        ? mainSettlementText.value
        : "";
    },
    setPermanentSettlementText(key: number) {
      const permanentSettlementText = ClientSettlementText.find(
        (val) => val.key === key
      );
      if (this.userInfo.addresses.permanentRegistration) {
        this.userInfo.addresses.permanentRegistration.settlementText =
          permanentSettlementText ? permanentSettlementText.value : "";
      }
    },
    setAddressCountry(value: string) {
      this.actualAddress.county = value;
    },
    setAddressRegion(value: string) {
      this.actualAddress.region = value;
    },
    setDocumentsChangedAt(value: string) {
      this.userInfo.documents.changedAt = value;
    },
    setAddressesChangedAt(value: string) {
      this.userInfo.addresses.changedAt = value;
    },
    setAddressLocationType(value: string) {
      this.actualAddress.localityType = value;
    },
  },
  getters: {
    getUser(): IUpdateClient {
      return {
        id: this.userInfo.id,
        changedAt: this.userInfo.changedAt,
        name: this.userInfo.name,
        surname: this.userInfo.surname,
        patronymic: this.userInfo.patronymic,
        gender: this.userInfo.gender,
        birthdate: this.userInfo.birthdate,
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
          const [day, month, year] = inputDate.split(".");
          const formattedDate = `${year}-${month}-${day}`;

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
      console.log("res", res);
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
      const mainAddressCountryText =
        this.userInfo.addresses.mainAddress.countryText;
      const mainCountry = ClientCountryText.find(
        (val) => val.value === mainAddressCountryText
      );

      const mainAddressSettlementText =
        this.userInfo.addresses.mainAddress.settlementText;
      const mainSettlement = ClientSettlementText.find(
        (val) => val.value === mainAddressSettlementText
      );

      const mainAddressRegionText =
        this.userInfo.addresses.mainAddress.regionText;
      const mainRegion = ClientRegionText.find(
        (val) => val.value === mainAddressRegionText
      );

      const mainAddress: IClientAddressResponse = {
        building: this.userInfo.addresses.mainAddress.building,
        corp: this.userInfo.addresses.mainAddress.corp,
        country: mainCountry ? mainCountry.key : ClientRussiaCountryKey,
        district: this.userInfo.addresses.mainAddress.district,
        flat: this.userInfo.addresses.mainAddress.flat,
        regionCode: mainRegion
          ? mainRegion.key
          : this.userInfo.addresses.mainAddress.regionCode,
        settlement: this.userInfo.addresses.mainAddress.settlement,
        settlementType: mainSettlement
          ? mainSettlement.key
          : this.userInfo.addresses.mainAddress.settlementType,
        street: this.userInfo.addresses.mainAddress.street,
        zip: this.userInfo.addresses.mainAddress.zip,
      };

      let permanentRegistration: IClientAddressResponse | null = null;
      if (this.userInfo.addresses.permanentRegistration) {
        const permanentCountryText =
          this.userInfo.addresses.permanentRegistration.countryText;
        const permanentCountry = ClientCountryText.find(
          (val) => val.value === permanentCountryText
        );

        const permanentSettlementText =
          this.userInfo.addresses.permanentRegistration.settlementText;
        const permanentSettlement = ClientSettlementText.find(
          (val) => val.value === permanentSettlementText
        );

        const permanentRegionText =
          this.userInfo.addresses.permanentRegistration.regionText;
        const permanentRegion = ClientRegionText.find(
          (val) => val.value === permanentRegionText
        );

        permanentRegistration = {
          building: this.userInfo.addresses.permanentRegistration.building,
          corp: this.userInfo.addresses.permanentRegistration.corp,
          country: permanentCountry
            ? permanentCountry.key
            : ClientRussiaCountryKey,
          district: this.userInfo.addresses.permanentRegistration.district,
          flat: this.userInfo.addresses.permanentRegistration.flat,
          regionCode: permanentRegion
            ? permanentRegion.key
            : this.userInfo.addresses.permanentRegistration.regionCode,
          settlement: this.userInfo.addresses.permanentRegistration.settlement,
          settlementType: permanentSettlement
            ? permanentSettlement.key
            : this.userInfo.addresses.permanentRegistration.settlementType,
          street: this.userInfo.addresses.permanentRegistration.street,
          zip: this.userInfo.addresses.permanentRegistration.zip,
        };
      }

      const res: ISetClientAddresses = {
        addressesEqual: this.userInfo.addresses.addressesEqual,
        advData: null,
        id: this.openUserId,
        mainAddress: mainAddress,
        permanentRegistration: permanentRegistration,
      };
      if (this.userInfo.addresses.changedAt !== "") {
        res.changedAt = this.userInfo.addresses.changedAt;
      }
      return res;
    },
  },
});
