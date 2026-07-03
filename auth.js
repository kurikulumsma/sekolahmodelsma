/**
 * auth.js — Dasbor Sekolah Model 2026 (v2)
 * Shared authentication & role utility
 *
 * ROLE SYSTEM v2:
 *   superadmin  — akses penuh + approve semua user (termasuk admin)
 *   admin       — akses penuh + approve bpmp/dinas/sekolah
 *   bpmp        — view wilayahnya + approve dinas/sekolah wilayahnya
 *   dinas       — view sesuai provinsi/kabkot-nya (kolom: provinsi)
 *   sekolah     — view data sekolahnya saja (kolom: npsn)
 *   mitra       — view sekolah naungannya saja (kolom: mitra), view only
 *
 * localStorage key: 'sb_user'
 * {
 *   id, email, nama, role,
 *   unsur,     // untuk display/label (contoh: "BPMP Prov. Jawa Barat")
 *   provinsi,  // diisi untuk role: dinas, bpmp
 *   npsn,      // diisi untuk role: sekolah
 *   nama_sekolah, // diisi untuk role: sekolah
 *   mitra,     // diisi untuk role: mitra (nama mitra, harus cocok kolom `mitra` di tabel sekolah)
 * }
 *
 * Kolom `bpmp` TIDAK ADA lagi — sudah digabung ke `provinsi`.
 */

// ─── Master data wilayah ──────────────────────────────────────────────────────

/**
 * 32 provinsi reguler (tanpa 6 Papua pemekaran).
 * Urutan abjad. Ini adalah source of truth nama provinsi.
 */
const PROVINSI_REGULER = [
  'Aceh',
  'Bali',
  'Banten',
  'Bengkulu',
  'D.I. Yogyakarta',
  'D.K.I. Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Selatan',
  'Kalimantan Tengah',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Kepulauan Bangka Belitung',
  'Kepulauan Riau',
  'Lampung',
  'Maluku',
  'Maluku Utara',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
  'Papua Barat',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara',
];

/**
 * 6 kabkot Papua pemekaran — disimpan di kolom `provinsi` untuk user Dinas.
 * Key  = value yang masuk ke kolom `provinsi` di Supabase
 * Label = teks yang tampil di dropdown form daftar
 */
const PAPUA_KABKOT = [
  { value: 'Kota Jayapura',   label: 'Dinas Pendidikan Kota Jayapura' },
  { value: 'Kab. Fak Fak',    label: 'Dinas Pendidikan Kab. Fak Fak' },
  { value: 'Kota Sorong',     label: 'Dinas Pendidikan Kota Sorong' },
  { value: 'Kab. Jayawijaya', label: 'Dinas Pendidikan Kab. Jayawijaya' },
  { value: 'Kab. Merauke',    label: 'Dinas Pendidikan Kab. Merauke' },
  { value: 'Kab. Nabire',     label: 'Dinas Pendidikan Kab. Nabire' },
];
const PAPUA_KABKOT_SET = new Set(PAPUA_KABKOT.map(k => k.value));

/**
 * Daftar instansi Dinas untuk dropdown form daftar.
 * label = teks dropdown, value = yang masuk kolom `provinsi`.
 */
const DINAS_LIST = [
  ...PROVINSI_REGULER.map(p => ({ label: `Dinas Pendidikan Prov. ${p}`, value: p })),
  ...PAPUA_KABKOT,
];

/**
 * Daftar instansi BPMP untuk dropdown form daftar.
 * label = teks dropdown, value = yang masuk kolom `provinsi`.
 * BBPMP (bukan BPMP) untuk: Jawa Barat, Jawa Tengah, Jawa Timur,
 *   Sulawesi Selatan, Sumatera Barat.
 */
