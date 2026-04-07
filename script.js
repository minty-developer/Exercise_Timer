
function IsChanged() {
    console.log("IsChanged 실행 됨");
    const keys = ["workMin", "workSec", "restMin", "restSec", "sets", "startSound", "readySound"];

    for (let key of keys) {
        const el = document.getElementById(key);
        if (!el) continue;

        const current = el.value;
        const saved = localStorage.getItem(key);

        // 저장된 값 없으면 기본값 비교
        if (saved === null) {
            return true;
        }

        if (current != saved) {
            return true;
        }
    }

    return false;
}

function OpenSettings() {
    console.log("OpenSettings 실행 됨");
    if(!isRunning) {
        console.log("Settings 열음");
        const Menu = document.getElementById("settingsMenu");
        const close = document.getElementById("close");
        Menu.classList.add("open");
        close.style.display = "block";
    } else {
        alert("현재 타이머가 진행 중입니다!");
        console.log("Settings열기 실패: 타이머 진행 중");
    }
}

function CloseSettings() {
    console.log("CloseSettings 실행 됨");
    const Menu = document.getElementById("settingsMenu");
    const close = document.getElementById("close");

    // 🔥 변경 감지
    if (IsChanged()) {
        const confirmClose = confirm("저장되지 않은 변경사항이 감지되었습니다. 계속 하시겠습니까?");
        if (!confirmClose) return;
    }

    Menu.classList.remove("open");
    close.style.display = "none";
}

function SaveSettings() {
    console.log("SaveSettings실행 됨");
    const workMin = document.getElementById("workMin").value;
    const workSec = document.getElementById("workSec").value;
    const restMin = document.getElementById("restMin").value;
    const restSec = document.getElementById("restSec").value;
    const sets = document.getElementById("sets").value;
    const unlimit = document.getElementById("UnLimitRoop").checked;

    // 🔥 추가
    const startSound = document.getElementById("startSound").value;
    const readySound = document.getElementById("readySound").value;

    localStorage.setItem("workMin", workMin);
    localStorage.setItem("workSec", workSec);
    localStorage.setItem("restMin", restMin);
    localStorage.setItem("restSec", restSec);
    localStorage.setItem("sets", sets);
    localStorage.setItem("UnLimit", unlimit);

    // 🔥 추가
    localStorage.setItem("startSound", startSound);
    localStorage.setItem("readySound", readySound);

    alert("설정이 저장되었습니다.");

    CloseSettings();

    Init();

    if(!isPause) {
        ScreenInit();
    }
}

function Init() {
    console.log("Init 실행 됨");
    // 기본값
    const defaults = {
        workMin: 1,
        workSec: 0,
        restMin: 0,
        restSec: 30,
        sets: 5,
        Unlimit: 1,
        startSound: 1,
        readySound: 1
    };

    // localStorage에 없으면 기본값 넣기
    for (let key in defaults) {
        if (localStorage.getItem(key) === null) {
            localStorage.setItem(key, defaults[key]);
            console.log(`${key}에 ${defaults[key]}가 넣어 짐`);
        }
    }

    // 값 불러오기 (숫자로 변환)
    const workMin = parseInt(localStorage.getItem("workMin"));
    const workSec = parseInt(localStorage.getItem("workSec"));
    const restMin = parseInt(localStorage.getItem("restMin"));
    const restSec = parseInt(localStorage.getItem("restSec"));
    const sets = parseInt(localStorage.getItem("sets"));
    const Unlimit = parseInt(localStorage.getItem("Unlimit"));
    const startSound = parseInt(localStorage.getItem("startSound"));
    const readySound = parseInt(localStorage.getItem("readySound"));

    document.getElementById("startSound").value = startSound;
    document.getElementById("readySound").value = readySound;

    // input에 적용
    document.getElementById("workMin").value = workMin;
    document.getElementById("workSec").value = workSec;
    document.getElementById("restMin").value = restMin;
    document.getElementById("restSec").value = restSec;
    document.getElementById("sets").value = sets;
    document.getElementById("UnLimitRoop").value = Unlimit;
    console.log("input에 적용 됨");
}

function ScreenInit() {
    // 화면 초기화
    const workMin = parseInt(localStorage.getItem("workMin"));
    const workSec = parseInt(localStorage.getItem("workSec"));
    
    document.getElementById("condition").innerText = "준비 중...";
    document.getElementById("minute").innerText = String(workMin).padStart(2, '0');
    document.getElementById("second").innerText = String(workSec).padStart(2, '0');
    console.log("ScreenInit 실행 됨");
}

Init();
ScreenInit();

function AlertULR() {
    const confirmCheck = confirm("이 항목을 선택 시 타이머가 초기화 됩니다.\n계속 하시겠습니까?");
    if (!confirmCheck) return;
    ResetTimer()
}