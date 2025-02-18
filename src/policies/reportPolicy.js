// Fungsi-fungsi policy yang sudah ada...
export function canViewAllReports(currentUserRole) {
  return ["owner", "admin"].includes(currentUserRole);
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
      targetReportOwnerRole === "user" || targetReportOwnerId === currentUser.id
    );
  }
  return currentUser.id === targetReportOwnerId;
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
      targetReportOwnerRole === "user" || targetReportOwnerId === currentUser.id
    );
  }
  return currentUser.id === targetReportOwnerId;
}

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

// Fungsi baru untuk memeriksa perubahan status laporan
export function canChangeReportStatus(currentUser) {
  return currentUser.role === "owner" || currentUser.role === "admin";
}