const BPMP_LIST = [
  { label: 'BPMP Prov. Aceh',                    value: 'Aceh' },
  { label: 'BPMP Prov. Bali',                     value: 'Bali' },
  { label: 'BPMP Prov. Banten',                   value: 'Banten' },
  { label: 'BPMP Prov. Bengkulu',                 value: 'Bengkulu' },
  { label: 'BPMP Prov. D.I. Yogyakarta',          value: 'D.I. Yogyakarta' },
  { label: 'BPMP Prov. D.K.I. Jakarta',           value: 'D.K.I. Jakarta' },
  { label: 'BPMP Prov. Gorontalo',                value: 'Gorontalo' },
  { label: 'BPMP Prov. Jambi',                    value: 'Jambi' },
  { label: 'BBPMP Prov. Jawa Barat',              value: 'Jawa Barat' },
  { label: 'BBPMP Prov. Jawa Tengah',             value: 'Jawa Tengah' },
  { label: 'BBPMP Prov. Jawa Timur',              value: 'Jawa Timur' },
  { label: 'BPMP Prov. Kalimantan Barat',         value: 'Kalimantan Barat' },
  { label: 'BPMP Prov. Kalimantan Selatan',       value: 'Kalimantan Selatan' },
  { label: 'BPMP Prov. Kalimantan Tengah',        value: 'Kalimantan Tengah' },
  { label: 'BPMP Prov. Kalimantan Timur',         value: 'Kalimantan Timur' },
  { label: 'BPMP Prov. Kalimantan Utara',         value: 'Kalimantan Utara' },
  { label: 'BPMP Prov. Kepulauan Bangka Belitung',value: 'Kepulauan Bangka Belitung' },
  { label: 'BPMP Prov. Kepulauan Riau',           value: 'Kepulauan Riau' },
  { label: 'BPMP Prov. Lampung',                  value: 'Lampung' },
  { label: 'BPMP Prov. Maluku',                   value: 'Maluku' },
  { label: 'BPMP Prov. Maluku Utara',             value: 'Maluku Utara' },
  { label: 'BPMP Prov. Nusa Tenggara Barat',      value: 'Nusa Tenggara Barat' },
  { label: 'BPMP Prov. Nusa Tenggara Timur',      value: 'Nusa Tenggara Timur' },
  { label: 'BPMP Prov. Papua',                    value: 'Papua' },
  { label: 'BPMP Prov. Papua Barat',              value: 'Papua Barat' },
  { label: 'BPMP Prov. Riau',                     value: 'Riau' },
  { label: 'BPMP Prov. Sulawesi Barat',           value: 'Sulawesi Barat' },
  { label: 'BBPMP Prov. Sulawesi Selatan',        value: 'Sulawesi Selatan' },
  { label: 'BPMP Prov. Sulawesi Tengah',          value: 'Sulawesi Tengah' },
  { label: 'BPMP Prov. Sulawesi Tenggara',        value: 'Sulawesi Tenggara' },
  { label: 'BPMP Prov. Sulawesi Utara',           value: 'Sulawesi Utara' },
  { label: 'BBPMP Prov. Sumatera Barat',          value: 'Sumatera Barat' },
  { label: 'BPMP Prov. Sumatera Selatan',         value: 'Sumatera Selatan' },
  { label: 'BPMP Prov. Sumatera Utara',           value: 'Sumatera Utara' },
];

/**
 * Provinsi-provinsi yang masuk wilayah kerja tiap BPMP.
 * Key = nilai kolom `provinsi` user BPMP (nama provinsi kedudukan BPMP).
 * Value = array provinsi yang masuk cakupan wilayahnya.
 *
 * BPMP berkedudukan di satu provinsi tapi bisa mencakup beberapa provinsi.
 * Untuk BPMP yang cakupannya = provinsi kedudukannya saja, value = [key].
 */
