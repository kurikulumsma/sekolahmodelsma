// cetak-baseline.js
// Export data baseline 1 sekolah ke file Excel (.xlsx) — dipanggil dari tombol
// "Unduh Data" di baseline.html lewat unduhDataBaseline() → cetakBaselineExcel(row)
//
// Struktur workbook:
//   - Sheet "SMA"         : 1 baris data sekolah yang lagi dibuka (dari ALL_SCHOOLS / tabel Supabase)
//   - Sheet "codebook PM" : referensi statis Level 1/2/3 + kode, Pembelajaran Mendalam
//   - Sheet "codebook KKA": referensi statis Level 1/2/3 + kode, Koding & Kecerdasan Artifisial
//
// Butuh ExcelJS (di-include lewat CDN di baseline.html sebelum file ini).

/* ───────────────── Data codebook statis (sumber: file referensi Excel) ───────────────── */

const CODEBOOK_PM = [
  { level1: 'Murid', groups: [
    { level2: 'Budaya Belajar', kodeLevel2: '1.1', items: [
      { kode: '1.1.1', level3: 'Memuliakan' },
      { kode: '1.1.2', level3: 'Berkesadaran' },
      { kode: '1.1.3', level3: 'Bermakna' },
      { kode: '1.1.4', level3: 'Menggembirakan' },
      { kode: '1.1.5', level3: 'Otonomi Belajar' },
      { kode: '1.1.6', level3: 'Refleksi' },
    ]},
  ]},
  { level1: 'Guru', groups: [
    { level2: 'Mengajar secara Efektif', kodeLevel2: '2.1', items: [
      { kode: '2.1.1', level3: 'Memuliakan' },
      { kode: '2.1.2', level3: 'Pengelolaan Pembelajaran' },
      { kode: '2.1.3', level3: 'Refleksi' },
    ]},
    { level2: 'Asesmen Otentik & Berkeadilan', kodeLevel2: '2.2', items: [
      { kode: '2.2.1', level3: 'Formatif' },
      { kode: '2.2.2', level3: 'Sumatif' },
    ]},
    { level2: 'Pengembangan Diri', kodeLevel2: '2.3', items: [
      { kode: '2.3.1', level3: 'Belajar secara Mandiri' },
      { kode: '2.3.2', level3: 'Belajar bersama Komunitas' },
    ]},
  ]},
  { level1: 'Kepala Satpen', groups: [
    { level2: 'Kepemimpinan Pembelajaran Mendalam', kodeLevel2: '3.1', items: [
      { kode: '3.1.1', level3: 'Memimpin Implementasi PM' },
      { kode: '3.1.2', level3: 'Menyelaraskan visi Misi Sekolah dengan PM Bersama Pemangku Kepentingan' },
      { kode: '3.1.3', level3: 'Melakukan supervisi instruksional PM' },
      { kode: '3.1.4', level3: 'Memimpin refleksi' },
    ]},
    { level2: 'Pengelolaan Sumber Daya', kodeLevel2: '3.2', items: [
      { kode: '3.2.1', level3: 'Mengembangkan dan Menguatkan Kapasitas Pendidik dan Tenaga Kependidikan' },
      { kode: '3.2.2', level3: 'Mengoptimalisasi Sumber Daya untuk Kegiatan Pendidikan' },
      { kode: '3.2.3', level3: 'Manajemen Sekolah' },
    ]},
    { level2: 'Kemitraan dan Ekosistem', kodeLevel2: '3.3', items: [
      { kode: '3.3.1', level3: 'Mengembangkan Kemitraan dengan orang tua, masyarakat, komunitas sekolah, DUDI' },
      { kode: '3.3.2', level3: 'Lingkungan Belajar yang saling Memuliakan, aman, dan Nyaman' },
    ]},
    { level2: 'Pemanfaatan Teknologi Digital', kodeLevel2: '3.4', items: [
      { kode: '3.4.1', level3: 'Mengembangkan infrastruktur teknologi digital untuk pembelajaran dan administrasi' },
      { kode: '3.4.2', level3: 'Meningkatkan Kapasitas Pendidik dan Tenaga Kependidikan dalam Memanfaatkan TIK' },
    ]},
  ]},
];

