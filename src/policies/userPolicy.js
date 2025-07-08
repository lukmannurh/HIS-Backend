/**
 * canViewAllUsers:
 * - Owner: lihat hanya akun admin
 * - Admin: lihat hanya akun user
 * - User biasa: tidak boleh
 */
export function canViewAllUsers(currentUserRole) {
  return currentUserRole === "owner" || currentUserRole === "admin";
}

/**
 * canViewUser:
 * - Owner: hanya melihat detail akun admin
 * - Admin: hanya melihat detail akun user
 * - User: hanya melihat profil sendiri
 */
export function canViewUser(currentUser, targetUser) {
  if (currentUser.role === "owner") {
    return targetUser.role === "admin";
  }
  if (currentUser.role === "admin") {
    return targetUser.role === "user";
  }
  if (currentUser.role === "user") {
    return currentUser.id === targetUser.id;
  }
  return false;
}

/**
 * canDeleteUser:
 * - Owner: hanya boleh menghapus akun admin
 * - Admin: hanya boleh menghapus akun user
 * - User: tidak boleh
 */
export function canDeleteUser(currentUser, targetUser) {
  if (currentUser.role === "owner") {
    return targetUser.role === "admin";
  }
  if (currentUser.role === "admin") {
    return targetUser.role === "user";
  }
  return false;
}

/**
 * canUpdateUser:
 * - Owner: hanya update data akun admin
 * - Admin: hanya update data akun user
 * - User: hanya update profil sendiri
 */
export function canUpdateUser(currentUser, targetUser) {
  if (currentUser.role === "owner") {
    return targetUser.role === "admin";
  }
  if (currentUser.role === "admin") {
    return targetUser.role === "user";
  }
  if (currentUser.role === "user") {
    return currentUser.id === targetUser.id;
  }
  return false;
}

/**
 * canRegisterUser:
 * - Owner: hanya buat akun admin
 * - Admin: hanya buat akun user
 */
export function canRegisterUser(currentUser, newUserRole) {
  if (!currentUser) return false;
  if (currentUser.role === "owner") {
    return newUserRole === "admin";
  }
  if (currentUser.role === "admin") {
    return newUserRole === "user";
  }
  return false;
}
