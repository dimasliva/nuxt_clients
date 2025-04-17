import { defineStore } from 'pinia';
import type { IOpenUser, IProfileActualAddress } from '../types/clients';

export const useClientModalStore = defineStore('clientModalStore', {
  state: () => ({
    activeTab: '' as string, 
    actualAddress: {} as IProfileActualAddress,
    permanentAddress: {} as IProfileActualAddress,
    isActualAddress: false as boolean, 
    userInfo: {} as IOpenUser
  }),
  actions: {
    switchTab(tab: string) {
      this.activeTab = tab; 
    },
    resetUserInfo() {
      this.userInfo = {
        advData: null,
        birthdate: '',
        changedAt: '',
        gender: EGenders.m, 
        selectedGender: '',
        id: '',
        linkedRecs: null,
        name: '',
        notActive: false,
        patronymic: '',
        photo: null,
        profile: null,
        rank: null,
        roles: '',
        surname: '',
      };
    },
    setUserInfo(user: IOpenUser) {
      this.userInfo = user
    },
    setAddressCountry(value: string) {
      this.actualAddress.county = value
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
});
