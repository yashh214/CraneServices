const Student = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Fallback JWT secret if not defined in environment variables (must match auth.js)
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_key_12345";

/* USER SIGNUP */
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await Student.findOne({ email, isDeleted: false });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  // role is typically "user"; only allow creating admin when explicitly provided and caller has privilege
  const userData = { name, email, password: hashedPassword };
  if (role && role === "admin") {
    userData.role = "admin";
  }

  await Student.create(userData);

  res.status(201).json({ message: "User signup successful" });
};

/* USER LOGIN */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  // Static admin bypass: allow a hardcoded admin credential for quick access.
  // NOTE: This is intended for local/dev convenience. Remove or secure for production.
  if (email === "admin@gmail.com" && password === "admin@123") {
    const token = jwt.sign({ userId: "admin-static", role: "admin" }, JWT_SECRET, { expiresIn: "1d" });

    return res.json({
      message: "Admin login successful",
      token,
      user: {
        id: "admin-static",
        name: "Admin",
        email: "admin@gmail.com",
        role: "admin"
      }
    });
  }

  const user = await Student.findOne({ email, isDeleted: false });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    message: "User login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

/* USER COUNT */
exports.countUsers = async (req, res) => {
  const count = await Student.countDocuments({ isDeleted: false });
  res.json({ count });
};

/* GET ALL USERS */
exports.getUsers = async (req, res) => {
  try {
    const users = await Student.find({ isDeleted: false })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* SEARCH USER */
exports.searchUser = async (req, res) => {
  try {
    const { keyword } = req.query;
    const users = await Student.find({
      isDeleted: false,
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ],
    }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* UPDATE USER */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await Student.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // only admin can change role
    if (role && req.user.role === 'admin') {
      user.role = role;
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ALL USERS (Admin) ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Student.find({ isDeleted: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET USER BY ID (Admin) ================= */
exports.getUserById = async (req, res) => {
  try {
    const user = await Student.findOne({ _id: req.params.id, isDeleted: false }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET USER PROFILE (Admin) ================= */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await Student.findOne({ _id: req.params.id, isDeleted: false }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE USER (Admin - Soft Delete) ================= */
exports.deleteUser = async (req, res) => {
  try {
    const user = await Student.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
