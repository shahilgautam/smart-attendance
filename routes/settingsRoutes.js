const express = require("express");

const router = express.Router();

const authenticate =
    require("../middleware/authMiddleware");

const {

    getSettings,

    updateSettings

} = require("../controllers/settingsController");


// GET settings
router.get(

    "/",

    authenticate,

    getSettings

);


// UPDATE settings
router.put(

    "/",

    authenticate,

    updateSettings

);


module.exports = router;