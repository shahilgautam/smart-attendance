let stream = null;

export async function startCamera(videoId) {

    const video = document.getElementById(videoId);

    stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    });

    video.srcObject = stream;

    await video.play();

    console.log("Video Width :", video.videoWidth);
    console.log("Video Height:", video.videoHeight);
    console.log("Ready State :", video.readyState);

    video.style.background = "red";
    video.style.border = "5px solid green";
}

export function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}