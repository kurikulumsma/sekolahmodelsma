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
 *   INDICATORS, state, normalizeEntry, tahapCfg, escapeHtml,
 *   SEKOLAH_MAP, selectedNpsn
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

  #printRoot .p-section-title {
    font-size: 11pt; font-weight: 700; color: #fff; background: #1a56a0;
    padding: 6px 10px; margin-top: 16px;
    page-break-after: avoid; break-after: avoid;
  }
  #printRoot .p-section-title.p-lain { background: #5f6b7a; }

  /* table-layout:auto — lebar kolom menyesuaikan isi & selalu utuh 6 kolom,
     tak berisiko collapse walau ada teks sangat panjang di 1 kolom tertentu */
  #printRoot table.p-table { width: 100%; border-collapse: collapse; table-layout: auto; margin-bottom: 2px; }
  #printRoot table.p-table thead { display: table-header-group; } /* judul kolom muncul ulang tiap halaman */
  #printRoot table.p-table th, #printRoot table.p-table td {
    /* display !important WAJIB: menetralkan CSS responsive on-screen rtl.html
       (@media max-width 768px: th/td:nth-child(4,5) {display:none}) yang bocor
       ke tabel cetak dan membuat kolom "Fokus & Rencana Aksi" + "Waktu/PJ"
       HILANG dari PDF. Jangan dihapus. */
    display: table-cell !important;
    text-transform: none;
    border: 1px solid #333; padding: 6px 8px; text-align: left; vertical-align: top;
    font-size: 9pt; line-height: 1.35;
    overflow-wrap: anywhere; word-break: break-word;
  }
  #printRoot table.p-table tbody tr { display: table-row !important; }
  #printRoot table.p-table thead th { background: #e8edf5; color: #0a1f3c; font-weight: 700; }
  #printRoot table.p-table tr { page-break-inside: avoid; break-inside: avoid; }
  #printRoot .p-no { width: 3%; text-align: center; }
  #printRoot .p-ind { width: 20%; }
  #printRoot .p-bt { width: 13%; }
  #printRoot .p-fa { width: 29%; }
  #printRoot .p-wp { width: 13%; }
  #printRoot .p-bk { width: 22%; }
  #printRoot .p-ind-nama { font-weight: 700; }
  #printRoot .p-ind-dim, #printRoot .p-ind-faktor { font-size: 7.5pt; color: #777; margin-top: 2px; }
  #printRoot .p-tahap { font-weight: 700; }
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

/* ── Kelompokkan 39 indikator: prioritas vs lainnya (urutan nomor asli dipertahankan) ── */
function buildPrintGroups(){
  const prio = [], lain = [];
  INDICATORS.forEach(ind=>{
    const e = normalizeEntry(state[ind.id]);
    (e.prioritas ? prio : lain).push({ind, e});
  });
  return {prio, lain};
}

/* ── 1 baris tabel utk 1 indikator ── */
function printRowHtml(ind, e){
  const fokus = [...e.fokus, ...e.fokusCustom].filter(Boolean);
  const aksi  = [...e.aksi,  ...e.aksiCustom ].filter(Boolean);
  const bukti = [...e.bukti, ...e.buktiCustom].filter(Boolean);
  const bC = tahapCfg(e.baseline), tC = tahapCfg(e.target);
  return `<tr>
    <td class="p-no">${ind.id}</td>
    <td class="p-ind">
      <div class="p-ind-nama">${escapeHtml(ind.indikator)}</div>
      <div class="p-ind-dim">${escapeHtml(ind.dimensi)}</div>
      ${e.faktor ? `<div class="p-ind-faktor">Kondisi awal: ${escapeHtml(e.faktor)}</div>` : ""}
    </td>
    <td class="p-bt"><span class="p-tahap" style="color:${bC.dot}">${escapeHtml(e.baseline||"-")}</span> &rarr; <span class="p-tahap" style="color:${tC.dot}">${escapeHtml(e.target||"-")}</span></td>
    <td class="p-fa">
      ${fokus.length ? `<b>${escapeHtml(fokus.join(", "))}</b>` : ""}
      ${aksi.length ? `<ul>${aksi.map(a=>`<li>${escapeHtml(a)}</li>`).join("")}</ul>` : ""}
    </td>
    <td class="p-wp">${escapeHtml(e.waktu||"-")}<br>${escapeHtml(e.pj||"-")}</td>
    <td class="p-bk">${bukti.length ? escapeHtml(bukti.join(", ")) : "-"}</td>
  </tr>`;
}

/* ── Kerangka tabel (header kolom + isi) ── */
function printTableHtml(rowsHtml){
  return `<table class="p-table">
    <thead><tr>
      <th class="p-no">No</th>
      <th class="p-ind">Indikator</th>
      <th class="p-bt">Kondisi Awal &rarr; Target</th>
      <th class="p-fa">Fokus &amp; Rencana Aksi</th>
      <th class="p-wp">Waktu / PJ</th>
      <th class="p-bk">Bentuk Bukti</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>`;
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
  const { prio, lain } = buildPrintGroups();

  let sections;
  if(prio.length){
    sections = `<div class="p-section-title p-prio">Indikator Prioritas</div>` +
      printTableHtml(prio.map(x=>printRowHtml(x.ind,x.e)).join("")) +
      `<div class="p-section-title p-lain">Indikator Lainnya</div>` +
      printTableHtml(lain.map(x=>printRowHtml(x.ind,x.e)).join(""));
  } else {
    sections = `<div class="p-section-title p-lain">Seluruh Indikator</div>` +
      printTableHtml(lain.map(x=>printRowHtml(x.ind,x.e)).join(""));
  }

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
