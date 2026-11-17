// ======================================
// Smart Attendance System - Settings
// settings.js
// ======================================

// -------------------------
// Elements
// -------------------------

const adminName = document.getElementById("adminName");

const logoutBtn = document.getElementById("logoutBtn");

const changePasswordBtn = document.getElementById("changePasswordBtn");

const saveAttendanceBtn = document.getElementById("saveAttendanceBtn");

const startCameraBtn = document.getElementById("startCameraBtn");

const cameraPreview = document.getElementById("cameraPreview");

const cameraStatus = document.getElementById("cameraStatus");

const exportAttendanceBtn = document.getElementById("exportAttendanceBtn");

const exportEmployeesBtn = document.getElementById("exportEmployeesBtn");

// -------------------------
// Page Load
// -------------------------

window.addEventListener("DOMContentLoaded", async () => {

    try {

        const response = await fetch("/api/dashboard/stats", {
            credentials: "same-origin"
        });

        const result = await response.json();

        if (!result.success) {
            window.location.href = "/login";
            return;
        }

        if (result.user) {

            adminName.textContent =
                "Welcome, " + result.user.username;

            const fullName =
                document.getElementById("adminFullName");

            if (fullName) {
                fullName.value = result.user.username;
            }

        }

    } catch (err) {

        console.error(err);
        window.location.href = "/login";

    }

});
// -------------------------
// Logout
// -------------------------

logoutBtn.addEventListener("click", async () => {

    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin"
    });

    window.location.href = "/login";

});

// -------------------------
// Camera Test
// -------------------------

startCameraBtn.addEventListener("click", async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({

            video: true

        });

        cameraPreview.srcObject = stream;

        cameraStatus.innerHTML =
            "✅ Camera Working";

    }

    catch (err) {

        console.error(err);

        cameraStatus.innerHTML =
            "❌ Camera Not Available";

    }

});

// -------------------------
// Change Password
// -------------------------

// -------------------------
// Change Password
// -------------------------

changePasswordBtn.addEventListener("click", async () => {

    const currentPassword =
        document.getElementById("currentPassword").value.trim();

    const newPassword =
        document.getElementById("newPassword").value.trim();

    const confirmPassword =
        document.getElementById("confirmPassword").value.trim();


    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        alert("Please fill all fields.");

        return;

    }


    if (newPassword !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }


    try {

        const response = await fetch(
            "/api/auth/change-password",
            {

                method: "POST",

                credentials: "same-origin",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    currentPassword:
                        currentPassword,

                    newPassword:
                        newPassword

                })

            }

        );


        const result =
            await response.json();


        console.log(
            "Change Password Response:",
            result
        );


        if (response.status === 401) {

            alert(
                "Session expired. Please login again."
            );

            window.location.href =
                "/login";

            return;

        }


        if (!result.success) {

            alert(result.message);

            return;

        }


        alert(
            "Password updated successfully."
        );


        // Clear fields
        document
            .getElementById("currentPassword")
            .value = "";

        document
            .getElementById("newPassword")
            .value = "";

        document
            .getElementById("confirmPassword")
            .value = "";

    }

    catch (error) {

        console.error(
            "Change password error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

});
// -------------------------
// Attendance Settings
// -------------------------

// ============================
// LOAD ATTENDANCE SETTINGS
// ============================

async function loadAttendanceSettings() {

    try {

        const response =
            await fetch(

                "/api/settings",

                {

                    credentials:
                        "same-origin"

                }

            );


        const result =
            await response.json();


        if (

            response.status === 401

        ) {

            window.location.href =
                "/login";

            return;

        }


        if (

            result.success

        ) {

            document.getElementById(

                "officeStart"

            ).value =
                result.data.office_start;


            document.getElementById(

                "lateAfter"

            ).value =
                result.data.late_after;


            document.getElementById(

                "officeEnd"

            ).value =
                result.data.office_end;

        }

    }

    catch (error) {

        console.error(error);

    }

}


// ============================
// SAVE ATTENDANCE SETTINGS
// ============================

saveAttendanceBtn.addEventListener(

    "click",

    async () => {


        const officeStart =

            document.getElementById(

                "officeStart"

            ).value;


        const lateAfter =

            document.getElementById(

                "lateAfter"

            ).value;


        const officeEnd =

            document.getElementById(

                "officeEnd"

            ).value;


        try {


            const response =

                await fetch(

                    "/api/settings",

                    {

                        method: "PUT",

                        credentials:
                            "same-origin",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:

                            JSON.stringify({

                                officeStart,

                                lateAfter,

                                officeEnd

                            })

                    }

                );


            const result =

                await response.json();


            if (

                response.status === 401

            ) {

                window.location.href =
                    "/login";

                return;

            }


            if (

                result.success

            ) {

                alert(

                    "Attendance settings saved successfully."

                );

            }

            else {

                alert(

                    result.message

                );

            }

        }

        catch (error) {

            console.error(error);


            alert(

                "Unable to connect to server."

            );

        }

    }

);