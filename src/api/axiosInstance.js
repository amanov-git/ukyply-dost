import axios from "axios";
import { tokenStorage } from "utils/storage";
import i18next from "i18next";


const currentLanguage = i18next.language

// const token = "Bearer " + authToken();
const token = "Bearer " + tokenStorage.getToken();
const refreshTokenName = "refresh_token";

const BASE_URL = import.meta.env.VITE_API_MODE === 'development'
  ? import.meta.env.VITE_API_LOCAL_BACKEND_URL
  : import.meta.env.VITE_API_SERVER_BACKEND_URL

const PURE_BASE_URL = import.meta.env.VITE_API_MODE === 'development' ?
  import.meta.env.VITE_API_LOCAL_BACKEND_BASE_URL :
  import.meta.env.VITE_API_SERVER_BACKEND_BASE_URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept-Language': currentLanguage
  }
});


const axiosInstancePrivate = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: token,
    'Accept-Language': currentLanguage
  }
});

export { BASE_URL, axiosInstance, axiosInstancePrivate, refreshTokenName, PURE_BASE_URL };
