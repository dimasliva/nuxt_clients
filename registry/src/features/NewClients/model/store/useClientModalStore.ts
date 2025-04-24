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
    userInfo: {} as IOpenUser,
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
      let url: string = "";
      if (data) {
        url = URL.createObjectURL(data);
      }
      this.userInfo.avatarPreview = url;
    },
    setEditOtherDocument(data: IRectsOtherDocument) {
      this.editOtherDocument = { ...data };
    },
    updateOtherDocumentByEdit(edit: IRectsOtherDocument) {
      const index = this.userInfo.documents.otherDocuments.findIndex(
        (val) => val.typeCode === edit.typeCode
      );
      const date = new Date(edit.when);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;
      if (index !== -1) {
        edit.when = formattedDate;
        console.log("edit.when", edit.when);
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
      const blob = new Blob([file], { type: file.type });
      this.setAvatar(blob);
      const formData = new FormData();
      formData.append("filetype", "1");
      if (this.openUserPhoto.id) {
        formData.append("FilelinkId", this.openUserPhoto.id);
      }
      formData.append("File", file);

      this.updatedAvatar = formData;
    },
    resetUserInfo() {
      this.openUserPhoto = { id: null, changedAt: "" };
      this.openUserId = "-1";
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
            countryText: "",
            regionText: "",
            settlementText: "",
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
    setUserInfo(data: IRecordResponse[]) {
      if (data[0]) {
        this.openUserPhoto.id = data[0].photo;
        this.openUserPhoto.changedAt = data[0].changedAt;
      } else {
        this.openUserPhoto.id = null;
        this.openUserPhoto.changedAt = "";
      }
      this.setDocument(data[1] as IRecData1);

      this.setProfileData(data[2] as IRecData2);

      this.setRegistration(data[3] as IRecData3);
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
    setProfileData(data: IRecData2 | undefined) {
      if (data) {
        this.userInfo.contacts = {
          mainEmail: data.mainEmail,
          mainPhone: data.mainPhone,
          reservPhone: data.reservPhone || "",
          changedAt: data.changedAt,
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
        console.log("data", data);
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
        };
        this.userInfo.addresses.mainAddress = emptyAddress;
        this.userInfo.addresses.permanentRegistration = emptyAddress;
        this.userInfo.addresses.changedAt = "";
        this.userInfo.addresses.id = "";
        this.userInfo.addresses.addressesEqual = false;
      }
    },
    onClientChangedAt(value: string) {
      this.userInfo.changedAt = value 
    },
    onClientId(value: string) {
      this.userInfo.id = value 
      this.openUserId = value 
    },
    setChangedAt(changedAt: string) {
      this.userInfo.changedAt = changedAt;
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
      const res:IUpdateClientContacts = {
        id: this.userInfo.id,
        mainEmail: this.userInfo.contacts.mainEmail,
        mainPhone: this.userInfo.contacts.mainPhone.replace("+", ""),
        reservPhone: this.userInfo.contacts.reservPhone.length
          ? this.userInfo.contacts.reservPhone.replace("+", "")
          : null,
        otherContacts: null,
        advData: null,
      }
      if(this.userInfo.contacts.changedAt.length) {
        res.changedAt = this.userInfo.contacts.changedAt 
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
      }
      if(this.openUserPhoto.changedAt !== '') {
        response.changedAt = this.openUserPhoto.changedAt
      }
      return response
    },
    getParamsSetClientDocuments(): IRequestSetClientDocumentsParams {
      const doc = ClientDocumentsText.find(
        (val) => val.value === this.userInfo.documents.mainDocumentText
      );
      const date = new Date(this.userInfo.documents.mainDocumentWhen);
      date.setDate(date.getDate() + 1);
      const formattedDate = date.toISOString().split("T")[0];
      return {
        id: this.userInfo.id,
        changedAt: this.userInfo.documents.changedAt,
        snils: this.userInfo.documents.snils,
        mainDocument: doc ? doc.key : 1,
        mainDocumentSeries: this.userInfo.documents.mainDocumentSeries,
        mainDocumentNumber: this.userInfo.documents.mainDocumentNumber,
        mainDocumentWhen: formattedDate,
        mainDocumentWho: this.userInfo.documents.mainDocumentWho,
        mainDocumentWhoCode: this.userInfo.documents.mainDocumentWhoCode,
        otherDocuments: this.userInfo.documents.otherDocuments,
        advData: null,
      };
    },
    getParamsAddClient(): IAddClientParams {
      const birthdate = this.userInfo.birthdate.length ? this.userInfo.birthdate : null 
      return {
        advData: null,
        birthdate: birthdate,
        gender: this.userInfo.gender,
        name: this.userInfo.name,
        notActive: null,
        patronymic: this.userInfo.patronymic,
        surname: this.userInfo.surname,
      }
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

      return {
        addressesEqual: this.userInfo.addresses.addressesEqual,
        advData: null,
        changedAt: this.userInfo.addresses.changedAt,
        id: this.userInfo.addresses.id,
        mainAddress: mainAddress,
        permanentRegistration: permanentRegistration,
      };
    },
  },
});
