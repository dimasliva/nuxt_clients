export function getFIO(user: IUser): string {
    const lastname = user.surname;
    const name = user.name ? user.name.charAt(0).toUpperCase() : "";
    const middlename = user.patronymic
        ? user.patronymic.charAt(0).toUpperCase()
        : "";

    return `${lastname}${name ? "." + name : ""}${middlename ? "." + middlename : ""}`;
}

export const toPage = async (path: string) => {
    navigateTo({ path: path })
}