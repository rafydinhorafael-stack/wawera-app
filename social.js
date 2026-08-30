const WAWERA_API = "https://wawera-app.onrender.com";

function getWaweraUser() {
  try {
    const user = JSON.parse(localStorage.getItem("wawera_user"));
    return user || null;
  } catch {
    return null;
  }
}

async function loadProfile(userId) {
  const response = await fetch(
    `${WAWERA_API}/api/profile/${encodeURIComponent(userId)}`
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Não foi possível carregar o perfil."
    );
  }

  return data.profile;
}

async function followUser(userId) {
  const currentUser = getWaweraUser();

  if (!currentUser) {
    alert("Entra na tua conta primeiro.");
    return;
  }

  if (currentUser.id === userId) {
    alert("Não podes seguir a tua própria conta.");
    return;
  }

  const response = await fetch(`${WAWERA_API}/api/follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      follower_id: currentUser.id,
      following_id: userId
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Não foi possível seguir este utilizador."
    );
  }

  return data;
}

async function unfollowUser(userId) {
  const currentUser = getWaweraUser();

  if (!currentUser) {
    alert("Entra na tua conta primeiro.");
    return;
  }

  const response = await fetch(
    `${WAWERA_API}/api/follow/${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        follower_id: currentUser.id
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Não foi possível deixar de seguir."
    );
  }

  return data;
}

async function getFollowers(userId) {
  const response = await fetch(
    `${WAWERA_API}/api/profile/${encodeURIComponent(userId)}/followers`
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Não foi possível carregar os seguidores."
    );
  }

  return data.followers || [];
}

async function getFollowing(userId) {
  const response = await fetch(
    `${WAWERA_API}/api/profile/${encodeURIComponent(userId)}/following`
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Não foi possível carregar as pessoas seguidas."
    );
  }

  return data.following || [];
}
async function addComment(postId, text) {
  const user = getWaweraUser();

  if (!user || !user.id) {
    throw new Error("Utilizador não autenticado.");
  }

  const cleanText = String(text || "").trim();

  if (!cleanText) {
    throw new Error("O comentário não pode estar vazio.");
  }

  const response = await fetch(
    `${WAWERA_API}/api/posts/${encodeURIComponent(postId)}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id,
        text: cleanText
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Não foi possível adicionar o comentário."
    );
  }

  return data.comment || data;
}

async function deletePost(postId) {
  const user = getWaweraUser();

  if (!user || !user.id) {
    throw new Error("Utilizador não autenticado.");
  }

  const response = await fetch(
    `${WAWERA_API}/api/posts/${encodeURIComponent(postId)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Não foi possível apagar a publicação."
    );
  }

  return data;
}

async function addComment(postId, text) {
  const user = getWaweraUser();

  if (!user || !user.id) {
    throw new Error("Utilizador não autenticado.");
  }

  const cleanText = String(text || "").trim();

  if (!cleanText) {
    throw new Error("O comentário não pode estar vazio.");
  }

  const response = await fetch(
    `${WAWERA_API}/api/posts/${encodeURIComponent(postId)}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id,
        text: cleanText
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Não foi possível adicionar o comentário."
    );
  }

  return data.comment || data;
}

async function deletePost(postId) {
  const user = getWaweraUser();

  if (!user || !user.id) {
    throw new Error("Utilizador não autenticado.");
  }

  const response = await fetch(
    `${WAWERA_API}/api/posts/${encodeURIComponent(postId)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Não foi possível apagar a publicação."
    );
  }

  return data;
}  
  window.WaweraSocial = {
  loadProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  addComment,
  deletePost
};
