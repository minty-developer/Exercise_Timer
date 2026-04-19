// =========================
// 🔥 [1] 실행 상태 (Runtime State)
// =========================
// 타이머 동작 상태 관리
let timer = null;          // 메인 타이머
let readyInterval = null;  // 시작 전 카운트다운

let isRunning = false;     // 현재 실행 중 여부
let isPause = false;       // 일시정지 상태
let isStart = false;       // 한 번이라도 시작했는지

let isWorkTime = true;     // 운동 시간인지 여부
let currentTime = 0;       // 현재 남은 시간 (초)

let currentSet = 1;        // 현재 세트 번호

// =========================
// 🔥 [2] 사용자 설정 값 (Config)
// =========================
// localStorage 및 UI에서 불러오는 값들
let isUnLimit = 0;         // 무한 반복 여부 (1: 무한)
let totalSets = 3;         // 총 세트 수

let workTime = 30;         // 운동 시간 (초)
let restTime = 10;         // 휴식 시간 (초)

let readySec = 3;          // 휴식 종료 전 알림 시간
let startReadySec = 3;     // 시작 전 대기 시간

let everyTimeSoundOn = false;  // 매 전환 알림 ON/OFF
let everyTimeReadySec = 0;     // 매 전환 알림 타이밍

let startSoundOn = true;   // 시작 시 알림 ON/OFF
let readySoundOn = true;   // 휴식 종료 알림 ON/OFF

// =========================
// 🔥 [3] 내부 제어 플래그 (Control Flags)
// =========================
// 이벤트 중복 실행 방지용
let readyPlayed = false;   // readySec 알림 중복 방지
let halfAlertPlayed = false; // (현재 미사용 or 확장용)

// =========================
// 🔥 [4] 오디오 관련
// =========================
let ctx = null;  // AudioContext (lazy init)


// 브라우저 정책 대응: 사용자 인터랙션 이후 생성
function getAudioCtx() {
    if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
}

// =========================
// 🔥 [5] 유틸 함수
// =========================

// 숫자 안전 처리 함수
// - NaN 방지
// - 최소/최대 범위 제한
function safeNum(v, min = 0, max = 9999) {
    v = parseInt(v);
    if (isNaN(v)) return min;
    return Math.min(Math.max(v, min), max);
}

// =========================
// 🔊 알림음
// =========================
function PlaySound() {
    const audioCtx = getAudioCtx();
    const osc = audioCtx.createOscillator();

    osc.type = "sine";       // 부드러운 삐 소리
    osc.frequency.value = 1000; // 1000Hz = 전형적인 삐 소리

    osc.connect(audioCtx.destination);
    osc.start();

    // 2초 뒤 종료 (길이 조절 가능)
    setTimeout(() => {
    osc.stop();
    }, 120);
}

