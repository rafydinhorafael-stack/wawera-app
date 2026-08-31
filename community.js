const WAWERA_API = "https://wawera-app.onrender.com";

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

async function api(
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
   ESTILOS
========================= */

function addStyles() {
  if (
    document.getElementById(
      "wawera-social-style"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "wawera-social-style";

  style.textContent = `
    .wawera-social-section {
      margin: 18px 0;
      padding: 18px;
      border-radius: 20px;
      background: #171d30;
      border: 1px solid rgba(255,255,255,.1);
      color: #fff;
    }

    .wawera-social-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .wawera-social-title h3 {
      margin: 0;
      font-size: 20px;
    }

    .wawera-social-title p {
      margin: 5px 0 0;
      color: #aeb7ca;
      font-size: 13px;
    }

    .wawera-users {
      display: grid;
      gap: 10px;
      margin-top: 15px;
    }

    .wawera-user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #1d2438;
      border-radius: 16px;
    }

    .wawera-avatar {
      width: 48px;
      height: 48px;
      min-width: 48px;
      border-radius: 50%;
      background: #fff;
      color: #0b1020;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }

    .wawera-user-info {
      flex: 1;
      min-width: 0;
    }

    .wawera-user-info strong {
      display: block;
      font-size: 15px;
      cursor: pointer;
    }

    .wawera-user-info span {
      display: block;
      margin-top: 3px;
      color: #aeb7ca;
      font-size: 12px;
    }

    .wawera-follow-btn {
      border: 0;
      border-radius: 12px;
      padding: 9px 13px;
      background: #fff;
      color: #0b1020;
      font-weight: 800;
      white-space: nowrap;
    }

    .wawera-follow-btn.following {
      background: transparent;
      color: #fff;
      border: 1px solid rgba(255,255,255,.18);
    }

    .wawera-empty {
      padding: 18px;
      text-align: center;
      color: #aeb7ca;
      line-height: 1.5;
    }

    .wawera-profile {
      margin: 18px 0;
      padding: 20px;
      border-radius: 20px;
      background: #171d30;
      border: 1px solid rgba(255,255,255,.1);
      color: #fff;
    }

    .wawera-profile-top {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .wawera-profile-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #fff;
      color: #0b1020;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 900;
    }

    .wawera-profile-info {
      flex: 1;
    }

    .wawera-profile-info h2 {
      margin: 0;
    }

    .wawera-stats {
      display: flex;
      gap: 15px;
      margin-top: 8px;
      color: #aeb7ca;
      font-size: 13px;
    }

    .wawera-profile-buttons {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .wawera-btn {
      border: 0;
      border-radius: 12px;
      padding: 10px 14px;
      font-weight: 800;
      background: #fff;
      color: #0b1020;
    }

    .wawera-post {
      margin-top: 14px;
      padding: 18px;
      border-radius: 18px;
      background: #1d2438;
      border: 1px solid rgba(255,255,255,.08);
      color: #fff;
    }

    .wawera-post-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .wawera-post-info {
      flex: 1;
      min-width: 0;
    }

    .wawera-post-info strong {
      cursor: pointer;
    }

    .wawera-post-info span {
      display: block;
      color: #aeb7ca;
      font-size: 12px;
      margin-top: 3px;
    }

    .wawera-post-text {
      margin-top: 13px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.55;
    }

    .wawera-actions {
      display: flex;
      gap: 8px;
      margin-top: 13px;
    }

    .wawera-actions button {
      border: 1px solid rgba(255,255,255,.1);
      background: #171d30;
      color: #fff;
      border-radius: 12px;
      padding: 9px 12px;
      font-weight: 700;
    }

    .wawera-comments {
      margin-top: 10px;
    }

    .wawera-comment {
      padding: 9px 0;
      border-top: 1px solid rgba(255,255,255,.07);
      font-size: 13px;
    }

    .wawera-comment strong {
      margin-right: 5px;
    }

    .wawera-comment-box {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .wawera-comment-box input {
      flex: 1;
      min-width: 0;
      border: 1px solid rgba(255,255,255,.1);
      background: #171d30;
      color: #fff;
      border-radius: 12px;
      padding: 10px;
    }

    @media(max-width:520px) {
      .wawera-comment-box {
        flex-direction: column;
      }
    }
  `;

  document.head.appendChild(style);
}

/* =========================
   PESSOAS
========================= */

function createPeopleSection() {
  let section =
    document.getElementById(
      "waweraPeople"
    );

  if (section) {
    return;
  }

  const feed =
    document.getElementById("feed");

  if (!feed) {
    return;
  }

  section =
    document.createElement("section");

  section.id =
    "waweraPeople";

  section.className =
    "wawera-social-section";

  section.innerHTML = `
    <div class="wawera-social-title">

      <div>
        <h3>👥 Pessoas na Wawera</h3>
        <p>
          Encontra pessoas e começa a seguir.
        </p>
      </div>

      <button
        class="wawera-btn"
        onclick="loadPeople()"
      >
        ↻
      </button>

    </div>

    <div
      id="waweraUsers"
      class="wawera-users"
    >
      <div class="wawera-empty">
        A carregar utilizadores...
      </div>
    </div>
  `;

  feed.parentElement.insertBefore(
    section,
    feed
  );
}

async function loadPeople() {
  const box =
    document.getElementById(
      "waweraUsers"
    );

  if (!box) {
    return;
  }

  try {
    const me = getUserId();

    const data =
      await api(
        `/api/users${
          me
            ? `?user_id=${encodeURIComponent(me)}`
            : ""
        }`
      );

    const users =
      Array.isArray(data.users)
        ? data.users
        : [];

    if (!users.length) {
      box.innerHTML = `
        <div class="wawera-empty">
          Ainda não existem outros utilizadores.
        </div>
      `;
      return;
    }

    box.innerHTML =
      users
        .map(user => {

          const following =
            Boolean(
              user.following
            );

          return `
            <div class="wawera-user-card">

              <button
                class="wawera-avatar"
                onclick="openProfile('${escapeHtml(user.id)}')"
              >
                ${escapeHtml(
                  getInitials(
                    user.name
                  )
                )}
              </button>

              <div class="wawera-user-info">

                <strong
                  onclick="openProfile('${escapeHtml(user.id)}')"
                >
                  ${escapeHtml(
                    user.name
                  )}
                </strong>

                <span>
                  ${Number(
                    user.followers_count || 0
                  )} seguidores ·
                  ${Number(
                    user.following_count || 0
                  )} a seguir
                </span>

              </div>

              <button
                class="wawera-follow-btn ${
                  following
                    ? "following"
                    : ""
                }"
                onclick="toggleFollow(
                  '${escapeHtml(user.id)}',
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
        ❌ ${escapeHtml(error.message)}
      </div>
    `;

  }
}

/* =========================
   SEGUIR
========================= */

async function toggleFollow(
  targetId,
  button
) {
  const me = getUserId();

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

  button.disabled = true;

  const following =
    button.classList.contains(
      "following"
    );

  try {

    if (following) {

      await api(
        `/api/follow/${encodeURIComponent(
          targetId
        )}`,
        {
          method: "DELETE",
          body: JSON.stringify({
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

      await api(
        "/api/follow",
        {
          method: "POST",
          body: JSON.stringify({
            follower_id: me,
            following_id: targetId
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
   PERFIL
========================= */

async function openProfile(
  userId
) {
  const feed =
    document.getElementById(
      "feed"
    );

  if (!feed) {
    return;
  }

  const people =
    document.getElementById(
      "waweraPeople"
    );

  people?.remove();

  feed.innerHTML = `
    <div class="wawera-empty">
      A carregar perfil...
    </div>
  `;

  try {

    const data =
      await api(
        `/api/profile/${encodeURIComponent(
          userId
        )}`
      );

    const profile =
      data.profile;

    feed.innerHTML = `

      <section class="wawera-profile">

        <div class="wawera-profile-top">

          <div class="wawera-profile-avatar">
            ${escapeHtml(
              getInitials(
                profile.name
              )
            )}
          </div>

          <div class="wawera-profile-info">

            <h2>
              ${escapeHtml(
                profile.name
              )}
            </h2>

            <div class="wawera-stats">

              <span>
                👥 ${Number(
                  profile.followers_count || 0
                )} seguidores
              </span>

              <span>
                ➡️ ${Number(
                  profile.following_count || 0
                )} a seguir
              </span>

            </div>

          </div>

        </div>

        <div class="wawera-profile-buttons">

          <button
            class="wawera-btn"
            onclick="renderFeed()"
          >
            ← Voltar
          </button>

          ${
            String(
              getUserId()
            ) !==
            String(
              profile.id
            )

              ? `
                <button
                  class="wawera-follow-btn"
                  onclick="toggleFollow(
                    '${escapeHtml(profile.id)}',
                    this
                  )"
                >
                  Seguir
                </button>
              `

              : ""
          }

        </div>

      </section>

    `;

  } catch (error) {

    feed.innerHTML = `
      <div class="wawera-empty">

        ❌ ${escapeHtml(
          error.message
        )}

        <br><br>

        <button
          class="wawera-btn"
          onclick="renderFeed()"
        >
          Voltar
        </button>

      </div>
    `;

  }
}

/* =========================
   FEED
========================= */

async function renderFeed() {
  const feed =
    document.getElementById(
      "feed"
    );

  if (!feed) {
    return;
  }

  addStyles();

  createPeopleSection();

  feed.innerHTML = `
    <div class="wawera-empty">
      A carregar publicações...
    </div>
  `;

  try {

    const me =
      getUserId();

    const data =
      await api(
        `/api/posts${
          me
            ? `?user_id=${encodeURIComponent(me)}`
            : ""
        }`
      );

    const posts =
      Array.isArray(data.posts)
        ? data.posts
        : [];

    feed.innerHTML =
      posts.length
        ? posts
            .map(
              post =>
                renderPost(
                  post
                )
            )
            .join("")
        : `
          <div class="wawera-empty">
            Ainda não existem publicações.
          </div>
        `;

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

function renderPost(post) {
  const me =
    getUserId();

  const owner =
    String(
      post.user_id
    ) ===
    String(me);

  const comments =
    Array.isArray(
      post.comments
    )
      ? post.comments
      : [];

  return `

    <article class="wawera-post">

      <div class="wawera-post-header">

        <button
          class="wawera-post-avatar"
          onclick="openProfile('${escapeHtml(post.user_id)}')"
        >
          ${escapeHtml(
            getInitials(
              post.author_name
            )
          )}
        </button>

        <div class="wawera-post-info">

          <strong
            onclick="openProfile('${escapeHtml(post.user_id)}')"
          >
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

        <span>
          ${escapeHtml(
            post.category ||
            "Geral"
          )}
        </span>

      </div>

      <div class="wawera-post-text">
        ${escapeHtml(
          post.text
        )}
      </div>

      <div class="wawera-actions">

        <button
          onclick="toggleLike(${post.id})"
        >
          ❤️ ${Number(
            post.likes || 0
          )}
        </button>

        ${
          owner
            ? `
              <button
                onclick="deletePost(${post.id})"
              >
                🗑️ Apagar
              </button>
            `
            : ""
        }

      </div>

      <div class="wawera-comment-box">

        <input
          id="comment-${post.id}"
          maxlength="300"
          placeholder="Escreve um comentário..."
        >

        <button
          class="wawera-btn"
          onclick="addComment(${post.id})"
        >
          Comentar
        </button>

      </div>

      <div class="wawera-comments">

        ${comments
          .map(
            comment => `
              <div
                class="wawera-comment"
              >
                <strong>
                  ${escapeHtml(
                    comment.author_name ||
                    "Utilizador"
                  )}
                </strong>
                ${escapeHtml(
                  comment.text
                )}
              </div>
            `
          )
          .join("")}

      </div>

    </article>

  `;
}

/* =========================
   PUBLICAR
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

    await api(
      "/api/posts",
      {
        method: "POST",

        body:
          JSON.stringify({
            user_id: me,
            text,

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

async function toggleLike(
  postId
) {
  const me =
    getUserId();

  if (!me) {
    alert(
      "Entra na tua conta para gostar."
    );

    return;
  }

  try {

    await api(
      `/api/posts/${postId}/like`,
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

async function addComment(
  postId
) {
  const input =
    document.getElementById(
      `comment-${postId}`
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

    await api(
      `/api/posts/${postId}/comments`,
      {
        method: "POST",

        body:
          JSON.stringify({
            user_id: me,
            text
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
   APAGAR
========================= */

async function deletePost(
  postId
) {
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

    await api(
      `/api/posts/${postId}`,
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
   EXPORTAR
========================= */

window.renderFeed =
  renderFeed;

window.createPost =
  createPost;

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

window.openProfile =
  openProfile;

addStyles();

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    renderFeed
  );
} else {
  renderFeed();
}
