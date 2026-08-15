let detector = null;

export async function initDetector(video, canvas, status, saveBtn) {

    const ctx = canvas.getContext("2d");

    detector = new FaceDetection({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
    });

    detector.setOptions({
    model: "short",
    minDetectionConfidence: 0.5
});

    detector.onResults((results) => {

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log(results);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const faces = results.detections || [];

        if (faces.length === 1) {

    status.textContent = "✅ Face Detected";

    saveBtn.disabled = false;

} else if (faces.length > 1) {

            status.textContent = "❌ Multiple Faces Detected";
            saveBtn.disabled = true;

        } else {

            status.textContent = "❌ No Face Detected";
            saveBtn.disabled = true;
        }

    });

    async function detect() {
        

        if (video.readyState >= 2) {
            await detector.send({ image: video });
        }

        requestAnimationFrame(detect);
    }

    detect();
}