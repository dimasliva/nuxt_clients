import crypto from "crypto";


const algorithmAes256 = "aes-256-cbc";

export function EncryptAes256(keyHex32: string, message: string) {
    const initVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithmAes256, Buffer.from(keyHex32, 'hex'), initVector);
    let encryptedData = cipher.update(message, "utf-8", "base64");
    encryptedData += cipher.final("base64");
    return Buffer.from(JSON.stringify({ a: encryptedData, b: initVector.toString("base64") })).toString("base64");
}

export function DecryptAes256(keyHex32: string, message: string) {
    try {
        let buff = Buffer.from(message, 'base64');
        let eobj = JSON.parse(buff.toString());
        let initVector = Buffer.from(eobj.b, "base64");

        const decipher = crypto.createDecipheriv(algorithmAes256, Buffer.from(keyHex32, 'hex'), initVector);
        let decryptedData = decipher.update(eobj.a, "base64", "utf-8");
        decryptedData += decipher.final("utf-8");
        return decryptedData;
    }
    catch (exc) {
        return null;
    }
}