const BPMP_CAKUPAN = {
  'Aceh':                    ['Aceh'],
  'Bali':                    ['Bali'],
  'Banten':                  ['Banten'],
  'Bengkulu':                ['Bengkulu'],
  'D.I. Yogyakarta':         ['D.I. Yogyakarta'],
  'D.K.I. Jakarta':          ['D.K.I. Jakarta'],
  'Gorontalo':               ['Gorontalo'],
  'Jambi':                   ['Jambi'],
  'Jawa Barat':              ['Jawa Barat'],
  'Jawa Tengah':             ['Jawa Tengah'],
  'Jawa Timur':              ['Jawa Timur'],
  'Kalimantan Barat':        ['Kalimantan Barat'],
  'Kalimantan Selatan':      ['Kalimantan Selatan'],
  'Kalimantan Tengah':       ['Kalimantan Tengah'],
  'Kalimantan Timur':        ['Kalimantan Timur'],
  'Kalimantan Utara':        ['Kalimantan Utara'],
  'Kepulauan Bangka Belitung':['Kepulauan Bangka Belitung'],
  'Kepulauan Riau':          ['Kepulauan Riau'],
  'Lampung':                 ['Lampung'],
  'Maluku':                  ['Maluku'],
  'Maluku Utara':            ['Maluku Utara'],
  'Nusa Tenggara Barat':     ['Nusa Tenggara Barat'],
  'Nusa Tenggara Timur':     ['Nusa Tenggara Timur'],
  'Papua':                   ['Papua', 'Papua Pegunungan', 'Papua Selatan', 'Papua Tengah', 'Kota Jayapura', 'Kab. Jayawijaya', 'Kab. Merauke', 'Kab. Nabire'],
  'Papua Barat':             ['Papua Barat', 'Papua Barat Daya', 'Kab. Fak Fak', 'Kota Sorong'],
  'Riau':                    ['Riau'],
  'Sulawesi Barat':          ['Sulawesi Barat'],
  'Sulawesi Selatan':        ['Sulawesi Selatan'],
  'Sulawesi Tengah':         ['Sulawesi Tengah'],
  'Sulawesi Tenggara':       ['Sulawesi Tenggara'],
  'Sulawesi Utara':          ['Sulawesi Utara'],
  'Sumatera Barat':          ['Sumatera Barat'],
  'Sumatera Selatan':        ['Sumatera Selatan'],
  'Sumatera Utara':          ['Sumatera Utara'],
};

/**
 * Daftar mitra pembina (organisasi mitra yang mengusulkan sekolah).
 * value = yang harus sama persis dengan isi kolom `mitra` di tabel
 *   sekolah_model_2026 DAN kolom `mitra` di tabel user_db_sekmodel.
 */
const MITRA_LIST = [
  'Majelis Pendidikan Kristen Indonesia (MPKI)',
  'PGRI',
  "LP Darul Ma'arif NU",
  'JSIT',
  'Muhammadiyah',
  'Majelis Nasional Pendidikan Katolik (MNPK)',
];

/** Label display per role (untuk badge sidebar) */
const ROLE_LABEL = {
  superadmin: 'Super Admin',
  admin:      'Admin',
  bpmp:       'BBPMP/BPMP',
  dinas:      'Dinas Pendidikan',
  sekolah:    'Sekolah',
  mitra:      'Mitra Pembina',
};

// ─── Session ──────────────────────────────────────────────────────────────────

