const SECRET_PIN = "030426";

const canvas = document.querySelector("#sparkleCanvas");
const ctx = canvas?.getContext("2d");
let sparkles = [];

function protectLetterPage() {
  const isLetterPage = document.body.classList.contains("letter-page");
  const isUnlocked = localStorage.getItem("anniversaryUnlocked") === "yes";

  if (isLetterPage && !isUnlocked) {
    window.location.href = "index.html";
  }
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * scale);
  canvas.height = Math.floor(window.innerHeight * scale);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const amount = Math.max(28, Math.floor(window.innerWidth / 26));
  sparkles = Array.from({ length: amount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 2.8 + 1,
    speed: Math.random() * 0.55 + 0.2,
    alpha: Math.random() * 0.55 + 0.22,
    drift: Math.random() * 0.5 - 0.25
  }));
}

function drawSparkles() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  sparkles.forEach((dot) => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(146, 60, 91, ${dot.alpha})`;
    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    ctx.fill();

    dot.y -= dot.speed;
    dot.x += dot.drift;

    if (dot.y < -10) {
      dot.y = window.innerHeight + 10;
      dot.x = Math.random() * window.innerWidth;
    }
  });

  requestAnimationFrame(drawSparkles);
}

function setupPinForm() {
  const form = document.querySelector("#pinForm");
  const input = document.querySelector("#pinInput");
  const error = document.querySelector("#errorText");
  const card = document.querySelector(".lock-card");

  if (!form || !input || !error || !card) return;

  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 6);
    error.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (input.value === SECRET_PIN) {
      localStorage.setItem("anniversaryUnlocked", "yes");
      card.style.transition = "opacity 450ms ease, transform 450ms ease";
      card.style.opacity = "0";
      card.style.transform = "translateY(-12px) scale(0.98)";
      setTimeout(() => {
        window.location.href = "carta.html";
      }, 420);
      return;
    }

    error.textContent = "Casi, amor. Piensa en nuestra fecha especial.";
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
    input.select();
  });
}

function setupLoveButton() {
  const button = document.querySelector("#loveButton");
  const message = document.querySelector("#loveMessage");

  if (!button || !message) return;

  const messages = [
    "Te amo por lo que eres y por lo que siento cuando estoy contigo.",
    "Gracias por este primer mes tan bonito. Ojalá vengan muchísimos más.",
    "Eres mi pensamiento favorito en medio de cualquier día.",
    "Lo nuestro apenas empieza, y ya significa muchísimo para mí."
  ];

  button.addEventListener("click", () => {
    message.textContent = messages[Math.floor(Math.random() * messages.length)];
    createHeart(button);
  });
}

function setupHeartGame() {
  const start = document.querySelector("#gameStart");
  const game = document.querySelector("#heartGame");
  const hearts = [...document.querySelectorAll(".hidden-heart")];
  const counter = document.querySelector("#heartCounter");
  const message = document.querySelector("#foundMessage");
  const finalPanel = document.querySelector("#loveRainPanel");
  const unlockFinalLetter = document.querySelector("#unlockFinalLetter");
  const finalLetter = document.querySelector("#finalLetter");

  if (!start || !game || !hearts.length || !counter || !message || !finalPanel) return;

  const rainPhrases = [
    "Te amo",
    "Te quiero",
    "Mi amor",
    "Mi vida",
    "Eres mi todo",
    "Me encantas",
    "Siempre tú",
    "Mi corazón"
  ];
  let found = 0;
  let rainTimer;

  start.addEventListener("click", () => {
    document.body.classList.add("game-ready");
    start.classList.add("is-hidden");
    setTimeout(() => start.remove(), 700);
  });

  hearts.forEach((heart, index) => {
    heart.setAttribute("aria-label", `Corazón escondido ${index + 1}`);
    heart.addEventListener("click", () => {
      if (heart.classList.contains("is-found")) return;

      found += 1;
      heart.classList.add("is-found");
      counter.textContent = `${found} / ${hearts.length}`;
      message.textContent = heart.dataset.message;
      createHeart(heart);

      if (found === hearts.length) {
        finalPanel.classList.add("is-visible");
        message.textContent = "Los encontraste todos. Esta sorpresa es para ti.";
        document.body.classList.add("love-rain-active");
        rainTimer = startLoveRain(rainPhrases, rainTimer);
        finalPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });

  unlockFinalLetter?.addEventListener("click", () => {
    finalLetter?.classList.add("is-visible");
    unlockFinalLetter.textContent = "Carta desbloqueada";
    unlockFinalLetter.disabled = true;
    createHeart(unlockFinalLetter);
    finalLetter?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

function setupPlaylist() {
  const cover = document.querySelector("#songCover");
  const title = document.querySelector("#songTitle");
  const artist = document.querySelector("#songArtist");
  const story = document.querySelector("#songStory");
  const list = document.querySelector("#songList");
  const prev = document.querySelector("#prevSong");
  const next = document.querySelector("#nextSong");
  const play = document.querySelector("#playSong");
  const progress = document.querySelector("#progressBar");
  const progressTrack = document.querySelector("#progressTrack");
  const currentTime = document.querySelector("#currentTime");
  const durationTime = document.querySelector("#durationTime");
  const audio = document.querySelector("#audioPlayer");
  const player = document.querySelector(".music-player");

  if (!cover || !title || !artist || !story || !list || !prev || !next || !play || !progress || !progressTrack || !currentTime || !durationTime || !audio || !player) return;

  const playlistSongs = window.PLAYLIST_SONGS || [];
  if (!playlistSongs.length) return;

  let current = 0;

  function renderList() {
    list.innerHTML = "";
    playlistSongs.forEach((song, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = index === current ? "song-item is-active" : "song-item";
      button.innerHTML = `<span>${index + 1}</span><strong>${song.title}</strong><small>${song.artist}</small>`;
      button.addEventListener("click", () => {
        current = index;
        loadSong(true);
      });
      list.appendChild(button);
    });
  }

  function renderStory(song) {
    story.innerHTML = "";
    story.appendChild(createStoryBlock(
      "Por que elegi esta cancion",
      song.why || "Esta cancion me recuerda a ti y a lo bonito que siento contigo.",
      song.whyImage
    ));
    story.appendChild(createStoryBlock(
      "Que significa",
      song.meaning || "Representa una parte especial de lo que quiero compartir contigo.",
      song.meaningImage
    ));
  }

  function createStoryBlock(heading, text, image) {
    const block = document.createElement("section");
    const title = document.createElement("h4");
    const paragraph = document.createElement("p");

    block.className = "story-block";
    title.textContent = heading;
    paragraph.textContent = text;
    block.append(title, paragraph);

    if (image) {
      const img = document.createElement("img");
      img.className = "story-image";
      img.src = image;
      img.alt = heading;
      block.appendChild(img);
    }

    return block;
  }

  function loadSong(autoplay = false) {
    const song = playlistSongs[current];
    cover.src = song.cover;
    title.textContent = song.title;
    artist.textContent = song.artist;
    audio.src = song.audio;
    progress.style.width = "0%";
    currentTime.textContent = "0:00";
    durationTime.textContent = "0:00";
    renderStory(song);
    renderList();

    if (autoplay) {
      audio.play().catch(() => {
        player.classList.remove("is-playing");
        play.textContent = "▶";
      });
    }
  }

  function updatePlayState() {
    const isPlaying = !audio.paused;
    play.textContent = isPlaying ? "Ⅱ" : "▶";
    player.classList.toggle("is-playing", isPlaying);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${rest}`;
  }

  prev.addEventListener("click", () => {
    current = (current - 1 + playlistSongs.length) % playlistSongs.length;
    loadSong(true);
  });

  next.addEventListener("click", () => {
    current = (current + 1) % playlistSongs.length;
    loadSong(true);
  });

  play.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  progressTrack.addEventListener("click", (event) => {
    if (!Number.isFinite(audio.duration)) return;
    const rect = progressTrack.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.duration * ratio));
  });

  audio.addEventListener("play", updatePlayState);
  audio.addEventListener("pause", updatePlayState);
  audio.addEventListener("loadedmetadata", () => {
    durationTime.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    const ratio = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.style.width = `${ratio}%`;
    currentTime.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener("ended", () => {
    current = (current + 1) % playlistSongs.length;
    loadSong(true);
  });

  loadSong();
  updatePlayState();
}

function startLoveRain(phrases, timer) {
  clearInterval(timer);
  for (let index = 0; index < 24; index += 1) {
    setTimeout(() => createRainDrop(phrases), index * 90);
  }
  return setInterval(() => createRainDrop(phrases), 230);
}

function createRainDrop(phrases) {
  const drop = document.createElement("span");
  const isPhrase = Math.random() > 0.46;
  drop.className = isPhrase ? "love-drop is-phrase" : "love-drop";
  drop.textContent = isPhrase ? phrases[Math.floor(Math.random() * phrases.length)] : "♥";
  drop.style.left = `${Math.random() * 100}%`;
  drop.style.animationDuration = `${4.4 + Math.random() * 3.4}s`;
  drop.style.fontSize = `${16 + Math.random() * 22}px`;
  drop.style.setProperty("--drift", `${Math.random() * 90 - 45}px`);
  document.body.appendChild(drop);
  setTimeout(() => drop.remove(), 8200);
}

function createHeart(source) {
  const rect = source.getBoundingClientRect();
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = "♥";
  heart.style.left = `${rect.left + rect.width / 2 - 10}px`;
  heart.style.top = `${rect.top + 4}px`;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1600);
}

window.addEventListener("resize", resizeCanvas);
protectLetterPage();
resizeCanvas();
drawSparkles();
setupPinForm();
setupLoveButton();
setupHeartGame();
setupPlaylist();
