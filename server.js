const http = require("http");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const port = process.env.PORT || 3000;
const root = __dirname;
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        family: 4,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
    : null;
const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
};

function sendJson(response, data, statusCode = 200) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(data));
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.on("data", (chunk) => {
            body += chunk;
            if (body.length > 10000) reject(new Error("요청이 너무 큽니다."));
        });
        request.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                reject(new Error("JSON 형식이 올바르지 않습니다."));
            }
        });
        request.on("error", reject);
    });
}

async function ensureDatabase() {
    if (!pool) throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
    await pool.query(`
        CREATE TABLE IF NOT EXISTS meals (
            id SERIAL PRIMARY KEY,
            meal_type VARCHAR(20) NOT NULL,
            meal_name VARCHAR(100) NOT NULL,
            calories INTEGER NOT NULL DEFAULT 0 CHECK (calories >= 0),
            eaten_on DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

async function handleMealApi(request, response, pathname) {
    await ensureDatabase();

    if (request.method === "GET" && pathname === "/api/meals") {
        const result = await pool.query(
            "SELECT id, meal_type, meal_name, calories, created_at FROM meals WHERE eaten_on = CURRENT_DATE ORDER BY created_at DESC"
        );
        sendJson(response, result.rows);
        return;
    }

    if (request.method === "POST" && pathname === "/api/meals") {
        const body = await readJson(request);
        const mealType = String(body.mealType || "").trim();
        const mealName = String(body.mealName || "").trim();
        const calories = Number(body.calories) || 0;

        if (!mealType || !mealName || calories < 0 || calories > 99999) {
            sendJson(response, { error: "식사 종류, 메뉴, 칼로리를 확인해주세요." }, 400);
            return;
        }

        const result = await pool.query(
            "INSERT INTO meals (meal_type, meal_name, calories) VALUES ($1, $2, $3) RETURNING id, meal_type, meal_name, calories, created_at",
            [mealType, mealName, calories]
        );
        sendJson(response, result.rows[0], 201);
        return;
    }

    if (request.method === "DELETE" && /^\/api\/meals\/\d+$/.test(pathname)) {
        const result = await pool.query("DELETE FROM meals WHERE id = $1 RETURNING id", [pathname.split("/").pop()]);
        sendJson(response, { deleted: result.rowCount > 0 });
        return;
    }

    sendJson(response, { error: "API를 찾을 수 없습니다." }, 404);
}

function serveFile(response, requestedPath) {
    const filePath = path.join(root, requestedPath === "/" ? "index.html" : requestedPath);

    if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
        response.writeHead(404);
        response.end("Not found");
        return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
        "Content-Type": contentTypes[extension] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(request.url.split("?")[0]);

    if (pathname.startsWith("/api/meals")) {
        handleMealApi(request, response, pathname).catch((error) => {
            console.error(error);
            sendJson(response, { error: "식단 DB에 연결할 수 없습니다." }, 503);
        });
        return;
    }

    serveFile(response, pathname);
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Exercise Timer server is running on port ${port}`);
});