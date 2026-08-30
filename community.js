const WAWERA_API = "https://wawera-app.onrender.com";

function getUserId() {
  return localStorage.getItem("wawera_id") || "";
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
  const parts = String(name || "Utilizador")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "W!";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

async function communityApi(path, options = {}) {
  const response = await fetch(
    WAWERA_API + path,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
      "Não foi possível concluir a operação."
    );
  }

  return data;
}

async function renderFeed() {
  const feed =
    document.getElementById("feed");

  if (!feed) return;

  feed.innerHTML =
    '<div class="empty">A carregar publicações...</div>';

  try {
    const userId = getUserId();

    const query = userId
      ? `?user_id=${encodeURIComponent(userId)}`
      : "";

    const data =
      await communityApi(
        `/api/posts${query}`
      );

    const posts = data.posts || [];

    if (!posts.length) {
      feed.innerHTML =
        '<div class="empty">' +
        'Ainda não existem publicações.<br>' +
        'Sê a primeira pessoa a publicar!' +
        '</div>';

      return;
    }

    feed.innerHTML =
      posts
        .map(renderPost)
        .join("");

  } catch (error) {
    feed.innerHTML =
      `<div class="empty">❌ ${escapeHtml(
        error.message
      )}</div>`;
  }
}

function renderPost(post) {
  const currentUserId =
    getUserId();

  const owner =
    String(post.user_id) ===
    String(currentUserId);

  const liked =
    Boolean(post.liked_by_me);

  const comments =
    Array.isArray(post.comments)
      ? post.comments
      : [];

  return `
    <article class="post">

      <div class="post-header">

        <div class="post-avatar">
          ${escapeHtml(
            getInitials(
              post.author_name
            )
          )}
        </div>

        <div class="post-user">

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

        <div class="badge">
          ${escapeHtml(
            post.category ||
            "Geral"
          )}
        </div>

      </div>

      <div class="post-text">
        ${escapeHtml(post.text)}
      </div>

      <div class="post-actions">

        <button
          class="${liked ? "liked" : ""}"
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

      <div class="comment-area">

        <input
          id="comment-${post.id}"
          maxlength="300"
          type="text"
          placeholder="Escreve um comentário..."
        >

        <button
          onclick="addComment(${post.id})"
        >
          Comentar
        </button>

      </div>

      <div class="comments">

        ${
          comments
            .map(
              comment => `
                <div class="comment">

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
              `
            )
            .join("")
        }

      </div>

    </article>
  `;
}

async function createPost() {
  const input =
    document.getElementById(
      "postInput"
    );

  const category =
    document.getElementById(
      "postCategory"
    );

  const text =
    String(
      input?.value || ""
    ).trim();

  const userId =
    getUserId();

  if (!userId) {
    alert(
      "Entra na tua conta para publicar."
    );
    return;
  }

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

        body: JSON.stringify({
          user_id: userId,
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
    alert(error.message);
  }
}

async function toggleLike(id) {
  const userId =
    getUserId();

  if (!userId) {
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

        body: JSON.stringify({
          user_id: userId
        })
      }
    );

    await renderFeed();

  } catch (error) {
    alert(error.message);
  }
}

async function addComment(id) {
  const input =
    document.getElementById(
      `comment-${id}`
    );

  const text =
    String(
      input?.value || ""
    ).trim();

  const userId =
    getUserId();

  if (!userId) {
    alert(
      "Entra na tua conta para comentar."
    );
    return;
  }

  if (!text) return;

  try {
    await communityApi(
      `/api/posts/${id}/comments`,
      {
        method: "POST",

        body: JSON.stringify({
          user_id: userId,
          text: text
        })
      }
    );

    await renderFeed();

  } catch (error) {
    alert(error.message);
  }
}

async function deletePost(id) {
  const userId =
    getUserId();

  if (!userId) return;

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

        body: JSON.stringify({
          user_id: userId
        })
      }
    );

    await renderFeed();

  } catch (error) {
    alert(error.message);
  }
}

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

window.escapeHtml =
  escapeHtml;

window.getInitials =
  getInitials;

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