const CODEBOOK_KKA = [
  { level1: 'Murid', groups: [
    { level2: 'Budaya Belajar', kodeLevel2: '1.1', items: [
      { kode: '1.1.1', level3: 'Projek Koding dan KA yang dikembangkan murid' },
    ]},
  ]},
  { level1: 'Guru', groups: [
    { level2: 'Mengajar secara Efektif', kodeLevel2: '2.1', items: [
      { kode: '2.1.1', level3: 'Literasi digital guru' },
      { kode: '2.1.2', level3: 'Pemanfaatan teknologi secara kontekstual dalam pelaksanaan/pengelolaan pembelajaran' },
    ]},
    { level2: 'Asesmen Otentik & Berkeadilan', kodeLevel2: '2.2', items: [
      { kode: '2.2.1', level3: 'Pemanfaatan teknologi secara kontekstual dalam penilaian pembelajaran' },
    ]},
  ]},
  { level1: 'Kepala Satpen', groups: [
    { level2: 'Kepemimpinan Pembelajaran Mendalam', kodeLevel2: '3.1', items: [
      { kode: '3.1.1', level3: 'Memimpin implementasi Koding dan Kecerdasan Artifisial' },
      { kode: '3.1.2', level3: 'Supervisi pembelajaran Koding dan Kecerdasan Artifisial' },
    ]},
    { level2: 'Pengelolaan Sumber Daya', kodeLevel2: '3.2', items: [
      { kode: '3.2.1', level3: 'Penguatan kapasitas dan aktivasi komunitas belajar pendidik pengampu Koding dan KA' },
      { kode: '3.2.2', level3: 'Penyediaan sumber belajar Koding dan KA' },
    ]},
    { level2: 'Kemitraan dan Ekosistem', kodeLevel2: '3.3', items: [
      { kode: '3.3.1', level3: 'Pengembangan kemitraan untuk mendukung pembelajaran Koding dan KA' },
    ]},
    { level2: 'Pemanfaatan Teknologi Digital', kodeLevel2: '3.4', items: [
      { kode: '3.4.1', level3: 'Penyediaan sarana dan prasarana digital yang mendukung pembelajaran Koding dan KA' },
      { kode: '3.4.2', level3: 'Mendorong pemanfaatan teknologi digital secara kontekstual untuk mendukung pelaksanaan pembelajaran Koding dan KA yang bermakna' },
    ]},
  ]},
];

/* ───────────────── Definisi kolom sheet "SMA" ───────────────── */

const PM_L3_CODES  = ['1_1_1','1_1_2','1_1_3','1_1_4','1_1_5','1_1_6','2_1_1','2_1_2','2_1_3','2_2_1','2_2_2','2_3_1','2_3_2','3_1_1','3_1_2','3_1_3','3_1_4','3_2_1','3_2_2','3_2_3','3_3_1','3_3_2','3_4_1','3_4_2'];
const PM_L2_CODES  = ['d1_1','d2_1','d2_2','d2_3','d3_1','d3_2','d3_3','d3_4'];
const KKA_L3_CODES = ['1_1_1','2_1_1','2_1_2','2_2_1','3_1_1','3_1_2','3_2_1','3_2_2','3_3_1','3_4_1','3_4_2'];
const KKA_L2_CODES = ['d1_1','d2_1','d2_2','d3_1','d3_2','d3_3','d3_4'];

const GROUP_COLORS = {
  meta:    'FF1E3A5F',
  pm3:     'FF2B72D8',
  pm2:     'FF1A4A8F',
  pm1:     'FF123B6E',
  pmskor:  'FF0B2C54',
  kka3:    'FF1A6B3E',
  kka2:    'FF14552F',
  kka1:    'FF0F3F23',
  kkaskor: 'FF0A2E19',
};

