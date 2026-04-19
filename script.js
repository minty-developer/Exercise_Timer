// =========================
// 🔥 상태 변수
// =========================
let timer = null;
let isRunning = false;
let isWorkTime = true;
let isPause = false;
let isUnLimit = 0;
let isStart = false;
let startSoundOn = true;
let readySoundOn = true;

let halfAlertPlayed = false;

let currentTime = 0;

let totalSets = 3;
let currentSet = 1;

let workTime = 30;
let restTime = 10;

let readySec = 3;
let startReadySec = 3;

const ctx = new AudioContext();

// =========================
// 🔊 알림음
// =========================
function PlaySound() {
    const osc = ctx.createOscillator();
    osc.type = "sine";       // 부드러운 삐 소리
    osc.frequency.value = 1000; // 1000Hz = 전형적인 삐 소리

    osc.connect(ctx.destination);
    osc.start();

    // 2초 뒤 종료 (길이 조절 가능)
    setTimeout(() => {
    osc.stop();
    }, 200);
}

// =========================
// 🔊 알림음
// =========================
function PlaySoundBee() {
    const osc = ctx.createOscillator();
    osc.type = "sine";       // 부드러운 삐 소리
    osc.frequency.value = 1000; // 1000Hz = 전형적인 삐 소리

    osc.connect(ctx.destination);
    osc.start();

    // 2초 뒤 종료 (길이 조절 가능)
    setTimeout(() => {
    osc.stop();
    }, 1000);
}

// =========================
// 변경 감지
// =========================
function IsChanged() {
    const keys = [
        "workMin", "workSec", "restMin", "restSec",
        "sets", "startSound", "readySound", "UnLimit", "readySec"
    ];

    for (let key of keys) {
        if (key === "sets" && document.getElementById("sets").disabled) continue;

        const el = document.getElementById(key === "UnLimit" ? "UnLimitRoop" : key);
        if (!el) continue;

        const current = (el.type === "checkbox")
            ? (el.checked ? "1" : "0")
            : el.value;

        const saved = localStorage.getItem(key);

        if (saved === null) return true;
        if (current != saved) return true;
    }
    return false;
}

