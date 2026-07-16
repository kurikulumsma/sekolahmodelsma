/* ============================================================
 * rtl-print.js — Modul cetak PDF Lembar Kerja RTL
 * Sekolah Model 2026 — Direktorat SMA
 *
 * Berisi seluruh gaya (@media print) dan pembangun dokumen cetak.
 * Dimuat oleh rtl.html: <script src="rtl-print.js"></script>
 *
 * Dipakai oleh rtl.html lewat 1 fungsi publik: buildPrintRoot()
 * (dipanggil tombol "Cetak PDF" tepat sebelum window.print()).
 *
 * Bergantung pada global milik rtl.html (tersedia saat runtime):
 *   INDICATORS, state, normalizeEntry, effectivePrio, tahapCfg, escapeHtml,
 *   getRefDesc, SEKOLAH_MAP, selectedNpsn
 * ============================================================ */

/* ── CSS cetak: diinjeksi ke <head> saat file ini dimuat ── */
(function injectPrintStyles(){
  const css = `
@media print {
  @page { size: landscape; margin: 12mm; }

  /* Paksa warna latar (section header biru/abu, header kolom) ikut tercetak —
     browser secara default MEMBUANG semua background-color saat print
     kecuali dipaksa lewat properti ini. Tanpa ini semuanya jadi polos/putih. */
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

  /* Sembunyikan SELURUH tampilan on-screen, cuma #printRoot yg boleh muncul di kertas.
     #printRoot punya inline style display:none (agar tak pernah tampil di layar) —
     dikalahkan di sini dgn !important khusus utk print. */
  #rtl > *:not(#printRoot) { display: none !important; }
  #printRoot { display: block !important; font-family: Arial, Helvetica, sans-serif; color: #111; }

  #printRoot .p-header { text-align: center; border-bottom: 2px solid #0a1f3c; padding-bottom: 8px; margin-bottom: 12px; }
  #printRoot .p-title { font-size: 14pt; font-weight: 700; color: #0a1f3c; }
  #printRoot .p-subtitle { font-size: 9.5pt; color: #555; margin-top: 3px; }

  #printRoot .p-ident { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 24px; margin-bottom: 12px; font-size: 9.5pt; }
  #printRoot .p-ident-label { color: #666; }

  #printRoot .p-area-title {
    font-size: 12.5pt; font-weight: 800;
    padding: 4px 2px 6px; margin-top: 20px; border-bottom: 2.5px solid;
    page-break-after: avoid; break-after: avoid;
  }
  #printRoot .p-area-title:first-of-type { margin-top: 2px; }
  /* Warna per Area: PM = biru navy, KKA = oranye. Dipakai jg utk turunannya
     (section/keunggulan/dimensi) KHUSUS di seksi Indikator Prioritas — supaya
     sekali lihat langsung kebedain PM vs KKA. Indikator Lainnya SELALU abu-abu
     apa pun areanya (lihat .tone-lain di bawah), krn bukan itu yg mau ditonjolkan. */
  #printRoot .p-area-title.tone-pm  { color: #0a1f3c; border-bottom-color: #0a1f3c; }
  #printRoot .p-area-title.tone-kka { color: #7a3d0a; border-bottom-color: #7a3d0a; }

  #printRoot .p-section-title {
    font-size: 11pt; font-weight: 700; color: #fff;
    padding: 6px 10px; margin-top: 16px;
    page-break-after: avoid; break-after: avoid;
  }
  #printRoot .p-section-title.tone-pm  { background: #1a56a0; }
  #printRoot .p-section-title.tone-kka { background: #b35c0a; }
  #printRoot .p-section-title.tone-lain{ background: #5f6b7a; }

  /* table-layout:auto — lebar kolom menyesuaikan isi & selalu utuh 6 kolom,
     tak berisiko collapse walau ada teks sangat panjang di 1 kolom tertentu.
     border-collapse:SEPARATE (+spacing:0) — perlu ini krn "collapse" pernah
     bikin border ilang total pas tabel kepotong ke halaman berikutnya. TAPI
     "separate" bikin tiap sel gambar border sendiri2 — kalau tiap sel dikasih
     border 4 sisi, garis yg berbatasan sama sel tetangga jadi dobel (~2px).
     Solusinya: tiap sel CUMA gambar kanan+bawah; atas cuma di baris pertama
     (thead), kiri cuma di kolom pertama (:first-child) — tiap garis di dunia
     ini cuma digambar SATU kali oleh SATU sel, hasilnya 1px rata tanpa dobel,
     outline luar tabel tetap nutup rapi di 4 sisi. */
  #printRoot table.p-table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: auto; margin-bottom: 2px; }
  #printRoot table.p-table thead { display: table-header-group; } /* judul kolom muncul ulang tiap halaman */
  #printRoot table.p-table th, #printRoot table.p-table td {
    /* display !important WAJIB: menetralkan CSS responsive on-screen rtl.html
       (@media max-width 768px: th/td:nth-child(4,5) {display:none}) yang bocor
       ke tabel cetak dan membuat kolom "Fokus & Rencana Aksi" + "Waktu/PJ"
       HILANG dari PDF. Jangan dihapus. */
    display: table-cell !important;
    text-transform: none;
    border-right: 1px solid #333; border-bottom: 1px solid #333;
    padding: 6px 8px; text-align: left; vertical-align: top;
    font-size: 9pt; line-height: 1.35;
    overflow-wrap: anywhere; word-break: break-word;
  }
  /* Kolom pertama tiap baris (No, atau sel merged colspan=7 di judul Dimensi)
     nutup sisi kiri tabel. */
  #printRoot table.p-table tr > *:first-child { border-left: 1px solid #333; }
  #printRoot table.p-table tbody tr { display: table-row !important; }
  /* Header kolom (No/Indikator/…) ikut tone Area — sebelumnya abu-biru flat
     (#e8edf5) buat PM maupun KKA, jadi kelihatan "putus" dari gradasi warna
     section/keunggulan/dimensi di sekitarnya. thead jg selalu baris PALING
     ATAS tiap tabel-nya sendiri (tiap Keunggulan = 1 <table> baru), jadi aman
     dikasih border-top unconditional tanpa perlu cek posisi. */
  #printRoot table.p-table thead th { font-weight: 700; border-top: 1px solid #333; }
  #printRoot table.p-table thead tr.tone-pm th   { background: #e3ecf7; color: #0a1f3c; }
  #printRoot table.p-table thead tr.tone-kka th  { background: #fbeed9; color: #6b3d05; }
  #printRoot table.p-table thead tr.tone-lain th { background: #eef0f3; color: #33415a; }
  /* Baris data BOLEH terpotong antar halaman. Sebelumnya page-break-inside:avoid,
     tapi karena tinggi 1 baris bisa hampir separuh halaman (deskripsi panjang),
     avoid malah bikin baris utuh dilempar ke halaman berikutnya & meninggalkan
     ruang kosong 30-50%. Membiarkannya terpotong jauh lebih hemat halaman. */
  #printRoot table.p-table tbody tr { page-break-inside: auto; break-inside: auto; }

  /* Judul Keunggulan: DI ATAS tabel (bukan baris dalam tbody), supaya header
     kolom (No/Indikator/…) yg berada di thead-lah yg ter-"pin"/berulang tiap
     halaman — judul keunggulan tampil sekali di atas blok tabelnya. Warna
     mengikuti tone (turunan lebih terang dari section-title di atasnya). */
  #printRoot .p-keu-title {
    color: #fff; font-weight: 700; font-size: 10pt;
    padding: 6px 10px; margin-top: 12px;
    page-break-after: avoid; break-after: avoid;
  }
  #printRoot .p-keu-title.tone-pm  { background: #5b85c0; }
  #printRoot .p-keu-title.tone-kka { background: #d98a3c; }
  #printRoot .p-keu-title.tone-lain{ background: #9aa4b2; }

  /* Sub-header Dimensi (Budaya Belajar / Capaian Belajar / dst) sebagai baris
     merged di dalam tabel; jangan yatim di dasar halaman. Turunan paling
     terang dari tone-nya, teks gelap krn latarnya udah muda. Case teks
     TIDAK dipaksa uppercase (hanya romawi di p-keu-title yg kapital).
     Border CUMA kanan+bawah (bukan shorthand 4-sisi) — samain pola sama
     aturan umum td di atas, biar gak dobel sama baris di atas/bawahnya. */
  #printRoot table.p-table tr.p-dim-row td {
    font-weight: 700; font-size: 8.5pt;
    border-right: 1px solid #333; border-bottom: 1px solid #333;
    padding: 4px 8px;
    page-break-after: avoid; break-after: avoid;
  }
  #printRoot table.p-table tr.p-dim-row.tone-pm td   { background: #d3e2f4; color: #0a1f3c; }
  #printRoot table.p-table tr.p-dim-row.tone-kka td  { background: #f6dcb0; color: #6b3d05; }
  #printRoot table.p-table tr.p-dim-row.tone-lain td { background: #e4e7ec; color: #33415a; }

  #printRoot .p-no { width: 4%; text-align: center; white-space: nowrap; }
  #printRoot .p-ind { width: 18%; }
  #printRoot .p-base { width: 13%; }
  #printRoot .p-target { width: 13%; }
  #printRoot .p-fa { width: 24%; }
  #printRoot .p-wp { width: 12%; }
  #printRoot .p-bk { width: 16%; }
  #printRoot .p-ind-nama { font-weight: 700; }
  #printRoot .p-ind-faktor { font-size: 7.5pt; color: #777; margin-top: 2px; }
  #printRoot .p-tahap { font-weight: 700; }
  #printRoot .p-kond-desc { font-size: 7.8pt; color: #555; margin-top: 3px; line-height: 1.3; }
  #printRoot .p-fa ul { margin: 3px 0 0 12px; padding: 0; }
  #printRoot .p-fa li { margin-bottom: 1px; }

  /* Blok tanda tangan: tak boleh terpotong antar halaman — bila tak cukup ruang,
     pindah utuh ke halaman baru */
  #printRoot .p-sign-wrap {
    display: flex; justify-content: flex-end; margin-top: 24px;
    page-break-inside: avoid; break-inside: avoid;
  }
  #printRoot .p-sign-box { width: 220px; font-size: 9.5pt; text-align: center; }
  #printRoot .p-sign-role { margin-top: 2px; }
  #printRoot .p-sign-space { height: 46px; }
  #printRoot .p-sign-name { border-top: 1px solid #333; padding-top: 2px; font-weight: 700; }
}`;
  const style = document.createElement("style");
  style.id = "rtlPrintStyles";
  style.textContent = css;
  document.head.appendChild(style);
})();