const SMA_COLUMNS = [
  { header: 'No',                           key: 'no',               width: 6,  group: 'meta' },
  { header: 'Jenjang',                      key: 'jenjang',          width: 10, group: 'meta' },
  { header: 'NPSN',                         key: 'npsn',             width: 13, group: 'meta' },
  { header: 'Nama Sekolah',                 key: 'nama',             width: 36, group: 'meta' },
  { header: 'Provinsi',                     key: 'provinsi',         width: 18, group: 'meta' },
  { header: 'Kabupaten/Kota',               key: 'kabupaten_kota',   width: 22, group: 'meta' },
  { header: 'Status Sekolah',               key: 'status_sekolah',   width: 11, group: 'meta' },
  { header: 'Status Pelaksana Koding & KA', key: 'status_koding_ka', width: 14, group: 'meta' },
  { header: 'Jumlah Guru Tetap',            key: 'jumlah_guru_tetap', width: 12, group: 'meta' },
  { header: 'Status Pemilihan',             key: 'status_pemilihan', width: 14, group: 'meta' },
  ...PM_L3_CODES.map(c => ({ header: 'PM Level 3', sub: c.replace(/_/g, '.'), key: `pm_${c}`, width: 9, group: 'pm3' })),
  ...PM_L2_CODES.map(c => ({ header: 'PM Level 2', sub: c.slice(1).replace(/_/g, '.'), key: `pm_${c}`, width: 9, group: 'pm2' })),
  { header: 'PM Level 1', sub: 'Murid',  key: 'pm_murid',  width: 11, group: 'pm1' },
  { header: 'PM Level 1', sub: 'Guru',   key: 'pm_guru',   width: 11, group: 'pm1' },
  { header: 'PM Level 1', sub: 'Kepsek', key: 'pm_kepsek', width: 11, group: 'pm1' },
  { header: 'Skor PM',   key: 'skor_pm',   width: 9,  group: 'pmskor' },
  { header: 'Profil PM', key: 'profil_pm', width: 14, group: 'pmskor' },
  ...KKA_L3_CODES.map(c => ({ header: 'KKA Level 3', sub: c.replace(/_/g, '.'), key: `kka_${c}`, width: 9, group: 'kka3' })),
  ...KKA_L2_CODES.map(c => ({ header: 'KKA Level 2', sub: c.slice(1).replace(/_/g, '.'), key: `kka_${c}`, width: 9, group: 'kka2' })),
  { header: 'KKA Level 1', sub: 'Murid',  key: 'kka_murid',  width: 11, group: 'kka1' },
  { header: 'KKA Level 1', sub: 'Guru',   key: 'kka_guru',   width: 11, group: 'kka1' },
  { header: 'KKA Level 1', sub: 'Kepsek', key: 'kka_kepsek', width: 11, group: 'kka1' },
  { header: 'Skor KKA',   key: 'skor_kka',   width: 9,  group: 'kkaskor' },
  { header: 'Profil KKA', key: 'profil_kka', width: 14, group: 'kkaskor' },
];

/* ───────────────── Builder sheet "SMA" ───────────────── */
// 2 baris header: row1 = label grup (merge horizontal, mis. "PM Level 3"),
// row2 = kode polos sesuai codebook (mis. "1.1.1"); kolom yang berdiri sendiri
// (identitas sekolah + skor/profil) di-merge vertikal row1:row2 satu kali.

const SMA_STANDALONE_GROUPS = new Set(['meta', 'pmskor', 'kkaskor']);

