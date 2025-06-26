const MapPage = {
  async render() {
    return `
      <section id="map-page">
        <h2>Peta Lokasi</h2>
        <div id="map" style="height: 500px; border-radius: 12px;"></div>
      </section>
    `;
  },

  async afterRender() {
    const L = await import('leaflet');

    // Pastikan elemen #map sudah ada di DOM
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Element #map tidak ditemukan di DOM.');
      return;
    }

    const map = L.map('map').setView([-6.2, 106.8], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const baseLayers = {
      OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      TopoMap: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'),
    };

    L.control.layers(baseLayers).addTo(map);
  },
};

export default MapPage;
