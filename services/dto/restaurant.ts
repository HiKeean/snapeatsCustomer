import { StatusTransaksi, TransaksiType } from "./enuman";

export interface Response {
    content:ListAllRestaurant[],
    page:JSON
}
export interface ListAllRestaurant{
    id:string;
    name:string;
    foto:string;
    rating:number;
    estDel:number;
    category:string;
    recomended:boolean;
  }

  export interface dataGetMenu{
      id: string;
      name:  string;
      description: string;
      price: number;
      image: string;
      category: string
      available: boolean;
      popular: boolean;
      orders: number;
      rating: number;
      createdAt: string | null; 
      updatedAt: string | null; 
      extraGroups: number[] | null;
  }

  export interface responseGet<T>{
    success: boolean,
    message: string,
    data: T
  }

  export interface ResponseSearchResotran{
    restoran:restoranResponseSearch[],
    food: foodResponseSearch[]
  }

  export interface restoranResponseSearch{
    id:string,
    name_toko:string,
    fotoToko:string,
    rating_toko:number,
    estDel:number,
    jarak:number,
    categoryPenjual:string
  }

  export interface foodResponseSearch{
    id:string,
    name:string,
    penjualName:string,
    pict: string,
    price: number,
    rating: number,
    resto: restoranResponseSearch,
  }

  export interface restoranPage{
    id: string,
    name: string,
    image: string,
    rating: number,
    reviewCount: number,
    estDel: string,
    category: string,
    priceRange: string,
    address: string,
    isOpen: string,
    distance: string,
    food: foodCategoryRestoranPage[],
  }

  export interface foodCategoryRestoranPage{
    id: string;
    name: string;
    items: foodRestoranPage[];
  }

  export interface foodRestoranPage{
    id          : string, 
    name        : string, 
    description : string, 
    price       : number, 
    image       : string, 
    popular     : boolean
  }

export interface ExtraGroupDetail {
  id: number
  name: string
  price: string
}

export interface ExtraGroup {
  id: number
  name: string
  requiredSelection: number
  allowMultipleSelection: number
  details: ExtraGroupDetail[]
}

export interface delFeeCountDto{
  fee:number
  estimasiPengiriman:number
}

export interface checkoutDto{
  restaurantId: string
  transaksiType:TransaksiType
  statusTransaksi:StatusTransaksi
  alamatPengiriman:string
  ongkir:number
  latitude:number
  longitude:number
  items:itemsCheckout[]
}
export interface itemsCheckout{
  id:string
  quantity:number
  notes:string;
  extraGroups:Record<string, number>[]

}

export interface responseCheckoutDto{
  idTransaction:string
}