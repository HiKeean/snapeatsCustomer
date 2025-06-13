"use server"

import { decryptAESClient, encryptAESClient } from "@/lib/enc";
import { cookies } from "next/headers";
import { API_URL, API_AUTH, API_SECURE } from "./api"

//register
export async function registerPembeli(name:string, email:string, password:string, tglLahir:string, noHp:string){
  const response = await fetch(API_SECURE.API_REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      name,
      tglLahir,
      noHp,
      role:"PEMBELI"
    }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || "Register failed")
  }

  return true;
}

export async function uploadFoto(base64:string, folderName:string){
  const response = await fetch(API_SECURE.API_UPLOADFOTO, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      base64,
      folderName,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || "Upload failed")
  }
  return data.message.filepath;
}

export async function registerPenjual(
        email:string,
        password:string,
        alamat:string,
        latitude:string,
        longitude:string,
        nameToko:string,
        ktp:string,
        noRek:string,
        npwp:string,
        bukuTabungan:string,
        fotoKtp:string,
        fotoNpwp:string,
        noHp : string
){
  const response = await fetch(API_SECURE.API_REGISTER,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role:"PENJUAL",
          alamat,
          latitude,
          longitude,
          nameToko,
          ktp,
          noRek,
          npwp,
          bukuTabungan,
          fotoKtp,
          fotoNpwp,
          noHp
        }),
    }
    
  )
  const data = await response.json()
  // console.log(data.message.filepath);
  if (!response.ok) {
    throw new Error(data.message || "Upload failed")
  }
  return true;
}

//login
export async function login(email: string, password: string, role: string) {
  try {
    const response = await fetch(API_SECURE.API_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    })

    const data = await response.json()

    // console.log(data);

    if (!response.ok) {
      if(data.message == "fetch failed"){
        throw new Error("Internal Server Error")
      }
      throw new Error(data.message || "Login failed")
    }


    if (data.access_token && data.refresh_token) {
      const decodedAccessToken = JSON.parse(atob(data.access_token.split(".")[1])); // Decode payload JWT
      const decodedRefreshToken = JSON.parse(atob(data.refresh_token.split(".")[1])); // Decode payload JWT
      const tokenData = {
        access_token: Buffer.from(data.access_token).toString("base64"),
        refresh_token: Buffer.from(data.refresh_token).toString("base64"),
        access_exp: decodedAccessToken.exp * 1000, // Convert ke milisecond
        refresh_exp: decodedRefreshToken.exp * 1000,
        role: role
      };
    
      const encryptedTokens = encryptAESClient(JSON.stringify(tokenData));

      (await cookies()).set("SNAPEATS_SESSION", encryptedTokens, {
        httpOnly: true, // 🔐 client tidak bisa baca
        secure: true,   // 🌐 hanya HTTPS
        path: "/",
        sameSite:"strict",
        maxAge: 60 * 60 * 24,
      });

      return encryptedTokens;

      // localStorage.setItem("SNAPEATS_SESSION", encryptedTokens);
    }
    else{
      // console.log(data.message.Error)
      if(data.message == "fetch failed"){
        throw new Error("Internal Server Error")
      }
      throw new Error(data.message || "Internal Error Server")
    }
  } catch (error:any) {
    console.log(error.message);
    throw new Error(error?.message === "fetch failed" ? "Internal Server Error" : error.message)
  }

}

