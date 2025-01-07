/**
 * canViewAllReports: menentukan apakah user bisa memanggil endpoint "GET /api/reports" (semua laporan).
 *   - Owner: true (melihat semua)
 *   - Admin: true (melihat laporan milik user dan dirinya sendiri)
 *   - User: false (karena user hanya boleh melihat laporannya sendiri via filter di controller)
 */
export function canViewAllReports(currentUserRole) {
  return ["owner", "admin"].includes(currentUserRole);
}

/**
 * canViewReport: menentukan apakah user boleh melihat 1 report tertentu.
 *   - Owner: boleh lihat semua
 *   - Admin: boleh lihat report jika pemilik laporan punya role="user" atau laporan milik admin itu sendiri
 *   - User: boleh lihat report jika report.userId === currentUser.id
 */
export function canViewReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  if (currentUser.role === "owner") {
    return true;
  }

  if (currentUser.role === "admin") {
    // Admin dapat melihat laporan milik user atau laporan milik dirinya sendiri
    return (
      targetReportOwnerRole === "user" || targetReportOwnerId === currentUser.id
    );
  }

  // currentUser.role === "user"
  return currentUser.id === targetReportOwnerId;
}

/**
 * canCreateReport:
 *   - Semua role yang terautentikasi (owner, admin, user) boleh membuat laporan
 */
export function canCreateReport(currentUserRole) {
  return ["owner", "admin", "user"].includes(currentUserRole);
}

/**
 * canUpdateReport: menentukan apakah user boleh memperbarui (update) report tertentu.
 *   - Owner: boleh update semua
 *   - Admin: boleh update jika pemilik report "user" atau dirinya sendiri
 *   - User: hanya boleh update laporan miliknya sendiri
 */
export function canUpdateReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  if (currentUser.role === "owner") {
    return true;
  }

  if (currentUser.role === "admin") {
    // Admin dapat memperbarui laporan milik user atau dirinya sendiri
    return (
      targetReportOwnerRole === "user" || targetReportOwnerId === currentUser.id
    );
  }

  // user
  return currentUser.id === targetReportOwnerId;
}

/**
 * canDeleteReport: menentukan apakah user boleh menghapus (delete) report tertentu.
 *   - Owner: boleh hapus semua
 *   - Admin: boleh hapus jika pemilik report "user" atau dirinya sendiri
 *   - User: hanya boleh hapus report miliknya sendiri
 */
export function canDeleteReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  // Logika sama dengan canUpdateReport
  return canUpdateReport(
    currentUser,
    targetReportOwnerRole,
    targetReportOwnerId
  );
}
