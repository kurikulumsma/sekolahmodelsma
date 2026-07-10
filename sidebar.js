/**
 * sidebar.js — Dasbor Sekolah Model 2026 (v2)
 * Render sidebar + mobile topbar secara dinamis.
 *
 * Dependensi (load sebelum sidebar.js):
 *   <script src="config.js"></script>
 *   <script src="auth.js"></script>
 *   <script src="sidebar.js"></script>
 *
 * Cara pakai di tiap halaman:
 *   renderSidebar('intervensi-dinas');   // nilai = activeKey dari NAV_ITEMS
 *   renderBadge();                        // isi badge user topbar kanan
 *
 * Lalu di <body> cukup taruh placeholder:
 *   <div id="sidebar-root"></div>
 */

// ─── Daftar nav items ─────────────────────────────────────────────────────────
// key       = nilai yang dipass ke renderSidebar()
// href      = target link
// label     = teks menu
// divider   = teks divider yang tampil SEBELUM item ini (opsional)
// adminOnly = true → hanya tampil kalau canManageUsers()

const NAV_ITEMS = [
  {
    divider: 'Program',
    key:   'beranda',
    href:  'beranda.html',
    label: 'Beranda',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  },
  {
    key:   'surat-dukungan',
    href:  'surat-dukungan.html',
    label: 'Surat Dukungan',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  },
  {
    key:   'baseline',
    href:  'baseline.html',
    label: 'Baseline Sekolah',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  },
  {
    divider: 'Intervensi',
    key:   'intervensi-direktorat',
    href:  'intervensi-direktorat.html',
    label: 'Direktorat SMA',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  },
  {
    key:   'intervensi-upt',
    href:  'intervensi-upt.html',
    label: 'BBPMP/BPMP',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
  },
  {
    key:   'intervensi-dinas',
    href:  'intervensi-dinas.html',
    label: 'Dinas Pendidikan',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V12M18 22V12M2 22h20M2 12l10-9 10 9M9 22v-5h6v5"/></svg>`,
  },
  {
    divider: 'Sekolah',
    key:   'bahan-ajar',
    href:  'kurasi.html',
    label: 'Kurasi',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  },
  {
    key:   'rtl',
    href:  'rtl.html',
    label: 'Rencana Tindak Lanjut',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    divider:   'Sistem',
    adminOnly: true,
    key:   'kelola-pengguna',
    href:  'kelola-pengguna.html',
    label: 'Kelola Pengguna',
    icon:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
];

// ─── Render utama ─────────────────────────────────────────────────────────────

/**
 * Render sidebar + mobile topbar ke dalam #sidebar-root.
 * @param {string} activeKey  — key halaman aktif (contoh: 'baseline')
 * @param {string} pageTitle  — judul yang tampil di mobile topbar
 *                              default: label dari NAV_ITEMS
 */
function renderSidebar(activeKey, pageTitle) {
  const root = document.getElementById('sidebar-root');
  if (!root) { console.warn('sidebar.js: #sidebar-root tidak ditemukan'); return; }

  const canManage = canManageUsers(); // dari auth.js

  // Tentukan pageTitle dari NAV_ITEMS kalau tidak diisi manual
  if (!pageTitle) {
    const found = NAV_ITEMS.find(n => n.key === activeKey);
    pageTitle = found ? found.label : APP_NAME;
  }

  // Build nav items HTML
  let navHTML = '';
  NAV_ITEMS.forEach(item => {
    // Sembunyikan item + divider-nya kalau adminOnly dan tidak boleh
    if (item.adminOnly && !canManage) return;

    if (item.divider) {
      const adminClass = (item.adminOnly && !canManage) ? ' nav-admin-only' : '';
      navHTML += `<div class="nav-divider${adminClass}">${item.divider}</div>`;
    }

    const activeClass = item.key === activeKey ? ' active' : '';
    const adminClass  = (item.adminOnly && !canManage) ? ' nav-admin-only' : '';
    navHTML += `<a href="${item.href}" class="${(activeClass + adminClass).trim()}">${item.icon}${item.label}</a>`;
  });

  root.innerHTML = `
    <div class="sidebar-overlay" id="overlay" onclick="closeSidebar()"></div>

    <div class="mobile-topbar">
      <button class="hamburger" onclick="openSidebar()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="mobile-topbar-title">${pageTitle}</span>
      <a class="mobile-user-name" id="mobileUserName" href="profil.html" style="display:none"></a>
      <button class="mobile-auth-btn" id="mobileBtnMasuk" onclick="window.location.href=window.innerWidth<=768?'login-mobile.html':'login.html'">Masuk</button>
      <button class="mobile-auth-btn" id="mobileBtnKeluar" onclick="doLogout()" style="display:none;background:transparent;border:1px solid rgba(255,255,255,0.35);color:rgba(255,255,255,0.85)">Keluar</button>
    </div>

    <aside id="sidebar">
      <div class="sidebar-logo">
        <img src="https://raw.githubusercontent.com/kurikulumsma/image/main/logo.png" alt="Logo Kemendikdasmen">
        <button class="sidebar-close" onclick="closeSidebar()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <nav>${navHTML}</nav>
      <div class="sidebar-footer" id="sidebarFooter">—</div>
    </aside>
  `;
}

// ─── Sidebar open/close ───────────────────────────────────────────────────────

function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('show');
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('show');
}

