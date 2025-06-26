const createStoryItemTemplate = (story) => `
  <article class="story-item" tabindex="0" aria-labelledby="story-title-${story.id}">
    <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" loading="lazy" class="story-image" />
    <h3 id="story-title-${story.id}" class="story-title">${story.name}</h3>
    <p class="story-description">${story.description}</p>
    <p class="story-date"><small>${new Date(story.createdAt).toLocaleString()}</small></p>
    <div class="story-map" id="map-${story.id}" aria-label="Peta lokasi cerita" style="height: 200px;"></div>
    <button class="save-button" data-id="${story.id}" aria-label="Simpan cerita berjudul ${story.name}">Simpan Cerita</button>
  </article>
`;

export default createStoryItemTemplate;