/* ── Format tanggal Indonesia: "2026-10-15" -> "15 Oktober 2026" ── */
const BULAN_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
function formatTanggalID(iso){
  if(!iso) return "......................................";
  const parts = String(iso).split("-").map(Number);
  const y = parts[0], m = parts[1], d = parts[2];
  if(!y || !m || !d || !BULAN_ID[m-1]) return iso;
  return `${d} ${BULAN_ID[m-1]} ${y}`;
}

/* ── Kelompokkan indikator: per Area (PM/KKA) → Prioritas vs Lainnya.
      Pakai effectivePrio() (bukan flag e.prioritas mentah) supaya "prioritas
      hantu" — toggle nyala tapi kuadran-nya bukan Quick Win/Prioritas Utama,
      sisa data lama sebelum aturan kuadran diberlakukan — tidak ikut masuk
      seksi Prioritas di PDF, konsisten dgn badge ★ yg tampil di layar. ── */
const AREA_LABELS = {
  PM:  "A. Indikator Pembelajaran Mendalam",
  KKA: "B. Indikator Koding dan Kecerdasan Artifisial",
};
// Nama area TANPA angka romawi (romawinya per-Keunggulan, lihat KEUNGGULAN_ROMAN)
const AREA_FULLNAME = { PM: "Pembelajaran Mendalam", KKA: "Koding dan Kecerdasan Artifisial" };

