const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const faceRoutes = require("./routes/faceRoutes");
const recognitionRoutes = require("./routes/recognitionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const attendanceReportRoutes = require("./routes/attendanceReportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const authenticate = require("./middleware/authMiddleware");


const app = express();


// ============================
// Middleware
// ============================

app.use(express.json({
    limit: "20mb"
}));

app.use(express.urlencoded({
    limit: "20mb",
    extended: true
}));

app.use(cookieParser());


// ============================
// Session
// ============================

app.use(session({

    secret:
        process.env.SESSION_SECRET ||
        "smart_attendance_secret",

    resave: false,

    saveUninitialized: false,

    cookie: {

        httpOnly: true,

        secure: false,

        maxAge:
            24 * 60 * 60 * 1000

    }

}));


// ============================
// Static Files
// ============================

app.use(

    express.static(

        path.join(__dirname, "public")

    )

);


// ============================
// Face API
// ============================

app.use(

    "/face-api",

    express.static(

        path.join(

            __dirname,

            "node_modules",

            "face-api.js",

            "dist"

        )

    )

);


// ============================
// API Routes
// ============================

app.use(

    "/api/auth",

    authRoutes

);

app.use(

    "/api/dashboard",

    dashboardRoutes

);

app.use(

    "/api/employees",

    employeeRoutes

);

app.use(

    "/api/settings",

    settingsRoutes

);

app.use(

    "/api/faces",

    faceRoutes

);

app.use(

    "/api/recognition",

    recognitionRoutes

);

app.use(

    "/api/attendance",

    attendanceRoutes

);

app.use(

    "/api/attendance-report",

    attendanceReportRoutes

);


// ============================
// Test Session
// ============================

app.get(

    "/api/test-session",

    (req, res) => {

        console.log(

            "SESSION:",

            req.session

        );

        res.json({

            success: true,

            session: req.session

        });

    }

);


// ============================
// Pages
// ============================

app.get("/", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "index.html"

        )

    );

});


app.get("/index", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "index.html"

        )

    );

});


app.get("/login", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "login.html"

        )

    );

});


app.get("/dashboard", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "dashboard.html"

        )

    );

});


app.get("/employees", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "employee.html"

        )

    );

});


app.get("/attendance", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "recognize.html"

        )

    );

});


app.get("/face-register", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "face-register.html"

        )

    );

});


app.get("/recognize", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "recognize.html"

        )

    );

});


app.get("/attendance-report", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "attendance-report.html"

        )

    );

});


app.get("/admins", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "admins.html"

        )

    );

});


app.get("/settings", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "settings.html"

        )

    );

});


app.get("/test-faceapi", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "views",

            "test-faceapi.html"

        )

    );

});


app.get("/face-api-test", (req, res) => {

    res.sendFile(

        path.join(

            __dirname,

            "node_modules",

            "face-api.js",

            "dist",

            "face-api.js"

        )

    );

});


app.get(

    "/employee-profile",

    authenticate,

    (req, res) => {

        res.sendFile(

            path.join(

                __dirname,

                "views",

                "employee-profile.html"

            )

        );

    }

);


// ============================
// Export App
// ============================

module.exports = app;