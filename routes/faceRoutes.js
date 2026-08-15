const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const {
    uploadFace
} = require("../controllers/faceController");

router.post(
    "/upload",
    authenticate,
    uploadFace
);

module.exports = router;