/** Ambil session user dari localStorage. @returns {Object|null} */
function getUser() {
  try {
    const raw = localStorage.getItem('sb_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Simpan session user ke localStorage. */
function setUser(user) {
  localStorage.setItem('sb_user', JSON.stringify(user));
}

/** Hapus session (logout). */
function clearUser() {
  localStorage.removeItem('sb_user');
}

// ─── Role checks ──────────────────────────────────────────────────────────────

/** Return role string, atau '' kalau tidak ada session. */
function getRole() { return getUser()?.role || ''; }

function isSuperadmin() { return getRole() === 'superadmin'; }
function isAdmin()      { return getRole() === 'admin'; }
function isBpmp()       { return getRole() === 'bpmp'; }
function isDinas()      { return getRole() === 'dinas'; }
function isSekolah()    { return getRole() === 'sekolah'; }
function isMitra()      { return getRole() === 'mitra'; }

/**
 * Boleh akses halaman kelola pengguna.
 * - superadmin: approve semua termasuk admin
 * - admin: approve bpmp, dinas, sekolah
 * - bpmp: approve dinas+sekolah di wilayahnya
 */
function canManageUsers() {
  const r = getRole();
  return r === 'superadmin' || r === 'admin' || r === 'bpmp';
}

/** Boleh lihat semua data tanpa filter wilayah */
function canViewAll() {
  const r = getRole();
  return r === 'superadmin' || r === 'admin';
}

/** Boleh edit/tambah/hapus data */
function canEdit() {
  const r = getRole();
  return r === 'superadmin' || r === 'admin';
}

// ─── Filter sekolah ───────────────────────────────────────────────────────────

/**
 * Filter array sekolah sesuai role & wilayah user.
 * @param {Array}  schools — minimal punya: { provinsi, kabupaten_kota, npsn, mitra }
 * @param {Object} [user]  — opsional, default: getUser()
 * @returns {Array}
 */
function filterSchoolsByRole(schools, user) {
  const u = user || getUser();
  if (!u) return [];

  if (canViewAll()) return schools;

  const role = u.role || '';
  const prov = u.provinsi || '';

  if (role === 'bpmp') {
    const cakupan = BPMP_CAKUPAN[prov] || [prov];
    return schools.filter(s => cakupan.includes(s.provinsi));
  }

  if (role === 'dinas') {
    if (PAPUA_KABKOT_SET.has(prov)) {
      return schools.filter(s => s.kabupaten_kota === prov);
    }
    return schools.filter(s => s.provinsi === prov);
  }

  if (role === 'sekolah') {
    const npsn = String(u.npsn || '');
    return schools.filter(s => String(s.npsn) === npsn);
  }

  if (role === 'mitra') {
    const mitra = u.mitra || '';
    return schools.filter(s => s.mitra === mitra);
  }

  return [];
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

/**
 * Tampilkan/sembunyikan nav item berdasarkan role.
 *   .nav-admin-only  — superadmin saja
 *   .nav-edit-only   — superadmin + admin
 */
function applyNavVisibility() {
  if (!getUser()) return;
  document.querySelectorAll('.nav-admin-only').forEach(el => {
    el.style.display = isSuperadmin() ? '' : 'none';
  });
  document.querySelectorAll('.nav-edit-only').forEach(el => {
    el.style.display = canEdit() ? '' : 'none';
  });
}

/**
 * Isi badge user di sidebar.
 * @param {string} namaId — id elemen nama
 * @param {string} roleId — id elemen label role/instansi
 */
function fillUserBadge(namaId = 'badgeNama', roleId = 'badgeRole') {
  const u = getUser();
  if (!u) return;
  const elNama = document.getElementById(namaId);
  const elRole = document.getElementById(roleId);
  if (elNama) elNama.textContent = u.nama || u.email || '—';
  if (elRole) elRole.textContent = u.unsur || ROLE_LABEL[u.role] || u.role || '—';
}

/**
 * Sembunyikan filter provinsi kalau user sudah otomatis terfilter per wilayah.
 * @param {string} filterId — id elemen filter provinsi
 */
function applyProvinceFilterVisibility(filterId = 'baselineProvFilter') {
  const el = document.getElementById(filterId);
  if (!el) return;
  el.style.display = canViewAll() ? '' : 'none';
}

// ─── Guard ────────────────────────────────────────────────────────────────────

/** Redirect ke login kalau belum login. */
function requireLogin(loginUrl = 'login.html') {
  if (!getUser()) window.location.href = loginUrl;
}

/** Redirect kalau role tidak termasuk allowedRoles. */
function requireRole(allowedRoles, redirectUrl = 'beranda.html') {
  if (!allowedRoles.includes(getRole())) window.location.href = redirectUrl;
}
