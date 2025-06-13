"use server"
import { API_FOTOS, API_URL } from "./api";
import { getToken } from "./authService";

export const uploadFotoServices = async (fileOrBase64: File | string, prefix: string): Promise<string> => {
  if (typeof fileOrBase64 === "string") {
    return "path/to/uploaded/file-from-base64.webp"
  } else {
    const token = await getToken();
    const formData = new FormData()
    formData.append("file", fileOrBase64)
    formData.append("data", prefix)

    try {
      const response = await fetch(API_FOTOS.POST_UPLOADFOTO, {
        method: "POST",
        headers:{
            "Authorization": `Bearer ${token}`
        },
        body: formData // ⛔️ Jangan set header Content-Type!
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      return data.message // atau `data.filePath`, sesuaikan dengan response
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  }
}