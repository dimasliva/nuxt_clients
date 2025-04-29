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


export function arraysEqualObjects(arr1: object[], arr2: object[]): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }
    const sortedArr1 = arr1.map(obj => JSON.stringify(obj)).sort();
    const sortedArr2 = arr2.map(obj => JSON.stringify(obj)).sort();
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}

export function getNoun(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return five;
    }
    n %= 10;
    if (n === 1) {
      return one;
    }
    if (n >= 2 && n <= 4) {
      return two;
    }
    return five;
  }