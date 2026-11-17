let running = false;
let animationId = null;

// Uses the locally hosted face-api.js models. No CDN or MediaPipe download is needed.
export async function initDetector(video, canvas, status, onFace) {
    if (!window.faceapi) throw new Error('Local face-api.js failed to load.');
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    ]);
    const context = canvas.getContext('2d');
    running = true;
    let busy = false;
    const detect = async () => {
        if (!running) return;
        if (!busy && video.readyState >= 2) {
            busy = true;
            try {
                const result = await faceapi.detectAllFaces(
                    video,
                    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
                );
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.clearRect(0, 0, canvas.width, canvas.height);
                if (result.length === 1) {
                    status.textContent = 'Face detected. You can capture the photo.';
                    onFace(true);
                    const box = result[0].box;
                    context.strokeStyle = '#16a34a';
                    context.lineWidth = 3;
                    context.strokeRect(box.x, box.y, box.width, box.height);
                } else {
                    status.textContent = result.length > 1 ? 'Multiple faces detected. Keep only one person in frame.' : 'No face detected. Look directly at the camera.';
                    onFace(false);
                }
            } catch (error) {
                console.error('Face detection error:', error);
                status.textContent = 'Face detection error. Check local AI model files.';
                onFace(false);
            } finally { busy = false; }
        }
        animationId = requestAnimationFrame(detect);
    };
    detect();
    return () => { running = false; if (animationId) cancelAnimationFrame(animationId); };
}
