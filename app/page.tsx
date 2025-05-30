"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function WelcomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolocation.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          if (!response.ok) throw new Error("Gagal mendapatkan alamat.");

          const data = await response.json();

          const location: Location = {
            name:
              data.address.suburb ||
              data.address.town ||
              data.address.city ||
              "Current Location",
            address: [
              data.address.road,
              data.address.suburb,
              data.address.city,
              data.address.state,
            ]
              .filter(Boolean)
              .join(", "),
            latitude,
            longitude,
          };

          localStorage.setItem("userLocation", JSON.stringify(location));
          setTimeout(() => {
            router.push("/pembeli");
          }, 1500); // Biar splash-nya sebentar muncul
        } catch (err) {
          console.error(err);
          setError("Gagal mendapatkan lokasi. Periksa koneksi dan coba lagi.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        if (err.code === 1) {
          setError("Izin lokasi ditolak.");
        } else if (err.code === 2) {
          setError("Lokasi tidak tersedia.");
        } else if (err.code === 3) {
          setError("Permintaan lokasi timeout.");
        } else {
          setError("Gagal mengambil lokasi.");
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-main text-black text-center p-4">
      {loading && <h1 className="text-3xl font-bold">Mendeteksi Lokasi Anda...</h1>}
      {!loading && error && (
        <div>
          <h2 className="text-xl font-semibold mb-4">⚠️ {error}</h2>
          <button
            onClick={getUserLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}
