function getAccessToken() {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
}

function saveAccessToken(token) {
  if (localStorage.getItem('accessToken')) {
    localStorage.setItem('accessToken', token);
  }
  else {
    sessionStorage.setItem('accessToken', token);
  }
}

function clearAccessToken() {
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
}

export default async function authFetch(url, options = {}) {
  const token = getAccessToken();

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (res.status !== 401) return res;

  const refreshRes = await fetch("http://localhost:8080/auth/refresh", {
    method: "POST",
    credentials: "include"
  });

  if (!refreshRes.ok) {
    clearAccessToken();
    throw new Error("UNAUTHORIZED");
  }

  const data = await refreshRes.json();
  saveAccessToken(data.accessToken);

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${data.accessToken}`
    }
  });
}
