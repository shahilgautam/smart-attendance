const video = document.getElementById("video");

let faceMatcher = null;
let labeledFaceDescriptors = [];
let employees = [];
let markedEmployees = new Set();
let processingEmployees = new Set();

let employeeMap = new Map();

let recognitionBusy = false;
let lastRecognitionTime = 0;

const RECOGNITION_INTERVAL = 150;

let recognitionStarted = false;


// ===============================
// LOAD MODELS
// ===============================

async function loadModels() {

    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");

    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

    console.log("✅ Models Loaded");

}


// ===============================
// LOAD EMPLOYEE FACE DATA
// ===============================

async function loadLabeledImages() {

    const response =
        await fetch("/api/recognition/employees");

    const data = await response.json();
    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Please log in to use attendance.');
    }

    if (!data.success) {

        throw new Error(
            data.message || "Failed to load employees"
        );

    }

    employees = data.employees || [];
    employeeMap.clear();

employees.forEach(emp => {

    employeeMap.set(
        emp.employee_code,
        emp
    );

});

    const descriptors = [];

    for (const emp of employees) {

        console.log(
            "Loading face:",
            emp.name
        );

        try {

            if (!emp.photo) {

                console.warn(
                    "No photo found for:",
                    emp.name
                );

                continue;

            }

            const img =
                await faceapi.fetchImage(emp.photo);

            const detection = await faceapi

                .detectSingleFace(
                    img,
                    new faceapi.TinyFaceDetectorOptions()
                )

                .withFaceLandmarks()

                .withFaceDescriptor();


            if (!detection) {

                console.warn(
                    "No face found in:",
                    emp.name
                );

                continue;

            }


            descriptors.push(

                new faceapi.LabeledFaceDescriptors(

                    `${emp.employee_code}|${emp.name}`,

                    [
                        detection.descriptor
                    ]

                )

            );

        }

        catch (error) {

            console.error(
                "Error loading:",
                emp.name
            );

            console.error(error);

        }

    }

    return descriptors;

}


// ===============================
// START CAMERA
// ===============================

async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                },

                audio: false

            });

        video.srcObject = stream;

        await video.play();

        console.log("✅ Camera started successfully");

    }

    catch (error) {
        console.error("Camera error:", error);
        const status = document.getElementById("attendanceStatus");
        status.className = "status error";
        status.textContent = error.message;
        throw error;
    }

}

// ===============================
// MARK ATTENDANCE
// ===============================

async function markAttendance(employeeId) {

    if (markedEmployees.has(employeeId) || processingEmployees.has(employeeId)) return;


    // Lock immediately
    processingEmployees.add(employeeId);


    try {

        const response =
            await fetch(
                "/api/attendance/mark",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    credentials: "include",

                    body: JSON.stringify({

                        employee_id:
                            employeeId

                    })

                }

            );


        const data =
            await response.json();

        // One attendance request per employee per page load. This prevents a
        // continuously visible face from repeatedly toggling check-in/out.
        markedEmployees.add(employeeId);

        const status =
            document.getElementById(
                "attendanceStatus"
            );


        const time =
            document.getElementById(
                "attendanceTime"
            );


        time.textContent =
            new Date().toLocaleTimeString();


        if (data.success) {

            markedEmployees.add(employeeId);


            if (
                data.action === "check_in"
            ) {

                status.className =
                    "status success";

                status.textContent =
                    data.status === "Late"

                        ? "⚠️ LATE CHECK-IN"

                        : "✅ CHECK-IN SUCCESSFUL";

            }

            else if (
                data.action === "check_out"
            ) {

                status.className =
                    "status checkout";

                status.textContent =
                    "✅ CHECK-OUT SUCCESSFUL";

            }

            else {

                status.className =
                    "status success";

                status.textContent =
                    "✅ " + data.message;

            }

        }

        else {

            status.className =
                "status error";

            status.textContent =
                data.message;

        }

    }

    catch (error) {

        console.error("Attendance error:", error);
        const status = document.getElementById("attendanceStatus");
        status.className = "status error";
        status.textContent = error.message || "Attendance request failed.";

    }

    finally {

        processingEmployees.delete(
            employeeId
        );

    }

}


// ===============================
// START FACE RECOGNITION
// ===============================

