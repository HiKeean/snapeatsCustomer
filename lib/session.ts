import { getToken } from "@/services/authService";
import { decryptAESClient } from "./enc";
import Cookies from "js-cookie";


export function isSessionValid(){
    const encodedSession = Cookies.get("SNAPEATS_SESSION")
    if (!encodedSession) return false
    

    try {
      const decryptSession = JSON.parse(decryptAESClient(encodedSession))
      if (!decryptSession.access_token || decryptSession.access_exp < Date.now()) {
        console.error("Access token not found in decrypted session");
        return false;
      }
      return true
    } catch (error) {
      console.error("Failed to decode access token:", error)
      return false
    }
}
export async function getAccessToken(): Promise<string | null> {
  const token = await getToken();
  return token.toString();

}
