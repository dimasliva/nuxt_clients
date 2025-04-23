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

export function blobToBinary(blob: Blob): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();

        // Event listener for when the read operation is complete
        reader.onload = function(event: ProgressEvent<FileReader>) {
            if (event.target && event.target.result instanceof ArrayBuffer) {
                resolve(event.target.result);
            } else {
                reject(new Error("Failed to read blob as ArrayBuffer"));
            }
        };

        // Event listener for error handling
        reader.onerror = function(error: ProgressEvent<FileReader>) {
            reject(error);
        };

        // Read the Blob as an ArrayBuffer
        reader.readAsArrayBuffer(blob);
    });
}


