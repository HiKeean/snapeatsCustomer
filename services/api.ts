//list url
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const API_DEV = process.env.NEXT_PUBLIC_API_DEV;
export const API_AUTH = `${API_URL}auth/`
export const API_FOTO = `${API_URL}foto/`
export const API_TRANSAKSI_WS = `${API_URL}transaksi`
export const API_TRANSAKSI = `${API_URL}transaction/`

export const API_TRANSAKSIS = {
  API_CHECKOUT: `${API_TRANSAKSI}checkout`
}



export const API_SECURE = {
    API_LOGIN : `${API_AUTH}authenticate`,
    API_REGISTER : `${API_AUTH}register`,
    API_LOGOUT : `${API_AUTH}logout`,
    API_AKTIVASI : `${API_AUTH}activation/`,
    API_FORGOT : `${API_AUTH}forgot`,
    API_CPASS : `${API_AUTH}c-pass`,
    API_UPLOADFOTO : `${API_AUTH}uploadFoto`,
    API_CHECKEMAIL : `${API_AUTH}check-email`,
    API_REFRESHTOKEN: `${API_AUTH}refresh-token`,
}
    
    
export const API_PEMBELI = {
    API_GETALLRESTAURANT :`${API_URL}pembeli/restoran`,
}
    
export const API_FOTOS = {
    POST_UPLOADFOTO: `${API_FOTO}uploadFoto`,
    GET_IMGFOTO: `${API_FOTO}getimgpub`,
}

export const API_RESTO = {
    GET_SEARCH: `${API_PEMBELI.API_GETALLRESTAURANT}/search`,
    GET_RESTOBYID: `${API_PEMBELI.API_GETALLRESTAURANT}/getrestobyid`,
    GET_EXTRAGROUPS: `${API_PEMBELI.API_GETALLRESTAURANT}/getExtraGroup`,
}

export const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return "/placeholder.svg"

  if (imagePath.startsWith("http")) return imagePath

  // Encode hanya bagian keyword-nya
  const sanitized = encodeURIComponent(imagePath)
  return `${API_FOTOS.GET_IMGFOTO}?keyword=${sanitized}`
}


export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatRupiahGratis = (value: number): string => {
    console.log(value)
    if(value === 0){
        return "Free"
    }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

    