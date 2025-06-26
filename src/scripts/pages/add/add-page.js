import AddPresenter from './add-presenter';

const AddPage = {
  async render() {
    return `
      <section class="add-page container">
        <h2 class="title">Tambah Cerita Baru</h2>
        <form id="addForm" class="add-form">
          <label for="description">Deskripsi Cerita (Wajib):</label>
          <textarea id="description" name="description" placeholder="Tulis deskripsi ceritamu di sini..." required></textarea>

          <label for="imageInput">Foto Cerita (Wajib, maks 1MB):</label>
          <div class="camera-buttons">
            <button type="button" id="closeCameraBtn" class="btn danger">❌ Tutup Kamera</button>
            <button type="button" id="startCameraBtn" class="btn warning">📷 Ambil Foto</button>
            <label for="imageInput" class="btn upload">📤 Unggah File</label>
            <input type="file" id="imageInput" name="imageInput" accept="image/*" hidden />
          </div>

          <video id="cameraPreview" autoplay playsinline style="display: none; width: 100%; border-radius: 10px; margin-top: 10px;"></video>
          <canvas id="canvasPreview" style="display: none;"></canvas>
          <img id="photoPreview" alt="Preview" style="display: none; width: 100%; border-radius: 10px; margin-top: 10px;" />

          <!-- Hapus for pada label lokasi karena tidak ada input dengan id 'map' -->
          <label>Lokasi Cerita (Opsional):</label>
          <div id="map" style="height: 300px; margin-top: 10px; border-radius: 8px;"></div>

          <input type="hidden" id="lat" name="lat" />
          <input type="hidden" id="lon" name="lon" />

          <button type="submit" class="btn submit-btn">📤 Unggah Cerita</button>
        </form>
        <p id="statusMessage" class="status-message"></p>
      </section>
    `;
  },

  async afterRender() {
    AddPresenter.init({
      form: document.getElementById('addForm'),
      mapId: 'map',
      latInput: document.getElementById('lat'),
      lonInput: document.getElementById('lon'),
      fileInput: document.getElementById('imageInput'),
      descriptionInput: document.getElementById('description'),
      statusElement: document.getElementById('statusMessage'),
    });

    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('canvasPreview');
    const photoPreview = document.getElementById('photoPreview');
    const startCameraBtn = document.getElementById('startCameraBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');

    let stream = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = 'block';
        photoPreview.style.display = 'none';
      } catch (err) {
        console.error('Tidak bisa mengakses kamera:', err);
      }
    }

    function stopCamera() {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        video.style.display = 'none';
      }
    }

    function takePhoto() {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL('image/jpeg');
      photoPreview.src = imageDataUrl;
      photoPreview.style.display = 'block';

      stopCamera();
    }

    startCameraBtn.addEventListener('click', () => {
      if (!video.srcObject) {
        startCamera().then(() => {
          startCameraBtn.textContent = '📸 Ambil';
        });
      } else {
        takePhoto();
        startCameraBtn.textContent = '📷 Ambil Foto';
      }
    });

    closeCameraBtn.addEventListener('click', () => {
      stopCamera();
      startCameraBtn.textContent = '📷 Ambil Foto';
    });
  },
};

export default AddPage;
