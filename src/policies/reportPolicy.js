/**
 * Siapa saja yang boleh melihat daftar laporan
 * – Admin dan User (User nanti di-controller hanya dapat melihat miliknya)
 */
export const canViewAllReports = (role) => role === "admin" || role === "user";

/**
 * Cek apakah current user boleh melihat satu laporan tertentu.
 * – Admin dan User (User nanti di-controller hanya dapat melihat miliknya)
 */
export const canViewReport = canViewAllReports;

/**
 * Siapa saja yang boleh membuat laporan
 * – Hanya User
 */
export const canCreateReport = (role) => role === "user";

/**
 * Siapa saja yang boleh memperbarui konten laporan
 * – Hanya Admin
 */
export const canUpdateReport = (role) => role === "admin";

/**
 * Siapa saja yang boleh menghapus laporan
 * – Hanya Admin
 */
export const canDeleteReport = (role) => role === "admin";

/**
 * Siapa saja yang boleh mengubah status laporan (diproses→selesai)
 * – Hanya Admin
 */
export const canChangeReportStatus = (role) => role === "admin";

/**
 * Siapa saja yang boleh mengarsipkan laporan (manual)
 * – Hanya Admin
 */
export const canArchiveReport = (role) => role === "admin";

/**
 * Siapa saja yang boleh menjalankan auto-archive
 * – Hanya Admin
 */
export const canAutoArchive = (role) => role === "admin";
