const http = require("http");
const crypto = require("crypto");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não configurada.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Geral',
      likes INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON inválido"));
      }
    });

    req.on("error", reject);
  });
}

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  // Verificar backend + base de dados
  if (req.method === "GET" && req.url === "/api/health") {
    try {
      await pool.query("SELECT 1");

      sendJson(res, 200, {
        app: "Wawera",
        status: "online",
        database: "online",
        message: "Backend da Wawera está funcionando!"
      });
    } catch {
      sendJson(res, 503, {
        app: "Wawera",
        status: "online",
        database: "offline",
        message: "Backend online, mas a base de dados está indisponível."
      });
    }

    return;
  }

  // Criar conta
  if (req.method === "POST" && req.url === "/api/register") {
    try {
      const { name, email, password } = await readBody(req);

      if (!name || !email || !password) {
        sendJson(res, 400, {
          success: false,
          message: "Nome, email e palavra-passe são obrigatórios."
        });
        return;
      }

      const trimmedName = String(name).trim();
      const normalizedEmail = String(email).trim().toLowerCase();
      const plainPassword = String(password);

      if (trimmedName.length < 2) {
        sendJson(res, 400, {
          success: false,
          message: "O nome deve ter pelo menos 2 caracteres."
        });
        return;
      }

      if (plainPassword.length < 6) {
        sendJson(res, 400, {
          success: false,
          message: "A palavra-passe deve ter pelo menos 6 caracteres."
        });
        return;
      }

      const id = crypto.randomUUID();
      const passwordHash = hashPassword(plainPassword);

      try {
        await pool.query(
          `INSERT INTO users (id, name, email, password)
           VALUES ($1, $2, $3, $4)`,
          [
            id,
            trimmedName,
            normalizedEmail,
            passwordHash
          ]
        );
      } catch (error) {
        if (error && error.code === "23505") {
          sendJson(res, 409, {
            success: false,
            message: "Este email já está registado."
          });
          return;
        }

        throw error;
      }

      sendJson(res, 201, {
        success: true,
        message: "Conta criada com sucesso.",
        user: {
          id,
          name: trimmedName,
          email: normalizedEmail
        }
      });

      return;

    } catch (error) {
      console.error("Erro no registo:", error);

      sendJson(res, 500, {
        success: false,
        message: "Não foi possível criar a conta."
      });

      return;
    }
  }

  // Login
  if (req.method === "POST" && req.url === "/api/login") {
    try {
      const { email, password } = await readBody(req);

      const normalizedEmail =
        String(email || "").trim().toLowerCase();

      const hashedPassword =
        hashPassword(String(password || ""));

      const result = await pool.query(
        `SELECT id, name, email
         FROM users
         WHERE email = $1
           AND password = $2
         LIMIT 1`,
        [
          normalizedEmail,
          hashedPassword
        ]
      );

      if (result.rowCount === 0) {
        sendJson(res, 401, {
          success: false,
          message: "Email ou palavra-passe incorretos."
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
        message: "Login efetuado com sucesso.",
        user: result.rows[0]
      });

      return;

    } catch (error) {
      console.error("Erro no login:", error);

      sendJson(res, 500, {
        success: false,
        message: "Erro ao processar o login."
      });

      return;
    }
  }

  sendJson(res, 404, {
    success: false,
    message: "Rota não encontrada."
  });
});

async function start() {
  try {
    await initDatabase();

    server.listen(PORT, () => {
      console.log(
        `Wawera backend running on port ${PORT}`
      );
    });

  } catch (error) {
    console.error(
      "Erro ao iniciar a base de dados:",
      error
    );

    process.exit(1);
  }
}

start();
