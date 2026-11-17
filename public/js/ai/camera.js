let activeStream = null;

export async function startCamera(videoId) {
    const video = document.getElementById(videoId);
    if (!video) throw new Error(`Video element #${videoId} was not found.`);
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API is unavailable. Open this app at http://localhost (not a LAN IP or file://).');
    }
    stopCamera();
    try {
        activeStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        video.srcObject = activeStream;
        await new Promise((resolve, reject) => {
            if (video.readyState >= 1) return resolve();
            video.onloadedmetadata = resolve;
            video.onerror = () => reject(new Error('The camera video stream could not be loaded.'));
        });
        await video.play();
        return activeStream;
    } catch (error) {
        stopCamera();
        const messages = {
            NotAllowedError: 'Camera permission was denied. Allow camera access in your browser site settings.',
            NotFoundError: 'No camera was found. Connect or enable a webcam.',
            NotReadableError: 'The camera is busy or unavailable. Close other apps using the webcam.',
            OverconstrainedError: 'The camera does not support the requested video settings.'
        };
        throw new Error(messages[error.name] || `Unable to start camera: ${error.message}`);
    }
}

export function stopCamera() {
    if (activeStream) activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;
}

window.addEventListener('beforeunload', stopCamera);
