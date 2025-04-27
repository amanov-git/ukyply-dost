const TOKEN_LOCALSTORAGE_KEY = "access_token";

export const tokenStorage = {
  getToken: () => {
    let parsed;
    const token = window.localStorage.getItem(TOKEN_LOCALSTORAGE_KEY);
    if (token !== null || token !== undefined) {
      parsed = JSON.parse(token);
      return parsed;
    } else {
      return null;
    }
  },
  setToken: (token) =>
    window.localStorage.setItem(TOKEN_LOCALSTORAGE_KEY, JSON.stringify(token)),
  clearToken: () => window.localStorage.removeItem(TOKEN_LOCALSTORAGE_KEY),
};





export const getFromStorage = (key) => {
  const authUser = JSON.parse(localStorage.getItem('authUser')) || ""
  if (key !== '') {
    const result = authUser?.[key] ?? ""
    return result
  }
  return authUser
};




export const deleteFromStorage = () => {
  const authUser = JSON.parse(localStorage.getItem('authUser')) || ""
  for (let key in authUser) {
    if (!key.includes('user_phone'))
      delete authUser[key]
  }
  localStorage.setItem('authUser', JSON.stringify(authUser))
};