// "tone" nentuin warna 1 blok Prioritas/Lainnya (dan seluruh turunannya di
// bawahnya: judul keunggulan, sub-header dimensi). PM+Prioritas → navy,
// KKA+Prioritas → oranye, APAPUN area+Lainnya → abu-abu (area tak dibedakan
// utk Lainnya, krn yg mau ditonjolkan cuma yg prioritas).
function toneClass(areaKey, isPrio){
  if(!isPrio) return "tone-lain";
  return areaKey === "KKA" ? "tone-kka" : "tone-pm";
}

function buildPrintGroups(){
  const groups = {};
  INDICATORS.forEach(ind=>{
    const e = normalizeEntry(state[ind.id]);
    if(!groups[ind.area]) groups[ind.area] = {prio:[], lain:[]};
    (effectivePrio(e) ? groups[ind.area].prio : groups[ind.area].lain).push({ind, e});
  });
  return groups;
}

/* ── Bangun 1 blok Area utuh: judul Area + (opsional) tabel Prioritas +
      (opsional) tabel Lainnya. Tiap tabel dikelompokkan lagi per Keunggulan
      (baris merged), dgn nomor urut reset per Keunggulan. ── */
function buildAreaSectionHtml(areaKey, bucket){
  if(!bucket || (!bucket.prio.length && !bucket.lain.length)) return "";
  const areaTone = areaKey === "KKA" ? "tone-kka" : "tone-pm";
  let html = `<div class="p-area-title ${areaTone}">${escapeHtml(AREA_LABELS[areaKey] || areaKey)}</div>`;
  if(bucket.prio.length){
    const tone = toneClass(areaKey, true);
    html += `<div class="p-section-title ${tone}">Indikator Prioritas</div>` + sectionTableHtml(bucket.prio, areaKey, tone);
  }
  if(bucket.lain.length){
    const tone = toneClass(areaKey, false);
    html += `<div class="p-section-title ${tone}">Indikator Lainnya</div>` + sectionTableHtml(bucket.lain, areaKey, tone);
  }
  return html;
}

