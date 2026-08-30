const WAWERA_API = "https://wawera-app.onrender.com";

/* =========================
   UTILITÁRIOS
========================= */

function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem("wawera_user")
    ) || null;
  } catch {
    return null;
  }
}

function getUserId() {
  const user = getUser();

  return (
    user?.id ||
    localStorage.getItem("wawera_id") ||
    ""
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getInitials(name) {
  const parts = String(
    name || "Utilizador"
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "W!";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}


/* =========================
   API
========================= */

async function communityApi(
  path,
  options = {}
) {
  const response = await fetch(
    WAWERA_API + path,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        ...(options.headers || {})
      }
    }
  );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (
    !response.ok ||
    data.success === false
  ) {
    throw new Error(
      data.message ||
      "Não foi possível concluir a operação."
    );
  }

  return data;
}


/* =========================
   ESTILO DA COMUNIDADE
========================= */

function addCommunityStyles() {

  if (
    document.getElementById(
      "wawera-community-style"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "wawera-community-style";

  style.textContent = `

    .wawera-section {
      margin-top: 18px;
      padding: 18px;
      border-radius: 20px;
      background: #171d30;
      border: 1px solid rgba(255,255,255,.10);
    }

    .wawera-section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .wawera-section-title h3 {
      margin: 0;
      font-size: 20px;
    }

    .wawera-section-title p {
      margin: 5px 0 0;
      color: #aeb7ca;
      font-size: 13px;
    }

    .wawera-refresh {
      border: 1px solid rgba(255,255,255,.12);
      background: #1d2438;
      color: white;
      border-radius: 12px;
      padding: 8px 12px;
      font-size: 20px;
    }

    .wawera-people {
      display: grid;
      gap: 10px;
      margin-top: 15px;
    }

    .wawera-person {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 12px;
      border-radius: 16px;
      background: #1d2438;
      border: 1px solid rgba(255,255,255,.06);
    }

    .wawera-person-avatar {
      width: 48px;
      height: 48px;
      min-width: 48px;
      border-radius: 50%;
      background: white;
      color: #0b1020;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      overflow: hidden;
    }

    .wawera-person-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .wawera-person-info {
      flex: 1;
      min-width: 0;
    }

    .wawera-person-info strong {
      display: block;
      font-size: 15px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wawera-person-info span {
      display: block;
      margin-top: 3px;
      color: #aeb7ca;
      font-size: 12px;
    }

    .wawera-follow {
      border: 0;
      border-radius: 12px;
      padding: 9px 13px;
      background: white;
      color: #0b1020;
      font-weight: 800;
      white-space: nowrap;
    }

    .wawera-follow.following {
      background: transparent;
      color: white;
      border: 1px solid rgba(255,255,255,.18);
    }

    .wawera-empty {
      padding: 16px;
      text-align: center;
      color: #aeb7ca;
      font-size: 13px;
      line-height: 1.5;
    }

    .wawera-post {
      margin-top: 14px;
      padding: 18px;
      border-radius: 18px;
      background: #1d2438;
      border: 1px solid rgba(255,255,255,.08);
    }

    .wawera-post-header {
      display: flex;
      align-items: center;
      gap: 11px;
    }

    .wawera-post-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: white;
      color: #0b1020;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      flex-shrink: 0;
    }

    .wawera-post-user {
      flex: 1;
      min-width: 0;
    }

    .wawera-post-user strong {
      display: block;
    }

    .wawera-post-user span {
      color: #aeb7ca;
      font-size: 12px;
    }

    .wawera-category {
      color: #aeb7ca;
      background: rgba(255,255,255,.07);
      padding: 5px 8px;
      border-radius: 999px;
      font-size: 11px;
    }

    .wawera-post-text {
      margin-top: 14px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.55;
    }

    .wawera-post-actions {
      display: flex;
      gap: 8px;
      margin-top: 14px;
    }

    .wawera-post-actions button {
      border: 1px solid rgba(255,255,255,.10);
      background: #171d30;
      color: white;
      border-radius: 12px;
      padding: 9px 12px;
      font-weight: 700;
    }

    .wawera-post-actions button.liked {
      background: white;
      color: #0b1020;
    }

    .wawera-comments {
      margin-top: 12px;
    }

    .wawera-comment {
      padding: 9px 0;
      border-top: 1px solid rgba(255,255,255,.07);
      font-size: 13px;
    }

    .wawera-comment strong {
      margin-right: 5px;
    }

    .wawera-comment-input {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .wawera-comment-input input {
      flex: 1;
      min-width: 0;
      padding: 11px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,.10);
      background: #171d30;
      color: white;
    }

    .wawera-comment-input button {
      border: 0;
      border-radius: 12px;
      padding: 10px 13px;
      font-weight: 800;
    }

    @media(max-width:520px) {

      .wawera-person {
        padding: 10px;
      }

      .wawera-follow {
        padding: 8px 10px;
      }

      .wawera-comment-input {
        flex-direction: column;
      }

      .wawera-comment-input button {
        width: 100%;
      }

    }

  `;

  document.head.appendChild(style);
}


/* =========================
   CRIAR ÁREA DE PESSOAS
========================= */

function createPeopleSection() {

  if (
    document.getElementById(
      "waweraPeople"
    )
  ) {
    return;
  }

  const feed =
    document.getElementById("feed");

  if (!feed) {
    return;
  }

  const section =
    document.createElement("section");

  section.id =
    "waweraPeople";

  section.className =
    "wawera-section";

  section.innerHTML = `

    <div class="wawera-section-title">

      <div>

        <h3>
          👥 Pessoas na Wawera
        </h3>

        <p>
          Descobre pessoas e começa a seguir.
        </p>

      </div>

      <button
        class="wawera-refresh"
        onclick="loadPeople()"
      >
        ↻
      </button>

    </div>

    <div
      id="waweraPeopleList"
      class="wawera-people"
    >

      <div class="wawera-empty">
        A carregar pessoas...
      </div>

    </div>

  `;

  feed.parentElement.insertBefore(
    section,
    feed
  );
}


/* =========================
   CARREGAR PESSOAS
========================= */

async function loadPeople() {

  const box =
    document.getElementById(
      "waweraPeopleList"
    );

  if (!box) {
    return;
  }

  const me =
    getUserId();

  box.innerHTML = `
    <div class="wawera-empty">
      A procurar utilizadores...
    </div>
  `;

  try {

    /*
      Pedimos as publicações ao servidor.

      Como cada publicação contém
      o autor, conseguimos descobrir
      outros utilizadores.
    */

    const query =
      me
        ? `?user_id=${encodeURIComponent(me)}`
        : "";

    const data =
      await communityApi(
        `/api/posts${query}`
      );

    const posts =
      data.posts || [];

    const people =
      new Map();

    posts.forEach(post => {

      if (!post.user_id) {
        return;
      }

      if (
        String(post.user_id) ===
        String(me)
      ) {
        return;
      }

      const id =
        String(post.user_id);

      if (!people.has(id)) {

        people.set(
          id,
          {
            id: post.user_id,

            name:
              post.author_name ||
              "Utilizador",

            avatar:
              post.author_avatar ||
              post.avatar ||
              "",

            posts: 0,

            following:
              Boolean(
                post.following_by_me ||
                post.is_following ||
                post.following
              )
          }
        );

      }

      people.get(id).posts++;

    });

    const list =
      [...people.values()];

    if (!list.length) {

      box.innerHTML = `
        <div class="wawera-empty">

          Ainda não existem outros
          utilizadores com publicações.

          <br><br>

          Cria outra conta para testar
          a parte social da aplicação.

        </div>
      `;

      return;
    }

    box.innerHTML =
      list
        .map(person => {

          const following =
            person.following;

          const avatar =
            person.avatar
              ? `
                <img
                  src="${escapeHtml(person.avatar)}"
                  alt=""
                >
              `
              : escapeHtml(
                  getInitials(
                    person.name
                  )
                );

          return `

            <div class="wawera-person">

              <div
                class="wawera-person-avatar"
              >
                ${avatar}
              </div>

              <div
                class="wawera-person-info"
              >

                <strong>
                  ${escapeHtml(
                    person.name
                  )}
                </strong>

                <span>
                  ${person.posts}
                  ${
                    person.posts === 1
                      ? "publicação"
                      : "publicações"
                  }
                </span>

              </div>

              <button
                class="wawera-follow ${
                  following
                    ? "following"
                    : ""
                }"
                data-user-id="${escapeHtml(
                  person.id
                )}"
                onclick="toggleFollow(
                  '${escapeHtml(person.id)}',
                  this
                )"
              >

                ${
                  following
                    ? "✓ A seguir"
                    : "Seguir"
                }

              </button>

            </div>

          `;

        })
        .join("");

  } catch (error) {

    box.innerHTML = `
      <div class="wawera-empty">
        ❌ ${escapeHtml(
          error.message
        )}
      </div>
    `;

  }
}


/* =========================
   SEGUIR / DEIXAR DE SEGUIR
========================= */

async function toggleFollow(
  targetId,
  button
) {

  const me =
    getUserId();

  if (!me) {

    alert(
      "Entra na tua conta primeiro."
    );

    return;
  }

  if (
    String(me) ===
    String(targetId)
  ) {

    return;

  }

  const following =
    button.classList.contains(
      "following"
    );

  button.disabled = true;

  try {

    if (following) {

      await communityApi(
        `/api/follow/${encodeURIComponent(
          targetId
        )}`,
        {
          method: "DELETE",

          body:
            JSON.stringify({
              follower_id: me
            })
        }
      );

      button.classList.remove(
        "following"
      );

      button.textContent =
        "Seguir";

    } else {

      await communityApi(
        "/api/follow",
        {
          method: "POST",

          body:
            JSON.stringify({
              follower_id: me,

              following_id:
                targetId
            })
        }
      );

      button.classList.add(
        "following"
      );

      button.textContent =
        "✓ A seguir";

    }

  } catch (error) {

    alert(
      error.message
    );

  } finally {

    button.disabled = false;

  }
}


/* =========================
   FEED
========================= */

async function renderFeed() {

  const feed =
    document.getElementById("feed");

  if (!feed) {
    return;
  }

  addCommunityStyles();

  createPeopleSection();

  feed.innerHTML = `
    <div class="wawera-empty">
      A carregar publicações...
    </div>
  `;

  try {

    const me =
      getUserId();

    const query =
      me
        ? `?user_id=${encodeURIComponent(me)}`
        : "";

    const data =
      await communityApi(
        `/api/posts${query}`
      );

    const posts =
      data.posts || [];

    if (!posts.length) {

      feed.innerHTML = `
        <div class="wawera-empty">

          Ainda não existem publicações.

          <br><br>

          Sê a primeira pessoa
          a publicar!

        </div>
      `;

      await loadPeople();

      return;
    }

    feed.innerHTML =
      posts
        .map(renderPost)
        .join("");

    await loadPeople();

  } catch (error) {

    feed.innerHTML = `
      <div class="wawera-empty">
        ❌ ${escapeHtml(
          error.message
        )}
      </div>
    `;

  }
}


/* =========================
   PUBLICAÇÃO
========================= */

function renderPost(post) {

  const me =
    getUserId();

  const owner =
    String(post.user_id) ===
    String(me);

  const liked =
    Boolean(
      post.liked_by_me
    );

  const comments =
    Array.isArray(
      post.comments
    )
      ? post.comments
      : [];

  return `

    <article class="wawera-post">

      <div
        class="wawera-post-header"
      >

        <div
          class="wawera-post-avatar"
        >
          ${escapeHtml(
            getInitials(
              post.author_name
            )
          )}
        </div>

        <div
          class="wawera-post-user"
        >

          <strong>
            ${escapeHtml(
              post.author_name ||
              "Utilizador"
            )}
          </strong>

          <span>
            ${escapeHtml(
              post.created_at_display ||
              ""
            )}
          </span>

        </div>

        <div
          class="wawera-category"
        >
          ${escapeHtml(
            post.category ||
            "Geral"
          )}
        </div>

      </div>

      <div
        class="wawera-post-text"
      >
        ${escapeHtml(
          post.text
        )}
      </div>

      <div
        class="wawera-post-actions"
      >

        <button
          class="${
            liked
              ? "liked"
              : ""
          }"
          onclick="toggleLike(
            ${post.id}
          )"
        >

          ❤️ ${
            Number(
              post.likes || 0
            )
          }

        </button>

        ${
          owner
            ? `
              <button
                onclick="deletePost(
                  ${post.id}
                )"
              >
                🗑️ Apagar
              </button>
            `
            : ""
        }

      </div>

      <div
        class="wawera-comment-input"
      >

        <input
          id="comment-${post.id}"
          maxlength="300"
          type="text"
          placeholder="Escreve um comentário..."
        >

        <button
          onclick="addComment(
            ${post.id}
          )"
        >
          Comentar
        </button>

      </div>

      <div
        class="wawera-comments"
      >

        ${comments
          .map(comment => `

            <div
              class="wawera-comment"
            >

              <strong>
                ${escapeHtml(
                  comment.author_name ||
                  "Utilizador"
                )}
              </strong>

              <span>
                ${escapeHtml(
                  comment.text
                )}
              </span>

            </div>

          `)
          .join("")}

      </div>

    </article>

  `;
}


/* =========================
   CRIAR PUBLICAÇÃO
========================= */

async function createPost() {

  const input =
    document.getElementById(
      "postInput"
    );

  const category =
    document.getElementById(
      "postCategory"
    );

  const me =
    getUserId();

  if (!me) {

    alert(
      "Entra na tua conta para publicar."
    );

    return;
  }

  const text =
    String(
      input?.value || ""
    ).trim();

  if (!text) {

    alert(
      "Escreve alguma coisa antes de publicar."
    );

    return;
  }

  try {

    await communityApi(
      "/api/posts",
      {
        method: "POST",

        body:
          JSON.stringify({
            user_id: me,

            text: text,

            category:
              category?.value ||
              "Geral"
          })
      }
    );

    input.value = "";

    await renderFeed();

  } catch (error) {

    alert(
      error.message
    );

  }
}


/* =========================
   LIKE
========================= */

async function toggleLike(id) {

  const me =
    getUserId();

  if (!me) {

    alert(
      "Entra na tua conta para gostar."
    );

    return;
  }

  try {

    await communityApi(
      `/api/posts/${id}/like`,
      {
        method: "POST",

        body:
          JSON.stringify({
            user_id: me
          })
      }
    );

    await renderFeed();

  } catch (error) {

    alert(
      error.message
    );

  }
}


/* =========================
   COMENTÁRIO
========================= */

async function addComment(id) {

  const input =
    document.getElementById(
      `comment-${id}`
    );

  const text =
    String(
      input?.value || ""
    ).trim();

  const me =
    getUserId();

  if (!me) {

    alert(
      "Entra na tua conta para comentar."
    );

    return;
  }

  if (!text) {
    return;
  }

  try {

    await communityApi(
      `/api/posts/${id}/comments`,
      {
        method: "POST",

        body:
          JSON.stringify({
            user_id: me,
            text: text
          })
      }
    );

    await renderFeed();

  } catch (error) {

    alert(
      error.message
    );

  }
}


/* =========================
   APAGAR PUBLICAÇÃO
========================= */

async function deletePost(id) {

  const me =
    getUserId();

  if (!me) {
    return;
  }

  if (
    !confirm(
      "Apagar esta publicação?"
    )
  ) {
    return;
  }

  try {

    await communityApi(
      `/api/posts/${id}`,
      {
        method: "DELETE",

        body:
          JSON.stringify({
            user_id: me
          })
      }
    );

    await renderFeed();

  } catch (error) {

    alert(
      error.message
    );

  }
}


/* =========================
   DISPONIBILIZAR FUNÇÕES
========================= */

window.createPost =
  createPost;

window.renderFeed =
  renderFeed;

window.toggleLike =
  toggleLike;

window.addComment =
  addComment;

window.deletePost =
  deletePost;

window.loadPeople =
  loadPeople;

window.toggleFollow =
  toggleFollow;

window.escapeHtml =
  escapeHtml;

window.getInitials =
  getInitials;


/* =========================
   INICIAR
========================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      addCommunityStyles();

      createPeopleSection();

      renderFeed();

    }
  );

} else {

  addCommunityStyles();

  createPeopleSection();

  renderFeed();

}
