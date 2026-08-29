const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;

const users = [];

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

  // Teste do servidor
  if (req.method === "GET" && req.url === "/api/health") {
    sendJson(res, 200, {
      app: "Wawera",
      status: "online",
      message: "Backend da Wawera está funcionando!"
    });
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

      const normalizedEmail = String(email).trim().toLowerCase();

      if (users.some(user => user.email === normalizedEmail)) {
        sendJson(res, 409, {
          success: false,
          message: "Este email já está registado."
        });
        return;
      }

      const user = {
        id: crypto.randomUUID(),
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashPassword(password)
      };

      users.push(user);

      sendJson(res, 201, {
        success: true,
        message: "Conta criada com sucesso.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });

      return;
    } catch (error) {
      sendJson(res, 400, {
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

      const normalizedEmail = String(email || "").trim().toLowerCase();
      const hashedPassword = hashPassword(String(password || ""));

      const user = users.find(
        item =>
          item.email === normalizedEmail &&
          item.password === hashedPassword
      );

      if (!user) {
        sendJson(res, 401, {
          success: false,
          message: "Email ou palavra-passe incorretos."
        });
        return;
      }

      sendJson(res, 200, {
        success: true,
        message: "Login efetuado com sucesso.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });

      return;
    } catch {
      sendJson(res, 400, {
        success: false,
        message: "Pedido inválido."
      });
      return;
    }
  }

  sendJson(res, 404, {
    success: false,
    message: "Rota não encontrada."
  });
});

server.listen(PORT, () => {
  console.log(`Wawera backend running on port ${PORT}`);
});