/* ── 1 baris tabel utk 1 indikator. `no` = nomor urut tampilan (reset per
      tabel), BUKAN ind.id (kode indikator asli, mis. 1..37 yg bisa lompat
      antar tabel setelah dikelompokkan per Area/status). ── */
function printRowHtml(no, ind, e){
  const fokus = [...e.fokus, ...e.fokusCustom].filter(Boolean);
  const aksi  = [...e.aksi,  ...e.aksiCustom ].filter(Boolean);
  const bukti = [...e.bukti, ...e.buktiCustom].filter(Boolean);
  const bC = tahapCfg(e.baseline), tC = tahapCfg(e.target);
  // Deskripsi kondisi per tahap diambil dari referensi baku (tabel
  // rtl_deskripsi_kondisi) via getRefDesc — sumber yg sama dgn yg dipakai
  // form di layar. Faktor (kondisi awal versi sekolah) tetap di kolom Indikator.
  const baseDesc = (typeof getRefDesc === "function") ? getRefDesc(ind.id, e.baseline) : "";
  const targetDesc = (typeof getRefDesc === "function") ? getRefDesc(ind.id, e.target) : "";
  return `<tr>
    <td class="p-no">${no}</td>
    <td class="p-ind">
      <div class="p-ind-nama">${escapeHtml(ind.indikator)}</div>
      ${e.faktor ? `<div class="p-ind-faktor">Kondisi awal: ${escapeHtml(e.faktor)}</div>` : ""}
    </td>
    <td class="p-base">
      <span class="p-tahap" style="color:${bC.dot}">${escapeHtml(e.baseline||"-")}</span>
      ${baseDesc ? `<div class="p-kond-desc">${escapeHtml(baseDesc)}</div>` : ""}
    </td>
    <td class="p-target">
      <span class="p-tahap" style="color:${tC.dot}">${escapeHtml(e.target||"-")}</span>
      ${targetDesc ? `<div class="p-kond-desc">${escapeHtml(targetDesc)}</div>` : ""}
    </td>
    <td class="p-fa">
      ${fokus.length ? `<b>${escapeHtml(fokus.join(", "))}</b>` : ""}
      ${aksi.length ? `<ul>${aksi.map(a=>`<li>${escapeHtml(a)}</li>`).join("")}</ul>` : ""}
    </td>
    <td class="p-wp">${escapeHtml(e.waktu||"-")}<br>${escapeHtml(e.pj||"-")}</td>
    <td class="p-bk">${bukti.length ? escapeHtml(bukti.join(", ")) : "-"}</td>
  </tr>`;
}

/* ── Urutan keunggulan (sama dgn tampilan on-screen) ── */
const KEUNGGULAN_ORDER = [
  "Keunggulan Belajar Murid",
  "Keunggulan Mengajar Pendidik",
  "Keunggulan Kepemimpinan Kepala Sekolah",
];
// Romawi TETAP per identitas Keunggulan (bukan counter berjalan) — supaya
// "Keunggulan Belajar Murid" selalu "I" baik dia muncul di tabel Prioritas
// maupun Lainnya, dan reset ke I lagi di Area berikutnya (KKA).
const KEUNGGULAN_ROMAN = {
  "Keunggulan Belajar Murid": "I",
  "Keunggulan Mengajar Pendidik": "II",
  "Keunggulan Kepemimpinan Kepala Sekolah": "III",
};

/* ── Kerangka thead 7 kolom (dipakai tiap tabel keunggulan). `tone` nentuin
      warna latar header kolom biar nyambung sama gradasi Area di atasnya. ── */
function printTheadHtml(tone){
  return `<thead><tr class="${tone}">
      <th class="p-no">No</th>
      <th class="p-ind">Indikator</th>
      <th class="p-base">Baseline</th>
      <th class="p-target">Target</th>
      <th class="p-fa">Fokus &amp; Rencana Aksi</th>
      <th class="p-wp">Waktu / PJ</th>
      <th class="p-bk">Bentuk Bukti</th>
    </tr></thead>`;
}

