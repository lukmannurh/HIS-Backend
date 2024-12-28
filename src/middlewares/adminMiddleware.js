export default (req, res, next) => {
  if (req.userRole !== "admin" && req.userRole !== "owner") {
    return res.status(403).json({ message: "Forbidden: Admin/Owner only" });
  }
  next();
};
