const audio = document.getElementById('audio');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const playBtn = document.getElementById('playBtn');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volume = document.getElementById('volume');
const fileUpload = document.getElementById('fileUpload');

let songs = [];
let favorites = [];
let recent = [];
let songIndex = 0;

// Load initial songs (static + server)
const initialSongs = [
  { title: "Bekhayali - Kabir Singh", artist: "Car Songs Collection", src: "Songs/Bekhayali - Kabir Singh 320 Kbps.mp3" },
  { title: "Dil Ko Karaar Aaya", artist: "Car Songs Collection", src: "Songs/Dil Ko Karaar Aaya Yasser Desai 320 Kbps.mp3" },
  { title: "Falak Tak - Tashan", artist: "Car Songs Collection", src: "Songs/Falak Tak - Tashan 320 Kbps.mp3" },
  { title: "Kaise Hua - Kabir Singh", artist: "Car Songs Collection", src: "Songs/Kaise Hua - Kabir Singh 320 Kbps.mp3" },
  { title: "Main Rang Sharbaton Ka", artist: "Car Songs Collection", src: "Songs/Main Rang Sharbaton Ka - Phata Poster Nikhla Hero 320 Kbps.mp3" }
];

songs.push(...initialSongs);
loadSong(songs[songIndex]);
displayAvailableSongs(songs);
navigateTo('queue');

// Fetch server songs (optional)
fetch('/api/songs')
  .then(res => res.json())
  .then(serverSongs => {
    songs.push(...serverSongs);
    displayAvailableSongs(songs);
  })
  .catch(err => console.error('Error loading songs:', err));

// Load a song
function loadSong(song) {
  title.textContent = song.title;
  artist.textContent = song.artist;
  audio.src = song.src;
  logRecent(song);
}

// Play/Pause
function togglePlay() {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = '⏸️';
  } else {
    audio.pause();
    playBtn.textContent = '▶️';
  }
}

// Next/Prev
function prevSong() {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songs[songIndex]);
  audio.play();
  playBtn.textContent = '⏸️';
}

function nextSong() {
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songs[songIndex]);
  audio.play();
  playBtn.textContent = '⏸️';
}

// Time & Progress
audio.addEventListener('timeupdate', () => {
  const { duration, currentTime } = audio;
  const percent = (currentTime / duration) * 100;
  progress.style.width = `${percent}%`;
  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
});

function setProgress(e) {
  const width = e.currentTarget.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
}

function formatTime(time) {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Volume
volume.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});

// Upload local files
fileUpload.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    const newSong = {
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Upload',
      src: url
    };
    songs.push(newSong);
  });
  displayAvailableSongs(songs);
});

// Display Songs in List
function displayAvailableSongs(songArray) {
  const songList = document.getElementById('songList');
  songList.innerHTML = '';

  songArray.forEach((song, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${song.title} - ${song.artist}
      <span class="fav-btn">⭐</span>
    `;

    // Click to play song
    li.addEventListener('click', () => {
      songIndex = songs.findIndex(s => s.src === song.src);
      loadSong(song);
      audio.play();
      playBtn.textContent = '⏸️';
    });

    // Favorite button
    li.querySelector('.fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(song);
    });

    songList.appendChild(li);
  });
}

// Favorites
function toggleFavorite(song) {
  const index = favorites.findIndex(f => f.src === song.src);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(song);
  }
  displayFavorites();
}

function displayFavorites() {
  const list = document.getElementById('favoritesList');
  list.innerHTML = '';
  favorites.forEach(song => {
    const li = document.createElement('li');
    li.textContent = `${song.title} - ${song.artist}`;
    li.addEventListener('click', () => {
      songIndex = songs.findIndex(s => s.src === song.src);
      loadSong(song);
      audio.play();
      playBtn.textContent = '⏸️';
    });
    list.appendChild(li);
  });
}

// Recent Songs
function logRecent(song) {
  if (!recent.find(s => s.src === song.src)) {
    recent.unshift(song);
    if (recent.length > 10) recent.pop();
    displayRecent();
  }
}

function displayRecent() {
  const list = document.getElementById('recentList');
  list.innerHTML = '';
  recent.forEach(song => {
    const li = document.createElement('li');
    li.textContent = `${song.title} - ${song.artist}`;
    li.addEventListener('click', () => {
      songIndex = songs.findIndex(s => s.src === song.src);
      loadSong(song);
      audio.play();
      playBtn.textContent = '⏸️';
    });
    list.appendChild(li);
  });
}

// Navigation
function navigateTo(section) {
  const sections = ['queue', 'songs', 'upload', 'favorites', 'recent'];
  sections.forEach(s => {
    document.getElementById(`${s}Section`).style.display = (s === section) ? 'block' : 'none';
    document.getElementById(`nav-${s}`).classList.toggle('active', s === section);
  });

  if (section === 'favorites') displayFavorites();
  if (section === 'recent') displayRecent();
}
