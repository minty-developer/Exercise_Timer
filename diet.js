const mealForm = document.getElementById("meal_form");
const mealList = document.getElementById("meal_list");
const mealStatus = document.getElementById("meal_status");
const totalCalories = document.getElementById("total_calories");

function showStatus(message, isError = false) {
    mealStatus.textContent = message;
    mealStatus.classList.toggle("error", isError);
}

function renderMeals(meals) {
    mealList.replaceChildren();
    const calories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    totalCalories.textContent = `${calories.toLocaleString()} kcal`;

    if (meals.length === 0) {
        mealList.innerHTML = '<p class="empty_meals">아직 기록된 식단이 없습니다.</p>';
        return;
    }

    meals.forEach((meal) => {
        const item = document.createElement("article");
        item.className = "meal_item";
        const content = document.createElement("div");
        const type = document.createElement("span");
        const name = document.createElement("h3");
        type.className = "meal_type";
        type.textContent = meal.meal_type;
        name.textContent = meal.meal_name;
        content.append(type, name);

        const meta = document.createElement("div");
        const caloriesLabel = document.createElement("strong");
        const deleteButton = document.createElement("button");
        meta.className = "meal_meta";
        caloriesLabel.textContent = `${meal.calories || 0} kcal`;
        deleteButton.className = "delete_meal";
        deleteButton.dataset.id = meal.id;
        deleteButton.setAttribute("aria-label", `${meal.meal_name} 삭제`);
        deleteButton.textContent = "삭제";
        meta.append(caloriesLabel, deleteButton);
        item.append(content, meta);
        mealList.appendChild(item);
    });
}

async function loadMeals() {
    try {
        const response = await fetch("/api/meals");
        if (!response.ok) throw new Error("식단을 불러오지 못했습니다.");
        renderMeals(await response.json());
    } catch (error) {
        mealList.innerHTML = '<p class="empty_meals">DB 연결을 확인해주세요.</p>';
        showStatus(error.message, true);
    }
}

mealForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
        mealType: document.getElementById("meal_type").value,
        mealName: document.getElementById("meal_name").value.trim(),
        calories: Number(document.getElementById("calories").value) || 0,
    };

    try {
        const response = await fetch("/api/meals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error((await response.json()).error || "저장에 실패했습니다.");
        mealForm.reset();
        showStatus("식단을 저장했습니다.");
        await loadMeals();
    } catch (error) {
        showStatus(error.message, true);
    }
});

mealList.addEventListener("click", async (event) => {
    const button = event.target.closest(".delete_meal");
    if (!button) return;
    const response = await fetch(`/api/meals/${button.dataset.id}`, { method: "DELETE" });
    if (response.ok) await loadMeals();
});

loadMeals();