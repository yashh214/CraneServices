const router = require("express").Router();
const userCtrl = require("../controller/UserController");
const auth = require("../middleware/auth");

// User Authentication
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.get("/count", userCtrl.countUsers);

// User List & Search
router.get("/getalluser", userCtrl.getUsers);
router.get("/searchuser", userCtrl.searchUser);

// User Update
router.put("/update/:id", auth, userCtrl.updateUser);

// Admin Routes (Protected)
router.get("/allusers", auth, userCtrl.getAllUsers);
router.get("/users/:id", auth, userCtrl.getUserById);
router.get("/users/:id/profile", auth, userCtrl.getUserProfile);
router.delete("/user/:id", auth, userCtrl.deleteUser);

module.exports = router;
