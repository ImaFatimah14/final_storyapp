import { postStory } from '../../data/api';
import { isPushSubscribed } from '../../utils/push-notification';
import L from 'leaflet';

const AddPresenter = {
  init({ form, mapId, latInput, lonInput, fileInput, descriptionInput, statusElement }) {
    let lat = null;
    let lon = null;
    let stream = null;
    let capturedFile = null;

    // Elemen kamera
    const startCameraBtn = document.getElementById('startCameraBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const cameraPreview = document.getElementById('cameraPreview');
    const photoPreview = document.getElementById('photoPreview');
    const canvas = document.getElementById('canvasPreview');

    let cameraActive = false;

    // Fungsi untuk mulai kamera
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraPreview.srcObject = stream;
        cameraPreview.style.display = 'block';
        canvas.style.display = 'none';
        photoPreview.style.display = 'none';
        startCameraBtn.textContent = '📸 Ambil Foto';
        cameraActive = true;
      } catch (err) {
        statusElement.textContent = 'Tidak dapat mengakses kamera.';
        statusElement.style.color = 'red';
      }
    };

    // Fungsi untuk ambil foto dari kamera
    const capturePhoto = () => {
      const context = canvas.getContext('2d');
      canvas.width = cameraPreview.videoWidth;
      canvas.height = cameraPreview.videoHeight;
      context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          statusElement.textContent = 'Gagal mengambil foto dari kamera.';
          statusElement.style.color = 'red';
          return;
        }

        capturedFile = new File([blob], 'foto.jpg', { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        photoPreview.src = url;
        photoPreview.style.display = 'block';
        canvas.style.display = 'none';
        cameraPreview.style.display = 'none';

        // Matikan kamera
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          stream = null;
        }

        startCameraBtn.textContent = '📷 Ambil Foto';
        cameraActive = false;
      }, 'image/jpeg');
    };

    // Event tombol "Ambil Foto" (dua tahap: mulai kamera → ambil foto)
    startCameraBtn?.addEventListener('click', () => {
      if (!cameraActive) {
        startCamera();
      } else {
        capturePhoto();
      }
    });

    // Event tombol "Tutup Kamera"
    closeCameraBtn?.addEventListener('click', () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
      cameraPreview.style.display = 'none';
      canvas.style.display = 'none';
      photoPreview.style.display = 'none';
      capturedFile = null;
      startCameraBtn.textContent = '📷 Ambil Foto';
      cameraActive = false;
    });

    // Inisialisasi peta
    const map = L.map(mapId).setView([-6.2, 106.8], 5); // Default view: Jakarta
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    let marker;

    // Ambil lokasi otomatis dari browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          lat = position.coords.latitude;
          lon = position.coords.longitude;

          latInput.value = lat;
          lonInput.value = lon;

          map.setView([lat, lon], 13);
          marker = L.marker([lat, lon]).addTo(map).bindPopup('Lokasimu').openPopup();
        },
        () => {
          statusElement.textContent = 'Tidak bisa mendapatkan lokasi otomatis.';
        }
      );
    }

    // Klik di map untuk ubah lokasi
    map.on('click', (e) => {
      lat = e.latlng.lat;
      lon = e.latlng.lng;

      latInput.value = lat;
      lonInput.value = lon;

      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(map);
      }
    });

    // Submit form
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const file = capturedFile || fileInput.files[0];
      const description = descriptionInput.value.trim();

      // Validasi
      if (!description) {
        statusElement.textContent = 'Deskripsi tidak boleh kosong.';
        statusElement.style.color = 'red';
        return;
      }

      if (!file) {
        statusElement.textContent = 'Gambar wajib diunggah.';
        statusElement.style.color = 'red';
        return;
      }

      if (file.size > 1024 * 1024) {
        statusElement.textContent = 'Ukuran gambar maksimal 1MB.';
        statusElement.style.color = 'red';
        return;
      }

      if (!lat || !lon) {
        statusElement.textContent = 'Pilih lokasi cerita di peta.';
        statusElement.style.color = 'red';
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        statusElement.textContent = 'Token tidak ditemukan. Silakan login ulang.';
        statusElement.style.color = 'red';
        return;
      }

      statusElement.textContent = 'Mengirim cerita...';
      statusElement.style.color = 'inherit';

      const result = await postStory(token, {
        file,
        description,
        lat,
        lon,
      });

      if (result.error) {
        statusElement.textContent = `Gagal mengirim: ${result.message}`;
        statusElement.style.color = 'red';
        // Notifikasi gagal
        if (window.Notification && Notification.permission === 'granted' && await isPushSubscribed()) {
          new Notification('Gagal mengirim cerita!', {
            body: result.message,
            icon: '/icons/icon-192x192.png',
          });
        }
      } else {
        statusElement.textContent = 'Cerita berhasil dikirim!';
        statusElement.style.color = 'green';
        // Notifikasi lokal setelah submit sukses
        if (window.Notification && Notification.permission === 'granted' && await isPushSubscribed()) {
          new Notification('Cerita berhasil ditambahkan!', {
            body: 'Cerita kamu sudah masuk ke daftar cerita.',
            icon: '/icons/icon-192x192.png',
          });
        }
        setTimeout(() => {
          window.location.hash = '#/home';
        }, 1500);
      }
    });
  },
};

export default AddPresenter;
