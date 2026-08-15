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
                console.log("Image loaded:", img.width, img.height, emp.photo);

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
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user"
            },
            audio: false
        });

        video.srcObject = stream;

        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });

        console.log(
            "Video Size:",
            video.videoWidth,
            video.videoHeight
        );

        console.log("✅ Camera started successfully");

    } catch (error) {
        console.error(error);
    }
}

// ===============================
// MARK ATTENDANCE
// ===============================

async function markAttendance(employeeId) {

    if (
        markedEmployees.has(employeeId) ||
        processingEmployees.has(employeeId)
    ) {

        return;

    }


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

            markedEmployees.add(
                employeeId
            );


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

        console.error(
            "Attendance error:",
            error
        );

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


        // 1. Load models

        await loadModels();


        // 2. Load employee face descriptors

        labeledFaceDescriptors =
            await loadLabeledImages();


        if (

            labeledFaceDescriptors
                .length === 0

        ) {

            console.warn(

                "⚠️ No employee face descriptors loaded"

            );

            return;

        }


        // 3. Create FaceMatcher

        faceMatcher =
            new faceapi.FaceMatcher(

                labeledFaceDescriptors,

                0.5

            );


        console.log(

            "✅ Face matcher created"

        );


        // 4. Start camera

        await startCamera();


        // 5. Start recognition only now

        startRecognition();


    }

    catch (error) {

        console.error(

            "❌ Initialization error:",

            error

        );

    }

}


init();