function startRecognition() {

    if (
        recognitionStarted
    ) {

        return;

    }


    recognitionStarted =
        true;


    const canvas =
        faceapi.createCanvasFromMedia(
            video
        );


    document
        .getElementById(
            "camera-container"
        )
        .append(canvas);


    const displaySize = {

        width:
            video.videoWidth,

        height:
            video.videoHeight

    };


    faceapi.matchDimensions(
        canvas,
        displaySize
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    async function recognizeFaces() {


        // Prevent overlapping recognition cycles

        if (
            recognitionBusy
        ) {

            requestAnimationFrame(
                recognizeFaces
            );

            return;

        }


        const now =
            performance.now();


        if (

            now -
            lastRecognitionTime
            <
            RECOGNITION_INTERVAL

        ) {

            requestAnimationFrame(
                recognizeFaces
            );

            return;

        }


        lastRecognitionTime =
            now;


        recognitionBusy =
            true;


        try {


            if (!faceMatcher) return;
            const detections =
                await faceapi

                    .detectAllFaces(

                        video,

                        new faceapi
                            .TinyFaceDetectorOptions({

                                inputSize: 320,

                                scoreThreshold: 0.5

                            })

                    )

                    .withFaceLandmarks()

                    .withFaceDescriptors();


            const resized =
                faceapi.resizeResults(

                    detections,

                    displaySize

                );


            ctx.clearRect(

                0,

                0,

                canvas.width,

                canvas.height

            );


            for (

                let index = 0;

                index < resized.length;

                index++

            ) {


                const detection =
                    resized[index];


                const result =
                    faceMatcher.findBestMatch(

                        detection.descriptor

                    );


                const box =
                    detection.detection.box;


                const label =
                    result.label;


                const drawBox =
                    new faceapi.draw.DrawBox(

                        box,

                        {

                            label:
                                label

                        }

                    );


                drawBox.draw(
                    canvas
                );


                if (

                    label ===
                    "unknown"

                ) {

                    continue;

                }


                const parts =
                    label.split(
                        "|"
                    );


                const employeeCode =
                    parts[0];


                const found =
                    employeeMap.get(
                        employeeCode
                    );


                if (
                    !found
                ) {

                    continue;

                }


                // Update UI

                document
                    .getElementById(
                        "empPhoto"
                    )
                    .src =
                    found.photo;


                document
                    .getElementById(
                        "empName"
                    )
                    .textContent =
                    found.name;


                document
                    .getElementById(
                        "empCode"
                    )
                    .textContent =
                    found.employee_code;


                document
                    .getElementById(
                        "empDept"
                    )
                    .textContent =
                    found.department ||
                    "N/A";


                document
                    .getElementById(
                        "empDesignation"
                    )
                    .textContent =
                    found.designation ||
                    "N/A";


                // Mark attendance

                markAttendance(
                    found.id
                );


            }


        }

        catch (error) {

            console.error(
                "Recognition error:",
                error
            );

        }

        finally {

            recognitionBusy =
                false;

        }


        requestAnimationFrame(
            recognizeFaces
        );

    }


    recognizeFaces();

}

// ===============================
// INITIALIZE EVERYTHING
// ===============================

async function init() {

    try {


        const status = document.getElementById("attendanceStatus");
        status.textContent = "Loading local face-recognition models…";

        // Start camera first: the preview should still work if a local AI model
        // is missing or no employee has registered a face yet.
        await startCamera();
        status.textContent = "Camera ready. Loading local recognition models…";

        // Models are served by Express from public/models; no network is needed.
        await loadModels();
        status.textContent = "Camera ready. Loading registered employee faces…";
        labeledFaceDescriptors = await loadLabeledImages();

        if (labeledFaceDescriptors.length === 0) {
            status.className = "status waiting";
            status.textContent = "Camera is working. No usable registered faces found. Register an employee face first.";
            return;
        }

        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);
        status.textContent = "Recognition active. Look at the camera.";
        startRecognition();


    }

    catch (error) {
        console.error('Recognition initialization error:', error);
        const status = document.getElementById('attendanceStatus');
        status.className = 'status error';
        status.textContent = error.message || 'Could not initialize face recognition. Camera preview may still be available.';
    }

}


init();