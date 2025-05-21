// Gunakan IndexedDB via idb-keyval
const { set, get, del, clear, keys } = idbKeyval;
const PREFIX = "fb-akun-";

// Simpan cookies saat ini dengan nama
async function simpanCookies() {
  const cookies = document.cookie;
  const nama = prompt("Nama akun ini:");
  if (!nama) return alert("Nama wajib diisi!");

  await set(PREFIX + nama, cookies);
  alert("Cookies disimpan.");
  tampilkanDropdown();
}

// Tampilkan daftar akun di dropdown
async function tampilkanDropdown() {
  const dropdown = document.getElementById("akunDropdown");
  dropdown.innerHTML = "";
  const semuaKey = await keys();

  if (semuaKey.length === 0) {
    dropdown.innerHTML = `<option>Tidak ada akun tersimpan</option>`;
    return;
  }

  semuaKey.forEach(async (key) => {
    const option = document.createElement("option");
    option.value = key;
    option.innerText = key.replace(PREFIX, "");
    dropdown.appendChild(option);
  });
}

// Pakai cookies dari akun terpilih (manual inject)
async function pakaiCookies() {
  const key = document.getElementById("akunDropdown").value;
  const data = await get(key);
  if (!data) return alert("Cookies tidak ditemukan!");

  // Inject cookies manual ke document.cookie
  // Perlu inject ulang per tab karena tidak persist cross-domain
  const pairs = data.split("; ");
  pairs.forEach(pair => {
    const [name, value] = pair.split("=");
    document.cookie = `${name}=${value}; path=/; domain=.facebook.com`;
  });

  alert("Cookies di-inject ke halaman ini.\nSilakan reload tab Facebook.");
}

// Hapus semua akun
async function hapusSemua() {
  if (confirm("Yakin ingin hapus semua akun?")) {
    await clear();
    tampilkanDropdown();
  }
}

// Init tampilkan saat load
tampilkanDropdown();