/* ── 1 tabel utk 1 Keunggulan.
      Struktur: judul Keunggulan (DI ATAS tabel) → tabel dgn thead kolom
      (yg ter-pin berulang tiap halaman) → baris dikelompokkan per Dimensi
      (Budaya Belajar / Capaian Belajar / dst) sebagai sub-header merged.
      Nomor urut berjalan menerus dalam 1 Keunggulan (lintas Dimensi),
      reset ke 1 di Keunggulan berikutnya — sesuai tampilan di layar.
      Label pakai romawi tetap per Keunggulan (KEUNGGULAN_ROMAN) + nama Area
      polos (AREA_FULLNAME) — sebelumnya salah pakai areaLabel() global yg
      romawinya kebawa dari Area (selalu "I." utk semua keunggulan di PM,
      "II." utk semua keunggulan di KKA), bukan naik per Keunggulan. ── */
function keunggulanTableHtml(areaKey, keu, items, tone){
  // kelompokkan per dimensi, urutan sesuai kemunculan (mengikuti urutan id)
  const dimOrder = [];
  const byDim = {};
  items.forEach(x=>{
    const d = x.ind.dimensi || "";
    if(!byDim[d]){ byDim[d] = []; dimOrder.push(d); }
    byDim[d].push(x);
  });

  let body = "";
  let counter = 1;
  dimOrder.forEach(dim=>{
    if(dim){
      body += `<tr class="p-dim-row ${tone}"><td colspan="7">${escapeHtml(dim)}</td></tr>`;
    }
    byDim[dim].forEach(x=>{
      body += printRowHtml(counter++, x.ind, x.e);
    });
  });

  const roman = KEUNGGULAN_ROMAN[keu] || "";
  const label = `${roman}. ${AREA_FULLNAME[areaKey] || areaKey} — ${keu}`;
  return `<div class="p-keu-title ${tone}">${escapeHtml(label)}</div>` +
    `<table class="p-table">${printTheadHtml(tone)}<tbody>${body}</tbody></table>`;
}

/* ── 1 seksi (Prioritas / Lainnya) utk 1 Area: 1 tabel per Keunggulan ── */
function sectionTableHtml(items, areaKey, tone){
  const byKeu = {};
  items.forEach(x=>{
    const k = x.ind.keunggulan;
    (byKeu[k] = byKeu[k] || []).push(x);
  });

  let html = "";
  KEUNGGULAN_ORDER.forEach(keu=>{
    const rows = byKeu[keu];
    if(!rows || !rows.length) return;
    html += keunggulanTableHtml(areaKey, keu, rows, tone);
  });
  return html;
}

/* ── Bangun seluruh dokumen cetak ke #printRoot.
      Dipanggil tombol "Cetak PDF" tepat sebelum window.print(). ── */
function buildPrintRoot(){
  const root = document.getElementById("printRoot");
  if(!root) return;
  const row = SEKOLAH_MAP[selectedNpsn] || {};
  const namaSekolah = (document.getElementById("i_sekolah")||{}).value || row.nama || "-";
  const namaKS = (document.getElementById("i_ks")||{}).value || "";
  const tglIso = (document.getElementById("i_tgl")||{}).value || "";
  const groups = buildPrintGroups();
  const sections = ["PM", "KKA"].map(a => buildAreaSectionHtml(a, groups[a])).join("");

  root.innerHTML = `
    <div class="p-header">
      <div class="p-title">Rencana Tindak Lanjut (RTL) Sekolah Model SMA</div>
      <div class="p-subtitle">Implementasi Pembelajaran Mendalam dan Koding &amp; Kecerdasan Artifisial</div>
    </div>
    <div class="p-ident">
      <div><span class="p-ident-label">Nama Sekolah:</span> <b>${escapeHtml(namaSekolah)}</b></div>
      <div><span class="p-ident-label">NPSN:</span> <b>${escapeHtml(selectedNpsn||"-")}</b></div>
      <div><span class="p-ident-label">Provinsi:</span> <b>${escapeHtml(row.provinsi||"-")}</b></div>
      <div><span class="p-ident-label">Kabupaten / Kota:</span> <b>${escapeHtml(row.kabupaten_kota||"-")}</b></div>
    </div>
    ${sections}
    <div class="p-sign-wrap">
      <div class="p-sign-box">
        <div>${escapeHtml(row.kabupaten_kota||"......................")}, ${formatTanggalID(tglIso)}</div>
        <div class="p-sign-role">Kepala Sekolah,</div>
        <div class="p-sign-space"></div>
        <div class="p-sign-name">${escapeHtml(namaKS || "......................................")}</div>
      </div>
    </div>
  `;
}
