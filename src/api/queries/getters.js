import { axiosInstance } from "api/axiosInstance"
import { api } from "api/service/api_helper"
import Cookies from "js-cookie"

export const GetTranslatorSkillLangs = async () => {
  return api.get('/generals/langs')
};

export const RefreshAccessToken = async () => {
  const refreshToken = Cookies.get('refreshToken')
  const bearer = 'Bearer ' + refreshToken
  return axiosInstance.get('/auth/load-user', {
    headers: {
      Authorization: bearer,
    },

    'Access-Control-Allow-Credentials': true
  })

};

export const GetUser = async () => {
  return api.getPrivate(`/users/get-single-user`)
};

export const GetAllRegions = async () => {
  return api.getPrivate(`/generals/regions`)
};

export const GetRegionsWithBranches = async ({ queryKey }) => {
  const [, regionId] = queryKey;
  return api.getPrivate(`/branches/get-all-branches?region_id=${regionId}`)
};

export const GetAllBranches = async () => {
  return api.getPrivate(`/branches/get-all-branches`);
};

export const GetAllUsers = async ({ queryKey }) => {
  const [, allParams] = queryKey;
  return api.getPrivate(`/users/get-all-users?${allParams}`);
};

export const GetUserForEdit = async (params) => {
  const userId = params.queryKey[1]
  return api.getPrivate(`/users/get-single-user?id=${userId}`)
};

export const GetAllTranslations = async ({ queryKey }) => {
  const [, params] = queryKey;
  return api.getPrivate(`/translations/get-all-translations${params}`);
};

export const GetAllTranslationsWithBranchId = async ({ queryKey }) => {
  const [, branchId] = queryKey;
  return api.getPrivate(`/translations/get-all-translations?branch_id=${branchId}`);
};

export const GetTranslation = async ({ queryKey }) => {
  const [, guid] = queryKey;
  return api.getPrivate(`/translations/get-translation?guid=${guid}`);
};

export const GetMyTranslations = async ({ queryKey }) => {
  const [, params] = queryKey;
  return api.getPrivate(`/translations/my-translations?${params}`);
};

export const GetUsersShortInfo = async () => {
  return api.getPrivate(`/users/get-users-short-info`);
};