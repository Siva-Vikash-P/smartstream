const videoURL = document.getElementById("videoURL");
const playButton = document.getElementById("playButton");
const videoPlayer = document.getElementById("videoPlayer");
const videoMessage = document.getElementById("videoMessage");
const errorMessage = document.getElementById("errorMessage");

const qualitySelect = document.getElementById("qualitySelect");
const qualityStatus = document.getElementById("qualityStatus");

let hls = null;

// Reset quality selector
function resetQuality() {
    qualitySelect.innerHTML = `
        <option value="-1">Auto</option>
    `;

    qualitySelect.disabled = true;
    qualityStatus.textContent = "Quality: Not available";
}

// Show available HLS qualities
function setupQualitySelector() {

    qualitySelect.innerHTML = `
        <option value="-1">Auto</option>
    `;

    if (!hls || !hls.levels.length) {
        resetQuality();
        return;
    }

    const levels = hls.levels;

    levels.forEach((level, index) => {

        const option = document.createElement("option");

        option.value = index;

        const height = level.height || "Unknown";
        const bitrate = level.bitrate
            ? Math.round(level.bitrate / 1000) + " kbps"
            : "";

        option.textContent = bitrate
            ? `${height}p (${bitrate})`
            : `${height}p`;

        qualitySelect.appendChild(option);
    });

    qualitySelect.disabled = false;
    qualitySelect.value = "-1";

    qualityStatus.textContent =
        "Quality: Auto (Adaptive Streaming)";
}

// Quality selection
qualitySelect.addEventListener("change", function () {

    if (!hls) return;

    const selectedQuality = Number(qualitySelect.value);

    hls.currentLevel = selectedQuality;

    if (selectedQuality === -1) {

        qualityStatus.textContent =
            "Quality: Auto (Adaptive Streaming)";

    } else {

        const level = hls.levels[selectedQuality];

        qualityStatus.textContent =
            `Quality: ${level.height}p (Manual)`;
    }
});

// Monitor actual switched quality
function updateCurrentQuality() {

    if (!hls) return;

    const level = hls.currentLevel;

    if (level >= 0 && qualitySelect.value === "-1") {

        const height = hls.levels[level].height;

        qualityStatus.textContent =
            `Quality: ${height}p (Auto)`;
    }
}

// Play video
playButton.addEventListener("click", function () {

    const url = videoURL.value.trim();

    errorMessage.textContent = "";

    if (!url) {
        errorMessage.textContent =
            "Please paste a video URL.";
        return;
    }

    let parsedURL;

    try {
        parsedURL = new URL(url);

        if (
            parsedURL.protocol !== "http:" &&
            parsedURL.protocol !== "https:"
        ) {
            throw new Error("Invalid protocol");
        }

    } catch {
        errorMessage.textContent =
            "Please enter a valid video URL.";
        return;
    }

    // Stop previous stream
    if (hls) {
        hls.destroy();
        hls = null;
    }

    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.load();

    resetQuality();

    videoMessage.style.display = "none";

    const isHLS =
        parsedURL.pathname.toLowerCase().endsWith(".m3u8");

    // HLS adaptive streaming
    if (isHLS) {

        if (window.Hls && Hls.isSupported()) {

            hls = new Hls({
                enableWorker: true,
                capLevelToPlayerSize: true,
                startLevel: -1
            });

            hls.loadSource(url);
            hls.attachMedia(videoPlayer);

            hls.on(Hls.Events.MANIFEST_PARSED, function () {

                setupQualitySelector();

                videoPlayer.play().catch(() => {
                    errorMessage.textContent =
                        "Press Play to start streaming.";
                });

            });

            hls.on(Hls.Events.LEVEL_SWITCHED, function () {
                updateCurrentQuality();
            });

            hls.on(Hls.Events.ERROR, function (event, data) {

                if (data.fatal) {

                    errorMessage.textContent =
                        "Streaming error. Check the HLS URL and CORS access.";

                    qualityStatus.textContent =
                        "Quality: Stream error";
                }

            });

        } else if (
            videoPlayer.canPlayType("application/vnd.apple.mpegurl")
        ) {

            videoPlayer.src = url;

            qualityStatus.textContent =
                "Quality: Native HLS (Auto)";

            videoPlayer.play().catch(() => {
                errorMessage.textContent =
                    "Press Play to start streaming.";
            });

        } else {

            errorMessage.textContent =
                "HLS is not supported by this browser.";
        }

    } else {

        // Normal MP4 playback
        videoPlayer.src = url;

        qualityStatus.textContent =
            "Quality: Original video quality";

        videoPlayer.load();

        videoPlayer.play().catch(() => {
            errorMessage.textContent =
                "Unable to play video. Check the URL.";
        });

    }

});

// Playback events
videoPlayer.addEventListener("playing", function () {

    errorMessage.textContent = "";
    videoMessage.style.display = "none";

});

videoPlayer.addEventListener("error", function () {

    errorMessage.textContent =
        "Video could not be loaded. Check URL, format or CORS access.";

    videoMessage.style.display = "flex";

});