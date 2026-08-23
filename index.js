const MIN_LOADING_TIME = 1200;

const defaultSettings = {
    workMin: 1,
    workSec: 0,
    restMin: 0,
    restSec: 30,
    sets: 5,
    UnLimit: 1,
    startSound: 1,
    readySound: 1,
    readySec: 3,
    start_readySec: 0,
    evertime_startSound: 0,
    evertime_start_readySec: 0,
};

function initializeSettings() {
    const settings = defaultSettings;

    Object.entries(settings).forEach(([key, value]) => {
        if (localStorage.getItem(key) === null) {
            localStorage.setItem(key, String(value));
        }
    });
}

async function startApplication() {
    const loadper = document.getElementById("load_per");
    const detail = document.getElementById("loading_detail");
    const progressBar = document.getElementById("loading_progress_bar");
    const progress = document.querySelector(".loading_progress");
    const startedAt = Date.now();
    let progressValue = 12;
    const progressTimer = setInterval(() => {
        progressValue = Math.min(progressValue + 4, 88);
        progressBar.style.width = `${progressValue}%`;
        progress.setAttribute("aria-valuenow", progressValue);
    }, 220);

    try {
        loadper.textContent = "운동 설정을 준비하는 중...";
        progressBar.style.width = `${progressValue}%`;
        progress.setAttribute("aria-valuenow", progressValue);
        loadper.textContent = "설정을 적용하는 중...";
        detail.textContent = "이 기기에 저장된 운동 설정을 확인하고 있어요.";
        initializeSettings();
        progressValue = 100;
    } catch (error) {
        initializeSettings();
    } finally {
        clearInterval(progressTimer);
        progressBar.style.width = `${progressValue}%`;
        progress.setAttribute("aria-valuenow", progressValue);

        const remainingTime = Math.max(0, MIN_LOADING_TIME - (Date.now() - startedAt));
        setTimeout(() => window.location.replace("./timer.html"), remainingTime);
    }
}

startApplication();