"use client"

import type React from "react"
import { aktivasi } from "@/services/authService"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import Swal from "sweetalert2"

export default function ActivationPages(){
    const params = useParams()
    const router = useRouter()
    const activationId = params.id as string

    useEffect(() => {
        const handleLogin = async() => {
            try {
                const response = await aktivasi(activationId);
                Swal.fire({
                    title: "Aktivasi Berhasil!",
                    text: "Silahkan Login kembali!",
                    icon: "success",
                  });
                router.push('/login');
            } catch (error:any) {
                Swal.fire({
                    title: "Aktivasi Gagal!",
                    text: error.message || "Terjadi kesalahan saat aktivasi",
                    icon: "error",
                    draggable: false
                  });
                router.push('/login');

            }
        };
        handleLogin();
        
    }, [activationId]);

    return (
        <div>
            <p>Aktivasi Akun....</p>
        </div>
    )
}