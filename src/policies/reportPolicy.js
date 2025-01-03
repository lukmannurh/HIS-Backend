/**
 * canViewAllReports: menentukan apakah user bisa memanggil endpoint "GET /api/reports" (semua laporan).
 *   - Owner: true (melihat semua)
 *   - Admin: true (nanti difilter di controller agar hanya laporan milik user role="user")
 *   - User: false (karena user hanya boleh melihat laporannya sendiri via filter di controller)
 */
export function canViewAllReports(currentUserRole) {
  if (currentUserRole === "owner") return true;
  if (currentUserRole === "admin") return true;
  return false; // user => false
}

/**
 * canViewReport: menentukan apakah user boleh melihat 1 report tertentu.
 *   - Owner: boleh lihat semua
 *   - Admin: boleh lihat report jika pemilik laporan punya role="user"
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
    // Boleh lihat jika pemilik report adalah user dengan role "user"
    return targetReportOwnerRole === "user";
  }

  // currentUser.role === "user"
  return currentUser.id === targetReportOwnerId;
}

/**
 * canCreateReport:
 *   - Jika Anda mengizinkan semua role (owner, admin, user) untuk membuat laporan => return true
 *   - Jika ingin membatasi hanya user tertentu => sesuaikan di sini
 */
export function canCreateReport(currentUserRole) {
  // misalkan semua role boleh membuat laporan
  return ["owner", "admin", "user"].includes(currentUserRole);
}

/**
 * canUpdateReport: menentukan apakah user boleh memperbarui (update) report tertentu.
 *   - Owner: boleh update semua
 *   - Admin: hanya boleh update jika pemilik report ber-role "user"
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
    return targetReportOwnerRole === "user";
  }

  // user
  return currentUser.id === targetReportOwnerId;
}

/**
 * canDeleteReport: menentukan apakah user boleh menghapus (delete) report tertentu.
 *   - Owner: boleh hapus semua
 *   - Admin: hanya boleh hapus jika pemilik report adalah role="user"
 *   - User: hanya boleh hapus miliknya sendiri
 */
export function canDeleteReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  if (currentUser.role === "owner") {
    return true;
  }

  if (currentUser.role === "admin") {
    return targetReportOwnerRole === "user";
  }

  // user
  return currentUser.id === targetReportOwnerId;
}
