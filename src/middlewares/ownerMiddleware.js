export default function ownerMiddleware(req, res, next) {
  if (req.userRole !== "owner") {
    return res.status(403).json({ message: "Forbidden: Owner only" });
  }
  next();
}
