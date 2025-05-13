let stream = null;
 
export const initCamera = async (video, canvas, captureButton, photoInput) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('Camera API not supported');
    return;
  }
 
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play().catch((error) => {
      if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
        console.error('Camera access denied or not found:', error);
      } else if (error.name === 'AbortError') {
        // Ignore play() request interrupted error
        console.warn('Video play() request was interrupted:', error);
      } else {
        console.error('Failed to play video:', error);
      }
    });
  } catch (err) {
    console.error('Failed to access camera:', err);
  }
 
  captureButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      photoInput.files = dataTransfer.files;
    }, 'image/jpeg');
    stopCamera();
  });
};
 
export const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
};