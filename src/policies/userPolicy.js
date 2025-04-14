/**
 * canViewAllUsers:
 *   - Owner: true (bisa melihat semua user)
 *   - Admin: true (tapi nanti kita filter di controller agar hanya role 'user')
 *   - User: false
 */
export function canViewAllUsers(currentUserRole) {
  if (currentUserRole === "owner") return true;
  if (currentUserRole === "admin") return true;
  return false;
}

/**
 * canViewUser:
 *   - Owner: true (bisa melihat user siapa pun)
 *   - Admin: true, kecuali targetUser.role === "owner"
 *   - User: true jika currentUser.id === targetUser.id (melihat diri sendiri)
 */
export function canViewUser(currentUser, targetUser) {
  if (currentUser.role === "owner") return true;

  if (currentUser.role === "admin") {
    // Admin tidak boleh melihat owner
    if (targetUser.role === "owner") {
      return false;
    }
    return true;
  }

  // User biasa hanya boleh melihat dirinya sendiri
  if (currentUser.role === "user") {
    return currentUser.id === targetUser.id;
  }

  return false;
}

/**
 * canDeleteUser:
 *   - Owner: boleh menghapus user siapa pun (termasuk admin)
 *   - Admin: hanya boleh hapus user role='user'
 *   - User: tidak boleh hapus siapapun (kecuali menghapus dirinya sendiri jika diinginkan)
 */
export function canDeleteUser(currentUser, targetUser) {
  if (currentUser.role === "owner") {
    return true;
  }

  if (currentUser.role === "admin") {
    if (targetUser.role === "user") {
      return true;
    }
    return false;
  }

  // Kalau user biasa diizinkan menghapus dirinya sendiri, tambahkan cek: currentUser.id === targetUser.id
  return false;
}

/**
 * canUpdateUser: (opsional, jika Anda ingin pemisahan lebih detail)
 *   - Owner: bisa update user siapa pun
 *   - Admin: bisa update user, kecuali owner
 *   - User: hanya bisa update dirinya sendiri
 */
export function canUpdateUser(currentUser, targetUser) {
  if (currentUser.role === "owner") return true;

  if (currentUser.role === "admin") {
    if (targetUser.role === "owner") {
      return false;
    }
    return true;
  }

  if (currentUser.role === "user") {
    return currentUser.id === targetUser.id;
  }

  return false;
}

/**
 * canRegisterUser:
 * - Owner: dapat membuat user baru dengan role "admin" atau "user".
 * - Admin: hanya dapat membuat user baru dengan role "user".
 * - User atau tidak terautentikasi: tidak dapat membuat akun.
 *
 * @param {object} currentUser - Objek user yang sedang login (misal, { id, role })
 * @param {string} newUserRole - Role yang diinginkan untuk user baru.
 * @returns {boolean}
 */
export function canRegisterUser(currentUser, newUserRole) {
  if (!currentUser) {
    return false;
  }
  if (currentUser.role === "owner") {
    return newUserRole === "admin" || newUserRole === "user";
  }
  if (currentUser.role === "admin") {
    return newUserRole === "user"; // Admin hanya dapat membuat user role 'user'
  }
  return false;
}
