export enum TransaksiType{
    CREDITCARD = "CREDITCARD",
    COD = "COD",
    EWALLET = "EWALLET",
    QRIS = "QRIS"
}

export enum StatusTransaksi{
    BELUMBAYAR,
    DIPROSES,
    MENCARI,
    DIKIRIM,
    DITERIMA,
    DICANCEL
}