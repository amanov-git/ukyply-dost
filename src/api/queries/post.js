import { axiosInstance } from 'api/axiosInstance';
import { api } from 'api/service/api_helper';

export const updateUser = async (id, data) => {
  return api.putPrivate({ url: `user/update-user-data/${id}`, data, withCredentials: true })
};

export const uploadUsrAvatar = async (formData, userGuid) => {
  return api.postPrivate({
    url: `user/user-avatar-upload?user_guid=${userGuid}`,
    data: formData, contentType: 'multipart/form-data',
    withCredentials: true
  })
};

export const AddLanguage = async (transLangs) => {
  const res = await api.postPrivate('/generals/add-language', transLangs)
  return res
};

export const UserLogin = async (loginInfo) => {
  const res = await axiosInstance.post('/auth/login', loginInfo, {
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  })
  return res
};

export const AddBranch = async (regionInfo) => {
  const res = await api.postPrivate('/branches/add-branch', regionInfo)
  return res
};

export const AddNewUserFunc = async (newUserInfo) => {
  const res = await api.postPrivate('/users/add-user', newUserInfo)
  return res
};

export const AssignTranslation = async (guid) => {
  const res = await api.postPrivate('/translations/assign-translation', guid)
  return res
};

export const SendEmailVerificationCode = async (email) => {
  const res = await api.postPrivate('/generals/send-email-verification-code', email)
  return res
};

export const VerifyEmailVerificationCode = async (verifInfo) => {
  const res = await api.postPrivate('/generals/verify-email-verification-code', verifInfo);
  return res;
};