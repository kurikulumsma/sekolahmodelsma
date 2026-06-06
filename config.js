/**
 * config.js — Dasbor Sekolah Model 2026 (v2)
 * Konstanta global: Supabase, nama tabel, versi app.
 *
 * Load PERTAMA sebelum auth.js, ui.js, dan script halaman.
 * <script src="config.js"></script>
 */

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SUPA_URL = 'https://lusytejskqevwyyffeue.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c3l0ZWpza3Fldnd5eWZmZXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzUyODksImV4cCI6MjA5MTcxMTI4OX0.LKCfdnlB8TQTeB7NuZ1DXwSkCI9DK3WlD4xk-jzUTPU';

// Lazy-init client — panggil getSb() di mana saja
let _sb = null;
function getSb() {
  if (_sb) return _sb;
  if (!window.supabase) { console.error('Supabase SDK belum load'); return null; }
  _sb = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  return _sb;
}

// ─── Nama tabel ───────────────────────────────────────────────────────────────
const TABLE_USERS   = 'user_db_sekmodel';       // akun & profil user
const TABLE_SCHOOLS = 'sekolah_model_2026';     // data 223 sekolah model

// ─── App ──────────────────────────────────────────────────────────────────────
const APP_VERSION = '2.0.0';
const APP_NAME    = 'Dasbor Sekolah Model 2026';
