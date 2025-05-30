// lib/crypto.ts
import crypto from "crypto";
import CryptoJS from "crypto-js";

// Kunci harus 32 byte untuk AES-256
const SECRET_KEY = "QkVMQUpBUiBCVUFUIFNLUklQU0kgQlJP"; // 32 karakter BELAJAR BUAT SKRIPSI BRO
const IV_LENGTH = 16; // IV harus 16 byte

/**
 * 🔒 Enkripsi menggunakan Node.js crypto (Server-side)
 * @param text - Data yang akan dienkripsi
 * @returns Object { encryptedData, iv }
 */
export function encryptAES(text: string): { encryptedData: string; iv: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(SECRET_KEY), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return { encryptedData: encrypted, iv: iv.toString("hex") };
}

/**
 * 🔓 Dekripsi menggunakan Node.js crypto (Server-side)
 * @param encryptedData - Data yang telah dienkripsi
 * @param iv - IV yang digunakan saat enkripsi
 * @returns String data asli
 */
export function decryptAES(encryptedData: string, iv: string): string {
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(SECRET_KEY), Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

/**
 * 🔒 Enkripsi menggunakan crypto-js (Client-side / React)
 * @param text - Data yang akan dienkripsi
 * @returns String terenkripsi
 */
export function encryptAESClient(text: string): string {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

/**
 * 🔓 Dekripsi menggunakan crypto-js (Client-side / React)
 * @param ciphertext - Data yang telah dienkripsi
 * @returns String data asli
 */
export function decryptAESClient(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

