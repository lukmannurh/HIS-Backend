/**
 * Siapa saja yang boleh melihat daftar semua laporan
 * – Owner, Admin, ataupun User
 */
export function canViewAllReports(currentUserRole) {
  return ["owner", "admin", "user"].includes(currentUserRole);
}

/**
 * Cek apakah currentUser boleh melihat satu laporan tertentu.
 * – Owner, Admin, maupun User: semua boleh melihat tanpa pengecualian
 */
export function canViewReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  // Karena semua role (owner, admin, user) diizinkan melihat,
  // kita cukup mengembalikan true jika role termasuk daftar yang boleh view all.
  return canViewAllReports(currentUser.role);
}

/**
 * Siapa saja yang boleh membuat laporan
 */
export function canCreateReport(currentUserRole) {
  return ["owner", "admin", "user"].includes(currentUserRole);
}

/**
 * Siapa saja yang boleh memperbarui laporan
 * – Hanya Owner/Admin (bukan User)
 */
export function canUpdateReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  return ["owner", "admin"].includes(currentUser.role);
}

/**
 * Siapa saja yang boleh menghapus laporan
 * – Sama dengan canUpdateReport
 */
export function canDeleteReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  return canUpdateReport(
    currentUser,
    targetReportOwnerRole,
    targetReportOwnerId
  );
}

/**
 * Siapa saja yang boleh mengubah status laporan ke 'selesai'
 * – Hanya Owner/Admin
 */
export function canChangeReportStatus(currentUser) {
  return ["owner", "admin"].includes(currentUser.role);
}
