
import { supabase } from "./supabase.js";

// Mengambil elemen daftar riwayat
const daftarRiwayat = document.getElementById("daftar-riwayat");

// Menjalankan fungsi saat halaman dibuka
async function tampilkanRiwayat() {
    try {
        // Memeriksa pengguna yang sedang login
        const { data: { user }, error: userError } =
            await supabase.auth.getUser();

        if (userError) throw userError;

        // Jika belum login, arahkan ke halaman login
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        // Mengambil pesanan milik pengguna tersebut
        const { data: pesanan, error } = await supabase
            .from("pesanan")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Jika belum memiliki pesanan
        daftarRiwayat.innerHTML = "";

        if (!pesanan || pesanan.length === 0) {
            daftarRiwayat.textContent = "Belum ada riwayat pesanan.";
            return;
        }

        // Menampilkan setiap pesanan
        pesanan.forEach((item) => {
            const card = document.createElement("div");
            card.className = "card-riwayat";

            const judul = document.createElement("h3");
            judul.textContent = "Pesanan #" + item.id;

            const nama = document.createElement("p");
            nama.textContent = "Nama: " + item.nama_pelanggan;

            const tanggal = document.createElement("p");
            tanggal.textContent = "Tanggal: " +
                new Date(item.created_at).toLocaleString("id-ID");

            const makanan = document.createElement("div");
            makanan.textContent = "Daftar makanan:";

            item.daftar_pesanan.forEach((produk) => {
                const detail = document.createElement("p");

                detail.textContent =
                    `${produk.nama} x ${produk.jumlah} - Rp${produk.subtotal.toLocaleString("id-ID")}`;

                makanan.appendChild(detail);
            });

            
const total = document.createElement("p");
total.className = "total-pesanan";
total.textContent = "Total: Rp" +
    Number(item.total_harga).toLocaleString("id-ID");

const status = document.createElement("span");
status.className = "status-pesanan";
status.textContent = "Status: " + item.status;

            card.append(
                judul,
                nama,
                tanggal,
                makanan,
                total,
                status
            );

            daftarRiwayat.appendChild(card);
        });

    } catch (error) {
        console.error("Gagal mengambil riwayat:", error);
        daftarRiwayat.textContent =
            "Gagal memuat riwayat pesanan.";
    }
}

// Memanggil fungsi
tampilkanRiwayat();
