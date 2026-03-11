export default async function authFetch(url, options = {}) {
  let res = await fetch(url, {
    ...options,
    credentials: "include"
  });

  if (res.status !== 401) return res;

  const data = await res.json();

  if (data.message !== "Access token expired") {
    return res;
  }

  const refreshRes = await fetch("http://localhost:8080/auth/refresh", {
    method: "POST",
    credentials: "include"
  });

  if (!refreshRes.ok) {
    throw new Error("UNAUTHORIZED");
  }

  return fetch(url, {
    ...options,
    credentials: "include"
  });
}