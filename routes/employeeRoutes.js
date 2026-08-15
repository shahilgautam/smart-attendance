const express=require("express");
const router=express.Router();

const authenticate=require("../middleware/authMiddleware");
const employeeController=require("../controllers/employeeController");

router.get("/",authenticate,employeeController.getEmployees);
router.get("/list", authenticate, employeeController.employeeList);
router.get("/:id/profile",authenticate,employeeController.getEmployeeProfile);
router.post("/",authenticate,employeeController.addEmployee);
router.delete("/:id", authenticate, employeeController.deleteEmployee);
router.put("/:id", authenticate, employeeController.updateEmployee);
module.exports=router;