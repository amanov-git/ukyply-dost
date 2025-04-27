import { api } from 'api/service/api_helper';


export const UpdateLanguage = async (transLang) => {
  const res = await api.putPrivate('/generals/update-language', transLang)
  return res
};

export const UpdateProfile = async (userInfo) => {
  const res = await api.putPrivate('/users/update-profile', userInfo)
  return res
};

export const UpdateUser = async (userInfo) => {
  const res = await api.putPrivate('/users/update-user', userInfo)
  return res
};

export const DeleteNewTranslation = async (guid) => {
  const res = await api.putPrivate(`/translations/delete-new-translation?guid=${guid}`)
  return res
};

export const RecreateProcessingTranslation = async (guid) => {
  const res = await api.putPrivate(`/translations/recreate-processing-translation?guid=${guid}`);
  return res
};