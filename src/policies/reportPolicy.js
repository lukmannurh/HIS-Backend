/**
 * Siapa saja yang boleh melihat daftar semua laporan
 * – Owner, Admin, atau User
 */
export const canViewAllReports = (role) =>
  ["owner", "admin", "user"].includes(role);

/**
 * Cek apakah current user boleh melihat satu laporan tertentu.
 * Karena kita izinkan semua role lihat semua laporan,
 * cukup delegasi ke canViewAllReports.
 */
export const canViewReport = (role) =>
  canViewAllReports(role);

/**
 * Siapa saja yang boleh membuat laporan
 */
export const canCreateReport = (role) =>
  ["owner", "admin", "user"].includes(role);

/**
 * Siapa saja yang boleh memperbarui laporan
 * – Hanya Owner/Admin
 */
export const canUpdateReport = (role) =>
  ["owner", "admin"].includes(role);

/**
 * Siapa saja yang boleh menghapus laporan
 * – Sama dengan canUpdateReport
 */
export const canDeleteReport = canUpdateReport;

/**
 * Siapa saja yang boleh mengubah status laporan ke 'selesai'
 * – Hanya Owner/Admin
 */
export const canChangeReportStatus = (role) =>
  ["owner", "admin"].includes(role);
