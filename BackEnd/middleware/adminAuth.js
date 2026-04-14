module.exports = function (req, res, next) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
