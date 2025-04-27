import { axiosInstance } from "../axiosInstance";
import { tokenStorage } from "utils/storage";



const config = {
  withCredentials: true,
}

const privateConfig = {
  headers: {
    "Authorization": "",
    "Content-type": "application/json"
  },
  withCredentials: false,
}

export const api = {
  get: async (url) => {
    // return axiosInstance.get(url, { ...config }).then(response => response.data)
    const res = axiosInstance.get(url, { ...config })
    return res
  },
  post: async (url, data) => {
    // return axiosInstance.post(url, { ...data }, { ...config }).then(response => response.data)
    const res = axiosInstance.post(url, { ...data }, { ...config })
    return res
  },
  put: async (url, data) => {
    // return axiosInstance.put(url, { ...data }, { ...config }).then(response => response.data)
    const res = axiosInstance.put(url, { ...data }, { ...config })
    return res
  },
  delete: async (url) => {
    // return axiosInstance.delete(url, { ...config }).then(response => response.data)
    const res = axiosInstance.delete(url, { ...config })
    return res
  },
  getPrivate: async (url, withCredentials) => {
    const token = 'Bearer ' + tokenStorage.getToken()
    const config = { ...privateConfig, headers: { ...privateConfig.headers, Authorization: token }, withCredentials }
    // return axiosInstance.get(url, { ...config }).then(response => response.data)
    const res = axiosInstance.get(url, { ...config })
    return res
  },
  postPrivate: async (url, data, contentType = 'application/json', withCredentials) => {
    const token = 'Bearer ' + tokenStorage.getToken();
    const config = {
      ...privateConfig,
      headers: {
        ...privateConfig.headers,
        "Authorization": token,
        "Content-type": contentType
      },
      withCredentials
    }
    const res = await axiosInstance.post(url, { ...data }, { ...config })
    return res
  },
  putPrivate: async (url, data, withCredentials) => {
    const token = 'Bearer ' + tokenStorage.getToken();
    const config = { ...privateConfig, headers: { ...privateConfig.headers, Authorization: token }, withCredentials }
    // return axiosInstance.put(url, { ...data }, { ...config }).then(response => response.data)
    const res = await axiosInstance.put(url, { ...data }, { ...config })
    return res
  },
  deletePrivate: async (url, withCredentials) => {
    const token = 'Bearer ' + tokenStorage.getToken();
    const config = { ...privateConfig, headers: { ...privateConfig.headers, Authorization: token }, withCredentials }
    const res = await axiosInstance.delete(url, { ...config })
    return res
  },

}