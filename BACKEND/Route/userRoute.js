const express = require("express");
const router = express.Router();

//insert model
const User = require("../Model/userModel");
//insert controller
const userController = require("./Controllers/userControllers");

router.get("/",userController.getAllUsers);
router.post("/",userController.addUsers);
router.get("/:id",userController.getById);
router.put("/:id",userController.updateUser);
router.delete("/:id",userController.deleteUser);

//export
module.exports = router;