// ─── Badge user (topbar kanan) ────────────────────────────────────────────────

/**
 * Isi badge user di topbar kanan halaman.
 * Elemen yang dibutuhkan di HTML halaman:
 *   #badgeGuest, #badgeUser, #badgeEmail, #badgeRole,
 *   #badgeAvatar, #menuName, #menuEmail,
 *   #mobileUserName, #mobileBtnMasuk, #mobileBtnKeluar
 */
function renderBadge() {
  const u        = getUser();   // dari auth.js
  const loggedIn = !!u;

  // Guest / login state
  const elGuest = document.getElementById('badgeGuest');
  const elUser  = document.getElementById('badgeUser');
  if (elGuest) elGuest.style.display = loggedIn ? 'none' : '';
  if (elUser)  elUser.style.display  = loggedIn ? 'flex' : 'none';

  if (loggedIn) {
    const nama = u.nama || u.email || '';
    const parts = nama.trim().split(' ');
    const initial = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (nama[0] || '?').toUpperCase();

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('badgeEmail', nama);
    set('badgeRole',  u.unsur || ROLE_LABEL[u.role] || u.role || '—');
    set('badgeAvatar', initial);
    set('menuName',  nama);
    set('menuEmail', u.email || '');
  }

  // Mobile
  const elMobMasuk  = document.getElementById('mobileBtnMasuk');
  const elMobKeluar = document.getElementById('mobileBtnKeluar');
  const elMobName   = document.getElementById('mobileUserName');
  if (elMobMasuk)  elMobMasuk.style.display  = loggedIn ? 'none' : '';
  if (elMobKeluar) elMobKeluar.style.display = loggedIn ? ''     : 'none';
  if (elMobName) {
    elMobName.style.display = loggedIn ? '' : 'none';
    if (loggedIn) elMobName.textContent = (u.nama || u.email || '').split('@')[0];
  }
}

// ─── Badge dropdown toggle ────────────────────────────────────────────────────

function toggleBadgeMenu() {
  document.getElementById('badgeUser')?.classList.toggle('open');
}

// Tutup dropdown kalau klik di luar
document.addEventListener('click', e => {
  const wrap = document.getElementById('badgeUser');
  if (wrap && !wrap.contains(e.target)) wrap.classList.remove('open');
});

// ─── Logout ───────────────────────────────────────────────────────────────────

function doLogout() {
  clearUser(); // dari auth.js
  window.location.href = 'login.html';
}

// ─── Update sidebar footer (tanggal pembaruan data) ───────────────────────────

/**
 * Set teks footer sidebar.
 * @param {string} teks — contoh: '30 Mei 2026 · 20:05'
 */
function setSidebarFooter(teks) {
  const el = document.getElementById('sidebarFooter');
  if (el) el.innerHTML = `Data diperbarui<br>${teks}`;
}