//logout
export async function logout() {
  const encodedSession = await getToken();
  // console.log(`encodedSession ${encodedSession}`)
  if (!encodedSession) return null  
  try {
    const response = await fetch(API_SECURE.API_LOGOUT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encodedSession}`, // Pastikan encodedSession valid
      },
    });

    const result = await response; // Ambil data responsenya
    if(result.ok){
      (await cookies()).delete("SNAPEATS_SESSION");
    }
    return result.ok; // Langsung return true/false
  } catch (error) {
    console.error("Logout Error:", error);
    return false; // Return false jika ada error
  }
  
}

//aktivasi
export async function aktivasi(aktivasiId:string){
  const response = await fetch(`${API_SECURE.API_AKTIVASI}${aktivasiId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  if(!response.ok){
    throw new Error(data.message || "Register failed")
  }

  return true;
}

//forgot password
export async function forgotPassword(email:string, role:string){
  const response = await fetch(`${API_SECURE.API_FORGOT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      role
    })
  });
  const data = await response.json();
  if(!response.ok){
    throw new Error(data.message || "Internal Server Error");
  }

  return true;
}

export async function validateLinkForgot(linkId:string){
  const response = await fetch(`${API_SECURE.API_FORGOT}/${linkId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await response.json();
  if(!response.ok){
    throw new Error(data.message || "Link Invalid")
  }
  if(!data.message || !data.message.token){
    throw new Error(data.message || "Link Invalid")
  }
  (await cookies()).set("SNAPEATS_SESSIONS", data.message.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  return true;
}

//change password
export async function changePassword(password:string, oldPassword:string, link:string){
  const token = (await cookies()).get("SNAPEATS_SESSIONS")?.value;
  const response = await fetch(`${API_SECURE.API_CPASS}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      password,
      oldPassword,
      link
    }),
  })
  const data = await response.json();
  if(!response.ok){
    throw new Error(data.message || "Change Password Failed")
  }
  (await cookies()).delete("SNAPEATS_SESSIONS");
  return true
}

export async function checkEmail(email:string, role:string){
  // console.log(API_SECURE.API_CHECKEMAIL)
  const response = await fetch(`${API_URL}auth/check-mail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      role,
      secretKey: "SN4P3@TS"
    }),
  })

  const data = await response.text
  // if (!response.ok) {
  //   throw new Error( "Internal Server Error")
  // }

  return response.json();

}

export async function refresh_token(){
  const token = await getToken();
  try{
    const response = await fetch(API_SECURE.API_REFRESHTOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })
    const data = await response.json()
    if (!response.ok) {
      if(data.message == "fetch failed"){
        throw new Error("Internal Server Error")
      }
      throw new Error(data.message || "Login failed")
    }


    if (data.access_token && data.refresh_token) {
      const decodedAccessToken = JSON.parse(atob(data.access_token.split(".")[1])); // Decode payload JWT
      const decodedRefreshToken = JSON.parse(atob(data.refresh_token.split(".")[1])); // Decode payload JWT
      const tokenData = {
        access_token: Buffer.from(data.access_token).toString("base64"),
        refresh_token: Buffer.from(data.refresh_token).toString("base64"),
        access_exp: decodedAccessToken.exp * 1000, // Convert ke milisecond
        refresh_exp: decodedRefreshToken.exp * 1000,
        role: await getRole()
      };
    
      const encryptedTokens = encryptAESClient(JSON.stringify(tokenData));

      (await cookies()).delete("SNAPEATS_SESSION");

      (await cookies()).set("SNAPEATS_SESSION", encryptedTokens, {
        httpOnly: true, // 🔐 client tidak bisa baca
        secure: true,   // 🌐 hanya HTTPS
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return true;

      // localStorage.setItem("SNAPEATS_SESSION", encryptedTokens);
    }
    else{
      // console.log(data.message.Error)
      if(data.message == "fetch failed"){
        throw new Error("Internal Server Error")
      }
      throw new Error(data.message || "Internal Error Server")
    }
  } catch (error:any) {
    console.log(error.message);
    throw new Error(error?.message === "fetch failed" ? "Internal Server Error" : error.message)
  }
}

export async function validateToken(){
  const token = await getToken();
  console.log(`ini token jing : ${token}`)
  const response = await fetch(`${API_URL}auth/validateToken`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
  const res = await response.json()
  if (!response.ok) {
    if(res.message == "fetch failed"){
      throw new Error("Internal Server Error")
    }
    throw new Error(res.message || "Login failed")
  }
  if(res.data != null){
    const data = res.data
    if (data.access_token && data.refresh_token) {
      const decodedAccessToken = JSON.parse(atob(data.access_token.split(".")[1])); // Decode payload JWT
      const decodedRefreshToken = JSON.parse(atob(data.refresh_token.split(".")[1])); // Decode payload JWT
      const tokenData = {
        access_token: Buffer.from(data.access_token).toString("base64"),
        refresh_token: Buffer.from(data.refresh_token).toString("base64"),
        access_exp: decodedAccessToken.exp * 1000, // Convert ke milisecond
        refresh_exp: decodedRefreshToken.exp * 1000,
        role: await getRole()
      };
    
      const encryptedTokens = encryptAESClient(JSON.stringify(tokenData));

      (await cookies()).delete("SNAPEATS_SESSION");

      (await cookies()).set("SNAPEATS_SESSION", encryptedTokens, {
        httpOnly: true, // 🔐 client tidak bisa baca
        secure: true,   // 🌐 hanya HTTPS
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      // localStorage.setItem("SNAPEATS_SESSION", encryptedTokens);
    }
  }
  return true;
}

export async function getToken(){
    const cached = (await cookies()).get("SNAPEATS_SESSION")?.value;
    if (!cached) throw new Error("Session token not found");
  
    const decrypted = await decryptAESClient(cached); 
    const parsed = JSON.parse(decrypted); 
    const token = Buffer.from(parsed.access_token, "base64").toString("utf-8");
    return token;
}
async function getRole(){
    const cached = (await cookies()).get("SNAPEATS_SESSION")?.value;
    if (!cached) throw new Error("Session token not found");
  
    const decrypted = await decryptAESClient(cached); 
    const parsed = JSON.parse(decrypted); 
    const role = parsed.role;
    return role;
}


