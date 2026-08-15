import { startCamera } from "./ai/camera.js";
import { initDetector } from "./ai/detector.js";

const employee = document.getElementById("employee");
const captureBtn = document.getElementById("captureBtn");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");
const video = document.getElementById("video");
const preview = document.getElementById("preview");

let capturedImage = null;

// =========================
// Page Load
// =========================

window.addEventListener("DOMContentLoaded", async () => {

    try {

        await startCamera("video");

        await initDetector(
            video,
            document.getElementById("overlay"),
            status,
            saveBtn
        );

        status.textContent = "✅ Camera Started";

        await loadEmployees();

    } catch (err) {

        console.error(err);
        status.textContent = "❌ Camera Failed";

    }

});

// =========================
// Load Employees
// =========================

async function loadEmployees() {

    try {

        const response = await fetch("/api/employees/list", {
    credentials: "same-origin"
});

        const result = await response.json();
        if (!result.success && result.message === "Please login first.") {
    window.location.href = "/login";
    return;
}
        employee.innerHTML = `<option value="">Select Employee</option>`;

        result.data.forEach(emp => {

            employee.innerHTML += `
                <option value="${emp.id}">
                    ${emp.employee_code} - ${emp.name}
                </option>
            `;

        });

    } catch (err) {

        console.error(err);
        status.textContent = "❌ Failed to Load Employees";

    }

}

// =========================
// Capture Photo
// =========================

captureBtn.addEventListener("click", () => {

    if (video.readyState !== 4) {

        alert("Camera not ready.");
        return;

    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // JPEG keeps upload size much smaller
    capturedImage = canvas.toDataURL("image/jpeg", 0.8);

    preview.src = capturedImage;

    saveBtn.disabled = false;

    status.textContent = "📸 Photo Captured";

});

// =========================
// Save Face
// =========================

saveBtn.addEventListener("click", async () => {

    if (!employee.value) {

        alert("Please select an employee.");
        return;

    }

    if (!capturedImage) {

        alert("Please capture a photo first.");
        return;

    }

    try {

        const response = await fetch("/api/faces/upload", {

    method: "POST",
    credentials: "same-origin",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        employeeId: employee.value,
        image: capturedImage
    })

});

        const result = await response.json();
        if (!result.success && result.message === "Please login first.") {
    window.location.href = "/login";
    return;
}
        if (result.success) {

            alert("✅ Face Registered Successfully");

            preview.src = "";

            capturedImage = null;

            saveBtn.disabled = true;

            status.textContent = "✅ Registration Complete";

        } else {

            alert(result.message);

        }

    } catch (err) {

        console.error(err);

        alert("Error: " + err.message);

    }

});