// Data referensi Rekomendasi Tindak Lanjut, dipakai di baseline.html (bagian "Rekomendasi Tindak Lanjut").
// Isi diambil dari buku "Panduan Penyelenggaraan Sekolah Model" (rekomendasi.xlsx).
// Dipisah dari baseline.html biar gampang diedit tanpa nyentuh logic dashboard —
// ini teks referensi umum per-level, bukan data per-sekolah, jadi disimpan di JS (bukan tabel Supabase baru).
const REKOM_LEVELS = ['Pra Berkembang', 'Berkembang', 'Maju', 'Unggul'];
const REKOMENDASI_DATA = {
  "Pra Berkembang": {
    "fokus": [
      "Membangun fondasi lingkungan belajar yang aman, tertib, inklusif, dan bebas kekerasan.",
      "Pelibatan murid dalam proses pembelajaran",
      "Membangun kesadaran dasar tentang komponen pembelajaran (perencanaan, pelaksanaan, penilaian).",
      "Pendidik memahami tujuan pembelajaran dan penilaian dasar.",
      "Penyelarasan visi–misi sekolah dengan prinsip Pembelajaran Mendalam melalui peran kepemimpinan kepala sekolah.",
      "Pengenalan konsep algoritma dasar dan literasi digital sebagai fondasi KKA."
    ],
    "rencana": [
      "Sosialisasi standar penilaian formatif–sumatif, budaya positif, dan kode etik satuan pendidikan.",
      "Pelatihan dasar penyusunan perencanaan pembelajaran dan penilaian formatif.",
      "Pengenalan teknik mengajar sederhana berpusat murid.",
      "Penyediaan sumber belajar dasar (buku teks, LKPD, platform digital sederhana).",
      "Aktivitas koding dasar berbasis media visual sebagai integrasi awal KKA."
    ],
    "evaluasi": [
      "Observasi kelas (kesesuaian perencanaan pembelajaran dengan pelaksanaan).",
      "Analisis dokumen perencanaan pendidik.",
      "Survei kepuasan murid terhadap metode mengajar dan rasa aman.",
      "Nilai hasil belajar awal (baseline).",
      "Pemantauan kemampuan pendidik mengintegrasikan koding dasar dan partisipasi murid dalam aktivitas KKA awal."
    ]
  },
  "Berkembang": {
    "fokus": [
      "Penguatan konsistensi penerapan pembelajaran berpusat pada murid.",
      "Integrasi penilaian formatif",
      "Budaya refleksi pendidik dan murid.",
      "Konsistensi pendampingan kepala satuan pendidikan kepada pelaksanaan Pembelajaran Mendalam",
      "Penguatan literasi digital melalui projek koding sederhana."
    ],
    "rencana": [
      "Workshop instrumen penilaian otentik dan diferensiasi.",
      "Peer teaching dan lesson study.",
      "Mengoptimalkan penggunaan asesmen formatif dan umpan balik",
      "Pelibatan orang tua dan komunitas.",
      "Penggunaan bahasa pemrograman visual berbasis blok untuk projek lintas mapel."
    ],
    "evaluasi": [
      "Peningkatan partisipasi aktif murid.",
      "Analisis hasil penilaian formatif dan kualitas umpan balik.",
      "Jurnal refleksi pendidik dan murid.",
      "Peningkatan kemampuan pendidik menggunakan teknologi pembelajaran.",
      "Jumlah dan kualitas projek koding sederhana, serta peningkatan literasi digital."
    ]
  },
  "Maju": {
    "fokus": [
      "Penguatan kualitas pembelajaran mendalam yang berpusat pada keterlibatan aktif dan refleksi murid.",
      "Penerapan Asesmen autentik dan berkeadilan.",
      "Perluasan kemitraan dengan orang tua, komunitas, dan dunia kerja sebagai sumber belajar kontekstual.",
      "Penerapan KKA tingkat lanjut melalui projek KA sederhana dan pemecahan masalah nyata."
    ],
    "rencana": [
      "Implementasi pembelajaran berbasis projek, inkuiri, dan kolaboratif.",
      "Pengembangan dan penerapan sistem penilaian portofolio dan projek.",
      "Penguatan peran pendidik sebagai aktivator, kolaborator, dan pengembang budaya belajar.",
      "Perluasan dan pemanfaatan kemitraan dengan orang tua, komunitas, dan dunia kerja dalam pembelajaran.",
      "Pengembangan projek Koding dan Kecerdasan Artifisial sederhana yang kontekstual dan relevan."
    ],
    "evaluasi": [
      "Tingkat keterlibatan murid dalam projek nyata dan kontribusi komunitas.",
      "Kemampuan murid merefleksikan proses belajar, menjelaskan keputusan, dan mempresentasikan hasil belajar.",
      "Umpan balik dari orang tua, komunitas, dan mitra dunia kerja terhadap relevansi pembelajaran.",
      "Peningkatan kompetensi sosial–emosional dan karakter.",
      "Kualitas projek KA sederhana serta relevansinya dengan konteks nyata."
    ]
  },
  "Unggul": {
    "fokus": [
      "Budaya belajar mendalam yang terinternalisasi (saling memuliakan, otonomi, refleksi).",
      "Peran murid sebagai pembelajar mandiri dan pemimpin sebaya",
      "Pendidik sebagai fasilitator, mentor, dan inspirator.",
      "Kepemimpinan pembelajaran transformatif dan ekosistem kolaboratif.",
      "Satuan pendidikan menjadi rujukan inovasi KKA dan etika digital."
    ],
    "rencana": [
      "Memposisikan satuan pendidikan sebagai pusat rujukan praktik baik PM melalui komunitas belajar profesional (KKG, MGMP, lokakarya, serta forum kolaboratif lintas satuan pendidikan).",
      "Menguatkan kebijakan, tata kelola, dan jejaring lintas satuan pendidikan",
      "Menggerakkan KKG/MGMP, lokakarya, dan forum kolaboratif lintas satuan pendidikan.",
      "Mentorship pembelajaran mendalam antar satuan pendidikan.",
      "Pengembangan projek digital/KA berdampak sosial (IoT, lingkungan) dan pemanfaatan maker space untuk KKA."
    ],
    "evaluasi": [
      "Karya inovatif pendidik dan murid diakui regional/ nasional.",
      "Partisipasi aktif pendidik dan kepala satuan pendidikan sebagai narasumber/ mentor dalam jejaring profesional.",
      "Keterlibatan dalam jejaring regional atau lebih luas.",
      "Survei kepuasan komunitas terhadap peran satuan pendidikan.",
      "Dampak program pada peningkatan mutu pembelajaran & budaya belajar di lingkungan sekitar.",
      "Jumlah satuan pendidikan terimbas mentorship pembelajaran mendalam.",
      "Jumlah satuan pendidikan terimbas inovasi KKA dan kualitas produk digital/ KA yang diimplementasikan."
    ]
  }
};
