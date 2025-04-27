import { api } from "api/service/api_helper";


export const DeleteLanguage = async (languageId) => {
  const response = await api.deletePrivate(`/generals/delete-language?id=${languageId}`);
  return response;
};

export const DeleteUser = async (userId) => {
  const response = await api.deletePrivate(`/users/delete-user/${userId}`);
  return response;
};

export const DeleteBranch = async (branchId) => {
  const response = await api.deletePrivate(`/branches/delete-branch?branch_id=${branchId}`);
  return response;
};