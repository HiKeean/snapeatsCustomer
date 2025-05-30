"use server"
import { API_RESTO, API_URL } from "./api";
import { dataGetMenu, ExtraGroup, responseGet, ResponseSearchResotran, restoranPage } from "./dto/restaurant";

export async function searchService(keyword:string, lat:string, lon:string ): Promise<ResponseSearchResotran | undefined>{
    const url = `${API_RESTO.GET_SEARCH}?keyword=${keyword}&lon=${lon}&lat=${lat}`
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        return undefined;
      }
  
      // result adalah object hasil JSON response, dengan bentuk responseGet<T>
        const result: responseGet<ResponseSearchResotran> = await response.json();

        // Ambil data dari result
        const data: ResponseSearchResotran = result.data;

        return data;
    } catch (error: any) {
      // Menangani error dengan pengecekan yang lebih baik
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error(`Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
}

export async function getRestoById(idPenjual:string, lat:string, lon:string): Promise<restoranPage | undefined>{
    const json = {
      idPenjual:idPenjual,
      lat:lat.toString(),
      long:lon.toString()
    }
    const base64 = btoa(JSON.stringify(json));
    const url = `${API_RESTO.GET_RESTOBYID}?base64=${base64}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        return undefined;
      }
  
      // result adalah object hasil JSON response, dengan bentuk responseGet<T>
        const result: responseGet<restoranPage> = await response.json();
        // Ambil data dari result
        const data: restoranPage = result.data;
        return data;
    } catch (error: any) {
      // Menangani error dengan pengecekan yang lebih baik
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error(`Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
}

export async function getExtraGroup(idFood:string){
  const url = `${API_RESTO.GET_EXTRAGROUPS}?idFood=${idFood}`
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        return undefined;
      }
      const result: responseGet<ExtraGroup[]> = await response.json();
      const data: ExtraGroup[] = result.data;
        return data;
    }catch (error: any) {
      // Menangani error dengan pengecekan yang lebih baik
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error(`Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
}