// =========================
// 로드 함수
// =========================
async function Load() {
    const loading = document.getElementById("loading");
    const loadper = document.getElementById("load_per");

    loading.style.display = "block";

    let progress = 0;
    let t = 0;

    const interval = setInterval(() => {
        progress += 1;
        t += 0.009;

        loading.style.backgroundColor = `rgba(255,255,255,${1 - t})`;
        loadper.innerText = `로딩 중... ${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            loading.style.display = "none";
        }
    }, 50);
}

// =========================
// 표시
// =========================
function UpdateDisplay() {
    let min = Math.floor(currentTime / 60);
    let sec = currentTime % 60;

    document.getElementById("minute").textContent = String(min).padStart(2, '0');
    document.getElementById("second").textContent = String(sec).padStart(2, '0');
}

// =========================
// 설정 불러오기
// =========================
function LoadSettings() {
    const workMin = parseInt(document.getElementById("workMin").value) || 0;
    const workSec = parseInt(document.getElementById("workSec").value) || 0;
    const restMin = parseInt(document.getElementById("restMin").value) || 0;
    const restSec = parseInt(document.getElementById("restSec").value) || 0;

    isUnLimit = document.getElementById("UnLimitRoop").checked ? 1 : 0;
    totalSets = parseInt(document.getElementById("sets").value) || 1;

    startSoundOn = document.getElementById("startSound").value == "1";
    readySoundOn = document.getElementById("readySound").value == "1";

    // 🔥 추가
    readySec = parseInt(document.getElementById("readySec").value) || 0;
    startReadySec = parseInt(document.getElementById("start_readySec").value) || 0;

    workTime = workMin * 60 + workSec;
    restTime = restMin * 60 + restSec;
}

// =========================
// 설정 닫기
// =========================
function CloseSettings() {
    const Menu = document.getElementById("settingsMenu");
    const close = document.getElementById("close");

    if (IsChanged()) {
        const confirmClose = confirm("저장되지 않은 변경사항이 감지되었습니다. 계속 하시겠습니까?");
        if (!confirmClose) return;

        Init(); // 되돌리기
    }

    Menu.classList.remove("open");
    close.style.display = "none";
}

// =========================
// 타이머 작동
// =========================

function runTimer() {
    isRunning = true;
    isStart = true;

    timer = setInterval(() => {
        currentTime--;

        // 🔥 휴식 종료 n초 전 알림
        if (!isWorkTime && readySoundOn) {
            if (currentTime === readySec) {
                PlaySound();
            }
        }

        if (currentTime <= 0) {
            halfAlertPlayed = false;

            if (isWorkTime) {
                isWorkTime = false;
                currentTime = restTime;
            } else {
                if (!isUnLimit) currentSet++;

                if (currentSet > totalSets) {
                    clearInterval(timer);
                    isRunning = false;

                    document.getElementById("condition").textContent = "운동 완료!";

                    isWorkTime = true;
                    isPause = false;
                    isStart = false;
                    currentSet = 1;

                    if (startSoundOn) PlaySound();
                    Init();
                    return;
                }

                isWorkTime = true;
                currentTime = workTime;
            }

            if (startSoundOn) PlaySound();
        }

        const conditionEl = document.getElementById("condition");

        conditionEl.textContent = isUnLimit
            ? (isWorkTime ? "운동 시간" : "휴식 시간")
            : `${isWorkTime ? "운동 시간" : "휴식 시간"} (${currentSet}/${totalSets})`;

        UpdateDisplay();

    }, 1000);
}

// =========================
// 타이머 시작
// =========================
function StartTimer() {
    if (isRunning) return;

    LoadSettings();

    if (currentTime === 0) {
        isWorkTime = true;
        currentSet = 1;
        currentTime = workTime; // 🔥 핵심
    }

    // 시작 전 대기
    if (startReadySec > 0 && currentTime === workTime) {
        let countdown = startReadySec;

        document.getElementById("condition").textContent = "운동 준비";

        const readyInterval = setInterval(() => {
            document.getElementById("minute").textContent = "00";
            document.getElementById("second").textContent = String(countdown).padStart(2, '0');

            if (startSoundOn && countdown === 0) {
                PlaySoundBee();
            } else if (startSoundOn) {
                PlaySound();
            }
            countdown--;

            if (countdown < 0) {
                clearInterval(readyInterval);
                runTimer();
            }
        }, 1000);

        return;
    }

    runTimer();
}

// =========================
// 정지
// =========================
function StopTimer() {
    const stopBtn = document.getElementById("stop");

    if (isStart) {
        if (isRunning) {
            clearInterval(timer);
            isRunning = false;
            isPause = true;

            document.getElementById("condition").textContent = "일시정지";
            stopBtn.textContent = "재개";
        } else {
            isPause = false;
            StartTimer();
            stopBtn.textContent = "정지";
        }
    }
}

// =========================
// 초기화
// =========================
function ResetTimer() {
    clearInterval(timer);
    isRunning = false;
    isPause = false;
    isWorkTime = true;
    isStart = false;
    currentTime = 0;
    currentSet = 1;

    document.getElementById("stop").textContent = "정지";

    Init();
    ScreenInit();
}

// =========================
// UI
// =========================
function OpenSettings() {
    if (!isRunning) {
        document.getElementById("settingsMenu").classList.add("open");
        document.getElementById("close").style.display = "block";
    } else {
        alert("현재 타이머가 진행 중입니다!");
    }
}

function SaveSettings() {
    const unlimit = document.getElementById("UnLimitRoop").checked;

    localStorage.setItem("workMin", document.getElementById("workMin").value);
    localStorage.setItem("workSec", document.getElementById("workSec").value);
    localStorage.setItem("restMin", document.getElementById("restMin").value);
    localStorage.setItem("restSec", document.getElementById("restSec").value);
    localStorage.setItem("sets", document.getElementById("sets").value);

    // 🔥 boolean → 숫자 저장
    localStorage.setItem("UnLimit", unlimit ? "1" : "0");

    localStorage.setItem("startSound", document.getElementById("startSound").value);
    localStorage.setItem("readySound", document.getElementById("readySound").value);
    localStorage.setItem("readySec", document.getElementById("readySec").value);
    localStorage.setItem("start_readySec", document.getElementById("start_readySec").value);

    alert("설정이 저장되었습니다.");

    CloseSettings();
    Init();

    if (!isPause) ScreenInit();
}

// =========================
// 초기화
// =========================
function Init() {
    const defaults = {
        workMin: 1,
        workSec: 0,
        restMin: 0,
        restSec: 30,
        sets: 5,
        UnLimit: 1,
        startSound: 1,
        readySound: 1,
        readySec: 3,
    };

    for (let key in defaults) {
        if (localStorage.getItem(key) === null) {
            localStorage.setItem(key, defaults[key]);
        }
    }

    const Unlimit = parseInt(localStorage.getItem("UnLimit"));

    document.getElementById("workMin").value = localStorage.getItem("workMin");
    document.getElementById("workSec").value = localStorage.getItem("workSec");
    document.getElementById("restMin").value = localStorage.getItem("restMin");
    document.getElementById("restSec").value = localStorage.getItem("restSec");
    document.getElementById("sets").value = localStorage.getItem("sets");

    document.getElementById("startSound").value = localStorage.getItem("startSound");
    document.getElementById("readySound").value = localStorage.getItem("readySound");
    document.getElementById("readySec").value = localStorage.getItem("readySec");
    document.getElementById("readySec").value = localStorage.getItem("readySec");
    document.getElementById("start_readySec").value = localStorage.getItem("start_readySec");
    document.getElementById("UnLimitRoop").checked = !!Unlimit;
    document.getElementById("sets").disabled = !!Unlimit;
}

// =========================
// 화면 초기화
// =========================
function ScreenInit() {
    const workMin = parseInt(localStorage.getItem("workMin"));
    const workSec = parseInt(localStorage.getItem("workSec"));

    document.getElementById("condition").innerText = "준비 중...";
    document.getElementById("minute").innerText = String(workMin).padStart(2, '0');
    document.getElementById("second").innerText = String(workSec).padStart(2, '0');
}

// =========================
// 체크박스
// =========================
function AlertULR() {
    const cb = document.getElementById("UnLimitRoop");

    const confirmCheck = confirm("이 항목을 선택 시 타이머가 초기화 됩니다.\n계속 하시겠습니까?");
    if (!confirmCheck) {
        cb.checked = !cb.checked;
        return;
    }

    // 🔥 추가 (핵심)
    localStorage.setItem("UnLimit", cb.checked ? "1" : "0");

    ResetTimer();
}

// =========================
// 시작
// =========================
document.addEventListener("DOMContentLoaded", () => {
    Init();
    ScreenInit();
    Load();

    document.getElementById("settings").addEventListener("click", OpenSettings);
    document.getElementById("close").addEventListener("click", CloseSettings);
    document.getElementById("save_button").addEventListener("click", SaveSettings);

    document.getElementById("start").addEventListener("click", StartTimer);
    document.getElementById("stop").addEventListener("click", StopTimer);
    document.getElementById("reset").addEventListener("click", ResetTimer);

    document.getElementById("UnLimitRoop").addEventListener("click", AlertULR);
});