function buildSmaSheet(wb, row) {
  const ws = wb.addWorksheet('SMA');
  ws.columns = SMA_COLUMNS.map(c => ({ key: c.key, width: c.width }));

  const row1 = ws.getRow(1);
  const row2 = ws.getRow(2);

  SMA_COLUMNS.forEach((c, i) => {
    const colNum = i + 1;
    if (SMA_STANDALONE_GROUPS.has(c.group)) {
      ws.mergeCells(1, colNum, 2, colNum);
      row1.getCell(colNum).value = c.header;
    } else {
      row1.getCell(colNum).value = c.header;
      row2.getCell(colNum).value = c.sub;
    }
  });

  // Merge horizontal untuk kolom-kolom berturutan dalam grup level yang sama
  let i = 0;
  while (i < SMA_COLUMNS.length) {
    const c = SMA_COLUMNS[i];
    if (!SMA_STANDALONE_GROUPS.has(c.group)) {
      let j = i;
      while (j + 1 < SMA_COLUMNS.length && SMA_COLUMNS[j + 1].group === c.group) j++;
      if (j > i) ws.mergeCells(1, i + 1, 1, j + 1);
      i = j + 1;
    } else {
      i++;
    }
  }

  [row1, row2].forEach(r => {
    r.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const def = SMA_COLUMNS[colNumber - 1];
      if (!def) return;
      cell.font = { bold: true, size: 9.5, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GROUP_COLORS[def.group] } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
  });
  row1.height = 20;
  row2.height = 34;

  // Kolom kode/skor (Level 3/2/1 + Skor/Profil PM & KKA) yang kosong di Supabase
  // ditampilkan sebagai error #N/A asli di Excel — kolom identitas sekolah tetap
  // dikosongin biasa aja kalau kosong, biar sama kayak file sample.
  const NA_GROUPS = new Set(['pm3', 'pm2', 'pm1', 'pmskor', 'kka3', 'kka2', 'kka1', 'kkaskor']);

  const dataObj = { no: 1, jenjang: 'SMA' };
  SMA_COLUMNS.forEach(c => {
    if (c.key === 'no' || c.key === 'jenjang') return;
    const val = row[c.key];
    const kosong = val === undefined || val === null || val === '';
    dataObj[c.key] = kosong && NA_GROUPS.has(c.group) ? { error: '#N/A' } : (kosong ? '' : val);
  });
  const dr = ws.addRow(dataObj);
  dr.height = 20;
  dr.eachCell(cell => {
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } };
  });

  ws.views = [{ state: 'frozen', xSplit: 4, ySplit: 2 }];
}

/* ───────────────── Builder sheet codebook (PM / KKA) ───────────────── */

function buildCodebookSheet(wb, sheetName, data) {
  const ws = wb.addWorksheet(sheetName);
  ws.columns = [
    { header: 'Level 1',      key: 'level1',     width: 15 },
    { header: 'Level 2',      key: 'level2',     width: 32 },
    { header: 'Kode Level 2', key: 'kodeLevel2', width: 12 },
    { header: 'Level 3',      key: 'level3',     width: 68 },
    { header: 'Kode Level 3', key: 'kodeLevel3', width: 12 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  headerRow.height = 22;
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  let r = 2;
  data.forEach(l1 => {
    const l1Start = r;
    l1.groups.forEach(l2 => {
      const l2Start = r;
      l2.items.forEach(item => {
        ws.addRow({ level1: l1.level1, level2: l2.level2, kodeLevel2: l2.kodeLevel2, level3: item.level3, kodeLevel3: item.kode });
        r++;
      });
      if (r - l2Start > 1) {
        ws.mergeCells(`B${l2Start}:B${r - 1}`);
        ws.mergeCells(`C${l2Start}:C${r - 1}`);
      }
    });
    if (r - l1Start > 1) ws.mergeCells(`A${l1Start}:A${r - 1}`);
  });

  ws.eachRow((row, rowNumber) => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
      if (rowNumber > 1) cell.alignment = { vertical: 'middle', wrapText: true, horizontal: (cell.col === 5 || cell.col === 3) ? 'center' : 'left' };
    });
  });
}

/* ───────────────── Entry point ───────────────── */

async function cetakBaselineExcel(row) {
  if (!row) return;
  if (typeof ExcelJS === 'undefined') {
    console.warn('ExcelJS belum termuat — cek koneksi CDN di baseline.html.');
    return;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Direktorat SMA — Baseline Sekolah Model';
  wb.created = new Date();

  buildSmaSheet(wb, row);
  buildCodebookSheet(wb, 'codebook PM', CODEBOOK_PM);
  buildCodebookSheet(wb, 'codebook KKA', CODEBOOK_KKA);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const namaBersih = String(row.nama || 'Sekolah').trim().replace(/\s+/g, '_');
  const provinsiBersih = String(row.provinsi || '').trim().replace(/\s+/g, '_');
  const filename = `${namaBersih}_${provinsiBersih}_Profil_Kondisi_Awal__Baseline__SM_SMA.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
