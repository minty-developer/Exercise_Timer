// 상태 변수
let timer = null;
let isRunning = false;
let isWorkTime = true;
let isPause = false;
let isUnLimit = 0;
let isStart = false;
let startSoundOn = true;
let readySoundOn = true;

// 휴식 절반 체크용
let halfAlertPlayed = false;

let currentTime = 0;

// 🔥 세트 관련
let totalSets = 3;
let currentSet = 1;

// 설정값
let workTime = 30;
let restTime = 10;

// 요소
const minuteEl = document.getElementById("minute");
const secondEl = document.getElementById("second");
const conditionEl = document.getElementById("condition");

// 🔊 알림음
function PlaySound() {
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    audio.play();
}

// 표시
function UpdateDisplay() {
    let min = Math.floor(currentTime / 60);
    let sec = currentTime % 60;

    minuteEl.textContent = String(min).padStart(2, '0');
    secondEl.textContent = String(sec).padStart(2, '0');
}

function LoadSettings() {
    const workMin = parseInt(document.getElementById("workMin").value) || 0;
    const workSec = parseInt(document.getElementById("workSec").value) || 0;
    const restMin = parseInt(document.getElementById("restMin").value) || 0;
    const restSec = parseInt(document.getElementById("restSec").value) || 0;
    console.log(document.getElementById("UnLimitRoop").checked);
    document.getElementById("UnLimitRoop").checked ? isUnLimit = 1 : isUnLimit = 0;

    totalSets = parseInt(document.getElementById("sets").value) || 1;

    // 🔥 추가
    startSoundOn = document.getElementById("startSound").value == "1";
    readySoundOn = document.getElementById("readySound").value == "1";

    workTime = workMin * 60 + workSec;
    restTime = restMin * 60 + restSec;
}

function StartTimer() {
    Init();
    if (isRunning) return;

    isStart = true;

    // 처음 시작일 때만 설정 불러오기
    if (currentTime === 0) {
        LoadSettings();
        currentTime = isWorkTime ? workTime : restTime;
    }

    isRunning = true;

    if (startSoundOn) PlaySound();

    timer = setInterval(() => {
        currentTime--;

        if (!isWorkTime && readySoundOn) {
            if (!halfAlertPlayed && currentTime === Math.floor(restTime / 2)) {
                PlaySound();
                halfAlertPlayed = true;
            }
        }

        if (currentTime <= 0) {

            halfAlertPlayed = false;

            if (isWorkTime) {
                isWorkTime = false;
                currentTime = restTime;
            } else {
                if(!isUnLimit) {
                    currentSet++;
                }

                if (currentSet > totalSets) {
                    clearInterval(timer);
                    isRunning = false;
                    conditionEl.textContent = "운동 완료!";
                    isWorkTime = true;
                    isPause = false;
                    isStart = false;
                    currentSet = 0;
                    if (startSoundOn) PlaySound();
                    Init();
                    return;
                }

                isWorkTime = true;
                currentTime = workTime;
            }

            if (startSoundOn) PlaySound();
        }
        
        if(isUnLimit) {
            conditionEl.textContent =
            (isWorkTime ? "운동 시간" : "휴식 시간")
        } else {
            conditionEl.textContent =
                (isWorkTime ? "운동 시간" : "휴식 시간") +
                ` (${currentSet}/${totalSets})`;
        }

        UpdateDisplay();

    }, 1000);
}


// 토글 정지
function StopTimer() {
    const stopBtn = document.getElementById("stop");

    if (isStart) {
        if (isRunning) {
            clearInterval(timer);
            Init();
            isRunning = false;
            isPause = true;
            conditionEl.textContent = "일시정지";
            stopBtn.textContent = "재개";
        } else {
            isRunning = true;
            isPause = false;
            StartTimer();
            stopBtn.textContent = "정지";
        }
    }
}

// 초기화
function ResetTimer() {
    clearInterval(timer);
    isRunning = false;
    isPause = false;
    isWorkTime = true;
    isStart = false;
    currentTime = 0;

    currentSet = 1;

    const stopBtn = document.getElementById("stop");

    stopBtn.textContent = "정지";

    Init();
    ScreenInit();
}