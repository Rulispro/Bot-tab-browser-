 // Gunakan IndexedDB via idb-keyval
const { set, get, del, clear, keys } = idbKeyval;
const PREFIX = "fb-akun-";

// Fungsi untuk konversi string biasa menjadi array cookie JSON
function convertStringToCookies(cookieStr) {
  return cookieStr.split(";").map(pair => {
    const [name, ...rest] = pair.trim().split("=");
    return {
      name,
      value: rest.join("="),
      domain: ".facebook.com",
      path: "/"
    };
  });
}

// Simpan cookies dari inputan nama + textarea cookies
async function simpanCookies() {
  const accountName = document.getElementById('accountName').value.trim();
  const raw = document.getElementById('cookieInput').value.trim();

  if (!accountName || !raw) {
    alert("Isi semua kolom terlebih dahulu.");
    return;
  }

  let parsed;
  try {
    // Coba parse sebagai JSON
    parsed = JSON.parse(raw);
  } catch (e) {
    // Kalau gagal, coba parsing manual dari format string biasa
    try {
      parsed = convertStringToCookies(raw);
    } catch (e2) {
      return alert("Format cookies tidak dikenali.");
    }
  }

  // Simpan ke IndexedDB via idb-keyval
  await set(PREFIX + accountName, JSON.stringify(parsed));
  alert("Cookies berhasil disimpan!");
  tampilkanDropdown();
}

// Tampilkan semua akun di dropdown
async function tampilkanDropdown() {
  const dropdown = document.getElementById("akunDropdown");
  dropdown.innerHTML = "";
  const semuaKey = await keys();

  if (semuaKey.length === 0) {
    dropdown.innerHTML = `<option disabled selected>Tidak ada akun tersimpan</option>`;
    return;
  }

  semuaKey.forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.innerText = key.replace(PREFIX, "");
    dropdown.appendChild(option);
  });
}

// Pakai cookies terpilih → Inject cookies ke document.cookie
async function pakaiCookies() {
  const key = document.getElementById("akunDropdown").value;
  const data = await get(key);
  if (!data) return alert("Cookies tidak ditemukan!");

  try {
    const cookies = JSON.parse(data);
    cookies.forEach(cookie => {
      document.cookie = `${cookie.name}=${cookie.value}; domain=${cookie.domain}; path=${cookie.path || "/"};`;
    });

    alert("Cookies berhasil di-inject!\nSilakan reload tab Facebook.");
  } catch (e) {
    alert("Format cookies tidak valid!");
  }
}

// Hapus semua akun
async function hapusSemua() {
  if (confirm("Yakin ingin menghapus semua akun?")) {
    await clear();
    tampilkanDropdown();
    alert("Semua akun berhasil dihapus.");
  }
}

// Jalankan saat halaman dimuat
tampilkanDropdown();
