import { defineStore } from "pinia";
import {
  EClientTabs,
  EGenderProfile,
  type IClientAddress,
  type IOpenUser,
  type IProfileActualAddress,
  type IUpdateClient,
} from "../types/clients";
import {
  ClientCountryText,
  ClientRegionText,
  ClientRussiaCountryKey,
  ClientSettlementText,
} from "../constants/clients";
import type { IResponseFile } from "~/src/features/Files/model/types/files";
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
    isActualAddress: false as boolean,
    userInfo: {} as IOpenUser,
    openUserId: "-1" as string | null,
    openUserPhotoId: null as string | null,
  }),
  actions: {
    switchTab(tab: EClientTabs) {
      this.activeTab = tab;
    },
    setAvatar(data: Blob) {
      const url: string = URL.createObjectURL(data);
      this.userInfo.avatarPreview = url;
    },
    resetUserInfo() {
      this.openUserPhotoId = null;
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
        mainDocumentNumber: "",
        mainDocumentSeries: "",
        mainDocumentWhen: "",
        mainDocumentWho: "",
        mainDocumentWhoCode: "",
        otherDocuments: [],
        mainEmail: "",
        mainPhone: "",
        reservPhone: "",
        mainDocument: 1,
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
        mainDocumentText: ClientDocumentTypes[0].value,
      };
    },

    setOpenUserId(value: string | null) {
      this.openUserId = value;
    },
    setDefaultActiveTab() {
      this.activeTab = EClientTabs.profile;
    },
    setUserInfoAvatar(data: IResponseFile[]) {
      this.userInfo.avatar;
    },
    setUserInfo(data: IRecordResponse[]) {
      if (data[0]) {
        this.openUserPhotoId = data[0].photo;
      } else {
        this.openUserPhotoId = "";
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
      this.userInfo.surname = data.surname;
      this.userInfo.patronymic = data.patronymic;
      this.userInfo.selectedGender = selectedGender;
      this.userInfo.birthdate = data.birthdate;
    },
    setProfileData(data: IRecData2 | null) {
      if (data) {
        this.userInfo.mainEmail = data.mainEmail;
        this.userInfo.mainPhone = data.mainPhone;
        this.userInfo.reservPhone = data.reservPhone;
      } else {
        this.userInfo.mainEmail = "";
        this.userInfo.mainPhone = "";
        this.userInfo.reservPhone = "";
      }
    },
    setDocument(data: IRecData1 | null) {
      if (data) {
        this.userInfo.mainDocument = data.mainDocument;
        this.userInfo.otherDocuments = data.otherDocuments;
        this.userInfo.mainDocumentNumber = data.mainDocumentNumber || "";
        this.userInfo.mainDocumentSeries = data.mainDocumentSeries || "";
        this.userInfo.mainDocumentWhen = data.mainDocumentWhen || "";
        this.userInfo.mainDocumentWho = data.mainDocumentWho || "";
        this.userInfo.mainDocumentWhoCode = data.mainDocumentWhoCode || "";
        const clientDocument = ClientDocumentTypes.find(
          (val) => val.key === this.userInfo.mainDocument
        );
        this.userInfo.mainDocumentText = clientDocument
          ? clientDocument.value
          : ClientDocumentTypes[0].value;
      } else {
        this.userInfo.mainDocument = 1;
        this.userInfo.otherDocuments = [];
        this.userInfo.mainDocumentNumber = "";
        this.userInfo.mainDocumentSeries = "";
        this.userInfo.mainDocumentWhen = "";
        this.userInfo.mainDocumentWho = "";
        this.userInfo.mainDocumentWhoCode = "";
        this.userInfo.mainDocumentText = ClientDocumentTypes[0].value;
      }
    },
    setRegistration(data: IRecData3 | null) {
      console.log("setRegistration data", data);
      if (data) {
        let permanentRegistration: IClientAddress = data.permanentRegistration;
        let mainRegistration: IClientAddress = data.mainAddress;
        this.userInfo.mainAddress = mainRegistration;
        this.userInfo.permanentRegistration = permanentRegistration;

        this.setMainCountryText(mainRegistration.country);
        this.setPermanentCountryText(permanentRegistration.country);

        this.setMainRegionText(mainRegistration.regionCode);
        this.setPermanentRegionText(permanentRegistration.regionCode);

        this.setMainSettlementText(mainRegistration.settlementType);
        this.setPermanentSettlementText(permanentRegistration.settlementType);
      } else {
        this.userInfo.mainAddress = {
          building: "",
          corp: "",
          country: 1,
          district: "",
          flat: "",
          regionCode: 1,
          settlement: "",
          settlementType: 1,
          countryText: '',
          regionText: '',
          settlementText: '',
          street: "",
          zip: "",
        };


        this.userInfo.permanentRegistration = {
          building: "",
          corp: "",
          country: 1,
          district: "",
          flat: "",
          regionCode: 1,
          settlement: "",
          settlementType: 1,
          countryText: '',
          regionText: '',
          settlementText: '',
          street: "",
          zip: "",
        };
      }
    },
    setMainCountryText(key: number) {
      const mainCountryText = ClientCountryText.find((val) => val.key === key);
      this.userInfo.mainAddress.countryText = mainCountryText
        ? mainCountryText.value
        : "";
    },
    setPermanentCountryText(key: number) {
      const permanentCountryText = ClientCountryText.find(
        (val) => val.key === key
      );
      this.userInfo.permanentRegistration.countryText = permanentCountryText
        ? permanentCountryText.value
        : "";
    },
    setMainRegionText(key: number) {
      const mainRegionText = ClientRegionText.find((val) => val.key === key);
      this.userInfo.mainAddress.regionText = mainRegionText
        ? mainRegionText.value
        : "";
    },
    setPermanentRegionText(key: number) {
      const permanentRegionText = ClientRegionText.find(
        (val) => val.key === key
      );
      this.userInfo.permanentRegistration.regionText = permanentRegionText
        ? permanentRegionText.value
        : "";
    },
    setMainSettlementText(key: number) {
      const mainSettlementText = ClientSettlementText.find(
        (val) => val.key === key
      );
      this.userInfo.mainAddress.settlementText = mainSettlementText
        ? mainSettlementText.value
        : "";
    },
    setPermanentSettlementText(key: number) {
      const permanentSettlementText = ClientSettlementText.find(
        (val) => val.key === key
      );
      this.userInfo.permanentRegistration.settlementText =
        permanentSettlementText ? permanentSettlementText.value : "";
    },
    setAddressCountry(value: string) {
      this.actualAddress.county = value;
    },
    setAddressRegion(value: string) {
      this.actualAddress.region = value;
    },
    setAddressLocationType(value: string) {
      this.actualAddress.localityType = value;
    },
    setActualAddress(value: boolean) {
      this.isActualAddress = value;
    },
  },
  getters: {
    getUser(): IUpdateClient {
      return {
          id: this.userInfo.id,
          changedAt: new Date().toDateString(),
          name: this.userInfo.name,
          surname: this.userInfo.surname,
          patronymic: this.userInfo.patronymic,
          gender: this.userInfo.gender,
          birthdate: this.userInfo.birthdate,
          notActive: null,
          advData: null,
      }
    },
  },


});
