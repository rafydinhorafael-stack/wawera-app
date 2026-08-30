const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;
const FRONTEND_PATH = path.join(__dirname, "..", "index.html");

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_likes (
      post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (post_id, user_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id BIGSERIAL PRIMARY KEY,
      post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;

      if (body.length > 1000000) {
        req.destroy();
        reject(new Error("Pedido demasiado grande"));
      }
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

function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

const server = http.createServer(async (req, res) => {
  /* =========================
     FRONTEND
     ========================= */

  if (
    req.method === "GET" &&
    (req.url === "/" || req.url === "/index.html")
  ) {
    try {
      const html = fs.readFileSync(FRONTEND_PATH, "utf8");

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });

      res.end(html);
      return;
    } catch (error) {
      console.error("Erro ao carregar frontend:", error);

      sendJson(res, 500, {
        success: false,
        message: "Não foi possível carregar a aplicação."
      });

      return;
    }
  }

  /* =========================
     CORS
     ========================= */

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  /* =========================
     HEALTH
     ========================= */

  if (req.method === "GET" && req.url === "/api/health") {
    try {
      await pool.query("SELECT 1");

      sendJson(res, 200, {
        app: "Wawera",
        status: "online",
        database: "online",
        message: "Backend da Wawera está funcionando!"
      });
    } catch (error) {
      console.error("Erro health:", error);

      sendJson(res, 503, {
        app: "Wawera",
        status: "online",
        database: "offline",
        message:
          "Backend online, mas a base de dados está indisponível."
      });
    }

    return;
  }

  /* =========================
     REGISTAR
     ========================= */

  if (req.method === "POST" && req.url === "/api/register") {
    try {
      const { name, email, password } = await readBody(req);

      if (!name || !email || !password) {
        sendJson(res, 400, {
          success: false,
          message:
            "Nome, email e palavra-passe são obrigatórios."
        });

        return;
      }

      const trimmedName = String(name).trim();
      const normalizedEmail = String(email)
        .trim()
        .toLowerCase();
      const plainPassword = String(password);

      if (trimmedName.length < 2) {
        sendJson(res, 400, {
          success: false,
          message:
            "O nome deve ter pelo menos 2 caracteres."
        });

        return;
      }

      if (plainPassword.length < 6) {
        sendJson(res, 400, {
          success: false,
          message:
            "A palavra-passe deve ter pelo menos 6 caracteres."
        });

        return;
      }

      const id = crypto.randomUUID();
      const passwordHash = hashPassword(plainPassword);

      try {
        await pool.query(
          `
          INSERT INTO users
          (id, name, email, password)
          VALUES ($1, $2, $3, $4)
          `,
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
        message:
          "Não foi possível criar a conta."
      });

      return;
    }
  }

  /* =========================
     LOGIN
     ========================= */

  if (req.method === "POST" && req.url === "/api/login") {
    try {
      const { email, password } = await readBody(req);

      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();

      const hashedPassword = hashPassword(
        String(password || "")
      );

      const result = await pool.query(
        `
        SELECT id, name, email
        FROM users
        WHERE email = $1
        AND password = $2
        LIMIT 1
        `,
        [
          normalizedEmail,
          hashedPassword
        ]
      );

      if (result.rowCount === 0) {
        sendJson(res, 401, {
          success: false,
          message:
            "Email ou palavra-passe incorretos."
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
        message:
          "Erro ao processar o login."
      });

      return;
    }
  }

  /* =========================
     LISTAR PUBLICAÇÕES
     ========================= */

  if (
    req.method === "GET" &&
    req.url.startsWith("/api/posts")
  ) {
    try {
      const requestUrl = new URL(
        req.url,
        `http://${req.headers.host || "localhost"}`
      );

      const viewerId =
        requestUrl.searchParams.get("user_id");

      const result = await pool.query(
        `
        SELECT
          p.id,
          p.user_id,
          p.text,
          p.category,
          p.likes,
          p.created_at,
          u.name AS author_name,

          EXISTS (
            SELECT 1
            FROM post_likes pl
            WHERE pl.post_id = p.id
            AND pl.user_id = $1
          ) AS liked_by_me

        FROM posts p

        JOIN users u
          ON u.id = p.user_id

        ORDER BY p.created_at DESC

        LIMIT 100
        `,
        [
          isUuid(viewerId)
            ? viewerId
            : null
        ]
      );

      const postIds =
        result.rows.map(post => post.id);

      let comments = [];

      if (postIds.length > 0) {
        const commentResult =
          await pool.query(
            `
            SELECT
              c.id,
              c.post_id,
              c.text,
              c.created_at,
              u.name AS author_name

            FROM comments c

            JOIN users u
              ON u.id = c.user_id

            WHERE c.post_id =
              ANY($1::bigint[])

            ORDER BY c.created_at ASC
            `,
            [postIds]
          );

        comments =
          commentResult.rows;
      }

      const commentsByPost =
        new Map();

      for (const comment of comments) {
        if (
          !commentsByPost.has(
            comment.post_id
          )
        ) {
          commentsByPost.set(
            comment.post_id,
            []
          );
        }

        commentsByPost
          .get(comment.post_id)
          .push({
            id: comment.id,
            author_name:
              comment.author_name,
            text: comment.text,
            created_at:
              comment.created_at
          });
      }

      const posts =
        result.rows.map(post => ({
          ...post,

          created_at_display:
            new Date(
              post.created_at
            ).toLocaleString(
              "pt-PT"
            ),

          comments:
            commentsByPost.get(
              post.id
            ) || []
        }));

      sendJson(res, 200, {
        success: true,
        posts
      });

      return;
    } catch (error) {
      console.error(
        "Erro ao carregar publicações:",
        error
      );

      sendJson(res, 500, {
        success: false,
        message:
          "Não foi possível carregar as publicações."
      });

      return;
    }
  }

  /* =========================
     CRIAR PUBLICAÇÃO
     ========================= */

  if (
    req.method === "POST" &&
    req.url === "/api/posts"
  ) {
    try {
      const {
        user_id,
        text,
        category
      } = await readBody(req);

      const cleanText =
        String(text || "").trim();

      const cleanCategory =
        String(
          category || "Geral"
        ).trim() || "Geral";

      if (!isUuid(user_id)) {
        sendJson(res, 401, {
          success: false,
          message:
            "Utilizador não autenticado."
        });

        return;
      }

      if (
        !cleanText ||
        cleanText.length > 1000
      ) {
        sendJson(res, 400, {
          success: false,
          message:
            "A publicação deve ter entre 1 e 1000 caracteres."
        });

        return;
      }

      const userResult =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE id = $1
          `,
          [user_id]
        );

      if (userResult.rowCount === 0) {
        sendJson(res, 401, {
          success: false,
          message:
            "Utilizador não encontrado."
        });

        return;
      }

      const result =
        await pool.query(
          `
          INSERT INTO posts
          (user_id, text, category)

          VALUES
          ($1, $2, $3)

          RETURNING
            id,
            user_id,
            text,
            category,
            likes,
            created_at
          `,
          [
            user_id,
            cleanText,
            cleanCategory
          ]
        );

      sendJson(res, 201, {
        success: true,
        post:
          result.rows[0]
      });

      return;
    } catch (error) {
      console.error(
        "Erro ao criar publicação:",
        error
      );

      sendJson(res, 500, {
        success: false,
        message:
          "Não foi possível publicar."
      });

      return;
    }
  }

  /* =========================
     LIKE / UNLIKE
     ========================= */

  const likeMatch =
    req.url.match(
      /^\/api\/posts\/(\d+)\/like$/
    );

  if (
    req.method === "POST" &&
    likeMatch
  ) {
    try {
      const postId =
        Number(likeMatch[1]);

      const { user_id } =
        await readBody(req);

      if (!isUuid(user_id)) {
        sendJson(res, 401, {
          success: false,
          message:
            "Utilizador não autenticado."
        });

        return;
      }

      const client =
        await pool.connect();

      try {
        await client.query(
          "BEGIN"
        );

        const existing =
          await client.query(
            `
            SELECT 1
            FROM post_likes
            WHERE post_id = $1
            AND user_id = $2
            `,
            [
              postId,
              user_id
            ]
          );

        if (
          existing.rowCount
        ) {
          await client.query(
            `
            DELETE FROM post_likes
            WHERE post_id = $1
            AND user_id = $2
            `,
            [
              postId,
              user_id
            ]
          );

          await client.query(
            `
            UPDATE posts
            SET likes =
              GREATEST(
                likes - 1,
                0
              )

            WHERE id = $1
            `,
            [postId]
          );
        } else {
          await client.query(
            `
            INSERT INTO post_likes
            (post_id, user_id)

            VALUES
            ($1, $2)
            `,
            [
              postId,
              user_id
            ]
          );

          await client.query(
            `
            UPDATE posts
            SET likes =
              likes + 1

            WHERE id = $1
            `,
            [postId]
          );
        }

        const countResult =
          await client.query(
            `
            SELECT likes
            FROM posts
            WHERE id = $1
            `,
            [postId]
          );

        await client.query(
          "COMMIT"
        );

        if (
          countResult.rowCount === 0
        ) {
          sendJson(res, 404, {
            success: false,
            message:
              "Publicação não encontrada."
          });

          return;
        }

        sendJson(res, 200, {
          success: true,
          likes:
            countResult.rows[0].likes
        });
      } catch (error) {
        await client.query(
          "ROLLBACK"
        );

        throw error;
      } finally {
        client.release();
      }

      return;
    } catch (error) {
      console.error(
        "Erro no like:",
        error
      );

      sendJson(res, 500, {
        success: false,
        message:
          "Não foi possível atualizar o gosto."
      });

      return;
    }
  }

  /* =========================
     COMENTÁRIOS
     ========================= */

  const commentsMatch =
    req.url.match(
      /^\/api\/posts\/(\d+)\/comments$/
    );

  if (
    req.method === "POST" &&
    commentsMatch
  ) {
    try {
      const postId =
        Number(
          commentsMatch[1]
        );

      const {
        user_id,
        text
      } = await readBody(req);

      const cleanText =
        String(text || "").trim();

      if (!isUuid(user_id)) {
        sendJson(res, 401, {
          success: false,
          message:
            "Utilizador não autenticado."
        });

        return;
      }

      if (
        !cleanText ||
        cleanText.length > 300
      ) {
        sendJson(res, 400, {
          success: false,
          message:
            "O comentário deve ter entre 1 e 300 caracteres."
        });

        return;
      }

      const result =
        await pool.query(
          `
          INSERT INTO comments
          (post_id, user_id, text)

          SELECT
            $1,
            $2,
            $3

          WHERE EXISTS (
            SELECT 1
            FROM posts
            WHERE id = $1
          )

          RETURNING
            id,
            post_id,
            user_id,
            text,
            created_at
          `,
          [
            postId,
            user_id,
            cleanText
          ]
        );

      if (
        result.rowCount === 0
      ) {
        sendJson(res, 404, {
          success: false,
          message:
            "Publicação não encontrada."
        });

        return;
      }

      sendJson(res, 201, {
        success: true,
        comment:
          result.rows[0]
      });

      return;
    } catch (error) {
      console.error(
        "Erro no comentário:",
        error
      );

      sendJson(res, 500, {
        success: false,
        message:
          "Não foi possível adicionar o comentário."
      });

      return;
    }
  }

  /* =========================
     APAGAR PUBLICAÇÃO
     ========================= */

  const deleteMatch =
    req.url.match(
      /^\/api\/posts\/(\d+)$/
    );

  if (
    req.method === "DELETE" &&
    deleteMatch
  ) {
    try {
      const postId =
        Number(
          deleteMatch[1]
        );

      const { user_id } =
        await readBody(req);

      if (!isUuid(user_id)) {
        sendJson(res, 401, {
          success: false,
          message:
            "Utilizador não autenticado."
        });

        return;
      }

      const result =
        await pool.query(
          `
          DELETE FROM posts

          WHERE id = $1
          AND user_id = $2

          RETURNING id
          `,
          [
            postId,
            user_id
          ]
        );

      if (
        result.rowCount === 0
      ) {
        sendJson(res, 404, {
          success: false,
          message:
            "Publicação não encontrada ou não pertence a ti."
        });

        return;
      }

      sendJson(res, 200, {
        success: true,
        message:
          "Publicação apagada."
      });

      return;
    } catch (error) {
      console.error(
        "Erro ao apagar:",
        error
      );

      sendJson(res, 500, {
        success: false,
        message:
          "Não foi possível apagar a publicação."
      });

      return;
    }
  }

  /* =========================
     ROTA NÃO ENCONTRADA
     ========================= */

  sendJson(res, 404, {
    success: false,
    message:
      "Rota não encontrada."
  });
});

/* =========================
   INICIAR SERVIDOR
   ========================= */

async function start() {
  try {
    await initDatabase();

    server.listen(
      PORT,
      () => {
        console.log(
          `Wawera backend running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Erro ao iniciar a base de dados:",
      error
    );

    process.exit(1);
  }
}

start();