// =========================
// 🔊 알림음
// =========================
function PlaySoundBee() {
    const audioCtx = getAudioCtx();
    const osc = audioCtx.createOscillator();

    osc.type = "sine";       // 부드러운 삐 소리
    osc.frequency.value = 1000; // 1000Hz = 전형적인 삐 소리

    osc.connect(audioCtx.destination);
    osc.start();

    // 2초 뒤 종료 (길이 조절 가능)
    setTimeout(() => {
    osc.stop();
    }, 500);
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

        if (saved === null) continue;
        if (String(current) !== String(saved)) return true;
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
        t += 0.007;

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
    const workMin = safeNum(parseInt(document.getElementById("workMin").value));
    const workSec = safeNum(parseInt(document.getElementById("workSec").value, 0, 59));
    const restMin = safeNum(parseInt(document.getElementById("restMin").value));
    const restSec = safeNum(parseInt(document.getElementById("restSec").value, 0, 59));

    isUnLimit = document.getElementById("UnLimitRoop").checked ? 1 : 0;
    totalSets = parseInt(document.getElementById("sets").value) || 1;

    startSoundOn = document.getElementById("startSound").checked;
    readySoundOn = document.getElementById("readySound").checked;

    // 🔥 추가
    readySec = parseInt(document.getElementById("readySec").value) || 0;
    startReadySec = parseInt(document.getElementById("start_readySec").value) || 0;

    everyTimeSoundOn = document.getElementById("evertime_startSound").value == "1";
    everyTimeReadySec = parseInt(document.getElementById("evertime_start_readySec").value) || 0;

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

    if (timer) clearInterval(timer);
    timer = null;

    timer = setInterval(() => {
        currentTime = Math.max(0, currentTime - 1);
        

        // 🔥 매 전환 전 카운트다운 알림
        if (
            everyTimeSoundOn &&
            everyTimeReadySec > 0 &&
            currentTime <= everyTimeReadySec &&
            currentTime > 0 &&
            !( !isWorkTime && currentTime === readySec )
        ) {
            PlaySound();
        }

        // 🔥 휴식 종료 n초 전 알림
        if (!isWorkTime && readySoundOn) {
            if (currentTime === readySec && !readyPlayed) {
                PlaySound();
                readyPlayed = true;
            }
        }

        if (currentTime <= 0) {
            halfAlertPlayed = false;
            readyPlayed = false;

            if (isWorkTime) {
                isWorkTime = false;
                currentTime = restTime;
            } else {
                if (!isUnLimit) currentSet++;

                if (currentSet > totalSets) {
                    clearInterval(timer);
                    timer = null;
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
    if (isRunning || readyInterval) return;

    if (readyInterval !== null) {
        clearInterval(readyInterval);
        readyInterval = null;
    }

    LoadSettings();

    if (!isStart) {
        isWorkTime = true;
        currentSet = 1;
        currentTime = workTime; // 🔥 핵심
    }

    // 시작 전 대기
    if (startReadySec > 0 && !isStart) {
        let countdown = startReadySec;

        document.getElementById("condition").textContent = "운동 준비";

        readyInterval = setInterval(() => {
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

    if (readyInterval) {
        clearInterval(readyInterval);
        readyInterval = null;
    }

    if (isStart) {
        if (isRunning) {
            clearInterval(timer);
            timer = null;
            isRunning = false;
            isPause = true;

            document.getElementById("condition").textContent = "일시정지";
            stopBtn.textContent = "재개";
        } else {
            isPause = false;
            runTimer();
            stopBtn.textContent = "정지";
        }
    }
}

// =========================
// 초기화
// =========================
function ResetTimer() {
    clearInterval(timer);
    timer = null;
    isRunning = false;
    isPause = false;
    isWorkTime = true;
    isStart = false;
    currentTime = 0;
    currentSet = 1;

    if (readyInterval) {
        clearInterval(readyInterval);
        readyInterval = null;
    }

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
    localStorage.setItem("evertime_startSound", document.getElementById("evertime_startSound").value);
    localStorage.setItem("evertime_start_readySec", document.getElementById("evertime_start_readySec").value);

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
        start_readySec: 0,
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
    document.getElementById("start_readySec").value = localStorage.getItem("start_readySec") || 0;
    document.getElementById("UnLimitRoop").checked = !!Unlimit;
    document.getElementById("sets").disabled = !!Unlimit;
    document.getElementById("evertime_startSound").value = localStorage.getItem("evertime_startSound") || "0";
    document.getElementById("evertime_start_readySec").value = localStorage.getItem("evertime_start_readySec") || "0";
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

// =========================
// 화면을 나갈 시
// =========================

document.addEventListener("visibilitychange", () => {
    if (readyInterval) {
        clearInterval(readyInterval);
        readyInterval = null;
    }

    if (document.hidden) {
        if (isRunning) {
            clearInterval(timer);
            timer = null;
            isRunning = false;
            isPause = true;

            document.getElementById("condition").textContent = "자동 일시정지";
        }
    } else {
        if (isPause) {
            document.getElementById("condition").textContent = "일시정지 상태";
        }
    }
});