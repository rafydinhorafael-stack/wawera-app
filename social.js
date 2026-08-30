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

window.WaweraSocial = {
  loadProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};
