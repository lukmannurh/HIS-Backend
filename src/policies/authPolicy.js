/**
 * canRegisterUser:
 * - Owner: hanya dapat membuat akun dengan role "admin"
 * - Admin: hanya dapat membuat akun dengan role "user"
 * - User atau tidak terautentikasi: tidak dapat membuat akun
 *
 * @param {object} currentUser    Objek user yang sedang login (id, role)
 * @param {string} newUserRole    Role yang diinginkan untuk user baru
 * @returns {boolean}
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
