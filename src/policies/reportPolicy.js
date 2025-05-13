export function canViewAllReports(currentUserRole) {
  return ["owner", "admin", "user"].includes(currentUserRole);
}

export function canViewReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  if (currentUser.role === "owner") {
    return true;
  }
  if (currentUser.role === "admin") {
    return (
      targetReportOwnerRole === "user" ||
      targetReportOwnerId === currentUser.id
    );
  }
  // user boleh lihat semua laporan
  if (currentUser.role === "user") {
    return true;
  }
  // role lain (jika ada) tidak diizinkan
  return false;
}

export function canCreateReport(currentUserRole) {
  return ["owner", "admin", "user"].includes(currentUserRole);
}

export function canUpdateReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  if (currentUser.role === "owner") {
    return true;
  }
  if (currentUser.role === "admin") {
    return (
      targetReportOwnerRole === "user" ||
      targetReportOwnerId === currentUser.id
    );
  }
  // user TIDAK boleh update apa pun
  return false;
}

export function canDeleteReport(
  currentUser,
  targetReportOwnerRole,
  targetReportOwnerId
) {
  // sama dengan update
  return canUpdateReport(
    currentUser,
    targetReportOwnerRole,
    targetReportOwnerId
  );
}

// hanya owner/admin yang boleh ubah status
export function canChangeReportStatus(currentUser) {
  return currentUser.role === "owner" || currentUser.role === "admin";
}
