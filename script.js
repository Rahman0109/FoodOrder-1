
import { supabase } from "./supabase.js";

let keranjang = [];

// ======================================
// 1. MENAMBAHKAN MAKANAN KE KERANJANG
// ======================================

function tambahKeranjang(nama, harga) {
    const itemAda = keranjang.find(item => item.nama === nama);

    if (itemAda) {
        itemAda.jumlah++;
    } else {
        keranjang.push({
            nama: nama,
            harga: harga,
            jumlah: 1
        });
    }

    tampilkanKeranjang();
}


// ======================================
// 2. MENAMPILKAN ISI KERANJANG
// ======================================

function tampilkanKeranjang() {
    const daftar = document.getElementById("daftar-keranjang");
    const totalHarga = document.getElementById("total-harga");
    const jumlahKeranjang = document.getElementById("jumlah-keranjang");

    const totalItem = keranjang.reduce(function(total, item) {
        return total + item.jumlah;
    }, 0);

    jumlahKeranjang.textContent = totalItem;

    daftar.innerHTML = "";

    let total = 0;

    keranjang.forEach(function(item, index) {
        const baris = document.createElement("div");
        baris.className = "cart-item";

        const subtotal = item.harga * item.jumlah;
        total += subtotal;

        baris.innerHTML = `
            <div class="cart-item-info">

                <h4 class="cart-item-name">
                    ${item.nama}
                </h4>

                <p class="cart-item-price">
                    Rp${item.harga.toLocaleString("id-ID")}
                </p>

                <strong class="cart-item-subtotal">
                    Subtotal: Rp${subtotal.toLocaleString("id-ID")}
                </strong>

            </div>

            <div class="cart-actions">

                <div class="quantity-control">

                    <button class="quantity-btn"
                        onclick="ubahJumlah(${index}, -1)">
                        −
                    </button>

                    <span class="quantity-number">
                        ${item.jumlah}
                    </span>

                    <button class="quantity-btn"
                        onclick="ubahJumlah(${index}, 1)">
                        +
                    </button>

                </div>

                <button class="delete-btn"
                    onclick="hapusItem(${index})">
                    Hapus
                </button>

            </div>
        `;

        daftar.appendChild(baris);
    });

    if (keranjang.length === 0) {
        daftar.textContent = "Belum ada pesanan.";
    }

    totalHarga.textContent = total.toLocaleString("id-ID");
}


// ======================================
// 3. MENGUBAH JUMLAH MAKANAN
// ======================================

function ubahJumlah(index, perubahan) {
    keranjang[index].jumlah += perubahan;

    if (keranjang[index].jumlah <= 0) {
        keranjang.splice(index, 1);
    }

    tampilkanKeranjang();
}


// ======================================
// 4. MENGHAPUS MAKANAN
// ======================================

function hapusItem(index) {
    keranjang.splice(index, 1);

    tampilkanKeranjang();
}


// ======================================
// 5. MENGHUBUNGKAN FUNGSI KE HTML
// ======================================

window.tambahKeranjang = tambahKeranjang;
window.ubahJumlah = ubahJumlah;
window.hapusItem = hapusItem;


// ======================================
// 6. PROSES CHECKOUT
// ======================================

document.getElementById("form-checkout").addEventListener("submit", async function(event) {

    event.preventDefault();

    const hasil = document.getElementById("hasil-checkout");

    if (keranjang.length === 0) {
        hasil.textContent = "Keranjang masih kosong.";
        return;
    }

    const nama = document.getElementById("nama-pelanggan").value.trim();
    const telepon = document.getElementById("telepon").value.trim();
    const alamat = document.getElementById("alamat").value.trim();
    const pembayaran = document.getElementById("metode-pembayaran").value;

    if (!nama || !telepon || !alamat || !pembayaran) {
        hasil.textContent = "Mohon lengkapi semua data checkout.";
        return;
    }

    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError || !userData.user) {
        hasil.textContent = "Silakan login kembali.";
        return;
    }

    let total = 0;

    const daftarPesanan = keranjang.map(function(item) {
        const subtotal = item.harga * item.jumlah;

        total += subtotal;

        return {
            nama: item.nama,
            harga: item.harga,
            jumlah: item.jumlah,
            subtotal: subtotal
        };
    });

    hasil.textContent = "Sedang menyimpan pesanan...";

    try {
        const { error } = await supabase
            .from("pesanan")
            .insert({
                user_id: userData.user.id,
                nama_pelanggan: nama,
                telepon: telepon,
                alamat: alamat,
                daftar_pesanan: daftarPesanan,
                total_harga: total,
                status: "menunggu"
            });

        if (error) {
            throw error;
        }

        hasil.replaceChildren();

        const judul = document.createElement("h3");
        judul.textContent = "Pesanan berhasil disimpan!";

        hasil.appendChild(judul);

        const informasi = [
            "Nama: " + nama,
            "Telepon: " + telepon,
            "Alamat: " + alamat,
            "Pembayaran: " + pembayaran,
            "Total: Rp" + total.toLocaleString("id-ID"),
            "Status: Menunggu"
        ];

        informasi.forEach(function(teks) {
            const baris = document.createElement("p");

            baris.textContent = teks;

            hasil.appendChild(baris);
        });

        keranjang = [];

        tampilkanKeranjang();

    } catch (error) {
        console.error("Gagal menyimpan pesanan:", error);

        hasil.textContent =
            "Pesanan gagal disimpan: " + error.message;
    }

});
