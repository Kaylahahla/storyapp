import '../components/story-list';

export const renderHomePage = (stories = []) => {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <h1>Welcome to Dicoding Stories</h1>
    <div id="map" style="height: 400px; margin-bottom: 20px;"></div>
  `;

  if (!stories || stories.length === 0) {
    mainContent.innerHTML += '<p>No stories available</p>';
    return;
  }

  const storyList = document.createElement('story-list');
  storyList.stories = stories;
  mainContent.appendChild(storyList);
};
