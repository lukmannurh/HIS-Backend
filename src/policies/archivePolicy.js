/**
 * canViewArchive:
 * - Owner dan admin dapat melihat semua arsip.
 * - User biasa hanya dapat melihat arsip miliknya.
 */
export function canViewArchive(currentUser, archiveReportUserId) {
    if (["owner", "admin"].includes(currentUser.role)) return true;
    return currentUser.id === archiveReportUserId;
  }
  
  /**
   * canDeleteArchive:
   * - Hanya owner yang diizinkan menghapus arsip.
   */
  export function canDeleteArchive(currentUser) {
    return currentUser.role === "owner";
  }
  