/**
 * canRegisterUser:
 *   - Owner, Admin => boleh membuat user baru
 *   - User => tidak boleh
 *   - Unauthenticated => juga tidak boleh
 */
export function canRegisterUser(currentUser) {
  // currentUser bisa saja { id, role } atau mungkin undefined jika belum login
  if (!currentUser) {
    // kalau user tidak login => false
    return false;
  }
  if (currentUser.role === "owner" || currentUser.role === "admin") {
    return true;
  }
  return false;
}
