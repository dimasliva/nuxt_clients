export const useGender = () => {
    const {t} = useI18n()
    function getGender(gender: string) {
        switch (gender) {
            case EGenders.m:
                return t('male')
            case EGenders.f:
                return t('female')
            default:
                return t('notspecified')
        }

    }

    return {
        getGender
    }
}
