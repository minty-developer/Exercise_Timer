function Load() {
    const loading = document.getElementById("loading");
    const loadper = document.getElementById("load_per");


    console.log("Load 실행 됨");
    loading.style.display = "block";
    let progress = 0;
    let t = 0;
    let a;
    const interval = setInterval(() => {
        progress += 1;
        t += 0.009;
        a = 1 - t;
        loading.style.backgroundColor = `rgba(255, 255, 255, ${a})`;
        loadper.innerText = `로딩 중... ${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            loading.style.display = "none";
            console.log("Load 성공!-----------------------");
        }
    }, 50);

}

window.onload = function() {
    Load();
}