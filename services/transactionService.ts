"use server"
import { API_TRANSAKSI, API_TRANSAKSI_WS, API_TRANSAKSIS } from "./api";
import { getToken, refresh_token } from "./authService";
import { checkoutDto, delFeeCountDto, responseCheckoutDto } from "./dto/restaurant";

export async function verifyPayment(idPayment:string){
    const response = await fetch(`${API_TRANSAKSI_WS}?paymentId=${idPayment}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    })
    const data = await response.json();
    if(!response.ok){
      throw new Error(data.message || "Change Password Failed")
    }
    return true
}

export async function getDelFeeCount(idResto: string, lat: number, lon: number) {
  const token = await getToken();
  const response = await fetch(`${API_TRANSAKSI}delfeecount`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      idResto,
      lat,
      lon
    })
  });

  console.log(`response: ${response.ok}`);

  // Cek kalau responsenya tidak OK
  if (!response.ok) {
    console.log("response not ok");

    if (response.status === 403) {
      const temp = await refresh_token();
      if (temp) {
        return await getDelFeeCount(idResto, lat, lon);
      }
    }

    return undefined;
  }

  // Baru parse JSON kalau response OK
  const data = await response.json();
//   console.log(data);
  return data.data as delFeeCountDto;
}

export async function checkout(entity:checkoutDto) {
  const token = await getToken();
  const response = await fetch(API_TRANSAKSIS.API_CHECKOUT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(entity)
  });

  console.log(`response: ${response.ok}`);

  // Cek kalau responsenya tidak OK
  // if (!response.ok) {
  //   console.log("response not ok");

  //   if (response.status === 403) {
  //     const temp = await refresh_token();
  //     if (temp) {
  //       return await checkout(entity);
  //     }
  //   }

  //   return undefined;
  // }

  // Baru parse JSON kalau response OK
  const data = await response.json();
//   console.log(data);
  return data.data as responseCheckoutDto;
}

export async function getorderdet(idTrans:string){
  const token = await getToken();
  const response = await fetch(`${API_TRANSAKSI}pembeli/getorderdet?idTrans=${idTrans}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  console.log(`response: ${response.ok}`);

  // Cek kalau responsenya tidak OK
  if (!response.ok) {
    console.log("response not ok");

    if (response.status === 403) {
      const temp = await refresh_token();
      if (temp) {
        return await getorderdet(idTrans);
      }
    }

    return undefined;
  }

  // Baru parse JSON kalau response OK
  const data = await response.json();
//   console.log(data);
  return data.data;
}

export async function getdriverdet(idTrans:string){
  const token = await getToken();
  const response = await fetch(`${API_TRANSAKSI}pembeli/getdriverdet?idTrans=${idTrans}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  console.log(`response: ${response.ok}`);

  // Cek kalau responsenya tidak OK
  if (!response.ok) {
    console.log("response not ok");

    if (response.status === 403) {
      const temp = await refresh_token();
      if (temp) {
        return await getorderdet(idTrans);
      }
    }

    return undefined;
  }

  // Baru parse JSON kalau response OK
  const data = await response.json();
//   console.log(data);
  return data.data;
}
