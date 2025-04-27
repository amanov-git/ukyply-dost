import { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { UpdateProfile } from 'api/queries/put';
import * as Yup from 'yup';
import Button from 'shared/Button';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import Lottie from 'react-lottie-player';
import { AxiosError } from 'axios';
import React from 'react';
import { Suspense } from 'react';
const UserProfileSettingsTab = React.lazy(() => import('./UserProfileSettingsTab'));
import avatarIconAnimation from 'assets/lottie/avatar-animation-icon.json'
import handleAxiosError from 'utils/handleAxiosError';

const UserProfile = () => {
  const { user } = useSelector(state => state.userInfo);
  const [isAbled, setIsAbled] = useState(false);
  const { t, i18n } = useTranslation();

  const validationSchema = Yup.object({
    email: Yup.string()
      .min(7, t('profileMailValidMin'))
      .max(100, t('validMax100chars'))
      .email('Invalid email address')
      .required(t('validRequired')),
    phone: Yup.string()
      .matches(/^(\+993|8)(6\d{7}|71\d{6})$/, t('mustContainOnlyDigits'))
      .required(t('validRequired')),
    fullname: Yup.string()
      .min(3, "Full name should be at least 3 characters long")
      .max(30, "Full name should be max 30 characters long")
      .required("Full name is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: user?.email || '',
      phone: user?.phone || '',
      fullname: user?.fullname || '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        user_id: Number(user?.user_id)
      };
      if (!isAbled) {
        console.log('Form data submitted: ', updatedValues);
        const updateProfile = async () => {
          try {
            const response = await UpdateProfile(updatedValues);
            if (response) {
              toast.success(response.data.msg);
            }
          } catch (error) {
            if (error instanceof AxiosError) {
              handleAxiosError(error);
            } else {
              toast.error(error?.message);
            }
          }
        };
        updateProfile();
      };
    },
  });

  const [userProfileTab, setUserProfileTab] = useState('userProfile');

  return (
    <div className='container mx-auto px-8'>

      <Helmet>
        <title>
          {t('profile')}
        </title>
        <meta name='description' />
      </Helmet>

      <div className='flex flex-col gap-4 sm:gap-8'>

        {/* Top section */}
        <div className='flex justify-between sm:justify-normal sm:gap-10'>
          <button
            className={`cursor-pointer rounded-full  ${userProfileTab === 'userProfile' ? `btn btn-primary dark:btn-secondary btn-md rounded-full` : `hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-3 `} `}
            onClick={() => setUserProfileTab('userProfile')}
          >
            {t('profileHeading')}
          </button>
          <button
            className={`cursor-pointer rounded-full  ${userProfileTab === 'settings' ? `btn btn-primary dark:btn-secondary btn-md
              rounded-full` : `hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-3 `} `}
            onClick={() => setUserProfileTab('settings')}
          >
            {t('settings')}
          </button>
        </div>

        {/* User profile tab */}
        {userProfileTab === 'userProfile' && (
          <Fragment>
            <div className="text-sm leading-6">
              <figure className="relative flex flex-col-reverse bg-slate-100 rounded-lg p-6 dark:bg-slate-800 dark:highlight-white/5">
                <blockquote className="mt-6 text-slate-700 dark:text-slate-300">

                  <div className='mb-6 flex gap-4'>
                    {user?.translator_skills?.map((langs) => (
                      <span
                        className={`py-1 px-4 rounded-full text-slate-600 text-xs sm:text-sm bg-slate-300 dark:text-gray-100 dark:bg-slate-700`}
                      >
                        {langs.label}
                      </span>
                    ))}
                  </div>

                  <div className='flex gap-3'>
                    <p>
                      {t('profileBranch')}:
                    </p>
                    <b className='text-slate-500 dark:text-slate-300'>
                      {user?.branch_name}
                    </b>
                  </div>
                </blockquote>
                <figcaption className="flex items-center space-x-4">

                  <Lottie
                    play
                    loop
                    animationData={avatarIconAnimation}
                    style={{ width: '100px', height: '100px' }}
                  />

                  <div className="flex-auto">
                    <div className="text-xl text-slate-900 font-semibold dark:text-slate-200">
                      {user?.username}
                    </div>
                    <div className="mt-0.5 dark:text-slate-300">
                      <span
                        className={`px-2 py-1 rounded-full text-xs text-white dark:text-gray-100 font-semibold
                          ${user.role_name === 'operator' && 'text-[#3b82f6] dark:text-sky-300 '}
                          ${user.role_name === 'translator' && 'text-[#fb923c] dark:text-orange-300'}
                          ${user.role_name === 'admin' && 'bg-green-500'}`}
                        style={
                          user.role_name === 'operator'
                            ? { color: '#3b82f6' }
                            : user.role_name === 'translator'
                              ? { color: '#fb923c' }
                              : {}
                        }
                      >
                        {user.role_name}
                      </span>
                    </div>
                    <span
                      className={`py-[2px] px-2 rounded-full text-white text-xs dark:text-gray-100 inline-block absolute top-6 right-6 ${user.is_active ? 'bg-green-700' :
                        'bg-rose-400 dark:bg-rose-500'}`}
                    >
                      {user.is_active ? t('confirmed') : t('notConfirmed')}
                    </span>
                  </div>
                </figcaption>
              </figure>
            </div>
            <form onSubmit={formik.handleSubmit} className='custom-input-style'>
              <div className='grid grid-cols-2 gap-x-16 gap-y-6'>
                <div className='flex flex-col gap-2 col-span-2 sm:col-span-1'>
                  <label htmlFor="email" className='cursor-pointer'>
                    {t('profileEmail')}
                  </label>
                  <div className='w-full relative'>
                    <input
                      className='input input-md input-bordered dark:border-none text-slate-800 w-full
                    dark:disabled:bg-slate-500 disabled:border-none disabled:text-black disabled:bg-gray-300'
                      id="email"
                      name="email"
                      type="email"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      disabled={!isAbled}
                    />
                    {formik.touched.email && formik.errors.email ? (
                      <div className='error-text absolute top-full left-0'>{formik.errors.email}</div>
                    ) : null}
                  </div>
                </div>
                <div className='flex flex-col gap-2 col-span-2 sm:col-span-1'>
                  <label htmlFor="phone" className='cursor-pointer'>
                    {t('profilePhone')}
                  </label>
                  <div className='w-full relative'>
                    <input
                      className='input input-md input-bordered dark:border-none text-slate-800 w-full
                    dark:disabled:bg-slate-500 disabled:border-none disabled:text-black disabled:bg-gray-300'
                      id="phone"
                      name="phone"
                      type="tel"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.phone}
                      disabled={!isAbled}
                    />
                    {formik.touched.phone && formik.errors.phone ? (
                      <div className='error-text absolute top-full left-0'>{formik.errors.phone}</div>
                    ) : null}
                  </div>
                </div>
                <div className='flex flex-col gap-2 col-span-2 sm:col-span-1'>
                  <label htmlFor="fullname" className='cursor-pointer'>
                    {t('profileFullname')}
                  </label>
                  <div className='w-full relative'>
                    <input
                      className='input input-md input-bordered dark:border-none text-slate-800 w-full
                    dark:disabled:bg-slate-500 disabled:border-none disabled:text-black disabled:bg-gray-300'
                      id="fullname"
                      name="fullname"
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.fullname}
                      disabled={!isAbled}
                    />
                    {formik.touched.fullname && formik.errors.fullname ? (
                      <div className='error-text absolute top-full left-0'>{formik.errors.fullname}</div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className='flex justify-end gap-6 mt-14'>

                {isAbled && (
                  <Button
                    className='w-28 bg-red-300 text-red-500 hover:bg-red-500 hover:text-gray-300 active:bg-red-300
                    active:text-red-500 dark:bg-red-400 dark:text-red-600 dark:hover:bg-red-500 dark:hover:text-red-700
                    dark:active:bg-red-400 dark:active:text-red-600'
                    onClick={() => setIsAbled(false)}
                  >
                    {t('profileCancel')}
                  </Button>
                )}

                <Button
                  onClick={() => isAbled && Object.keys(formik.errors).length < 1 ? setIsAbled(false) : setIsAbled(true)}
                  type='submit'
                  className='w-28 bg-green-700 hover:bg-green-700/80'
                >
                  {isAbled ? t('profileSave') : t('langEditLang')}
                </Button>
              </div>
            </form>
          </Fragment>
        )}

        {/* Settings tab */}
        {userProfileTab === 'settings'
          ? (
            <Suspense fallback={
              <div className='flex items-center gap-2'>
                <h5>{t('loading')}</h5>
                <span className='loading loading-spinner loading-md'>
                </span>
              </div>
            }>
              <UserProfileSettingsTab />
            </Suspense>
          ) : null}

      </div>
    </div>
  )
};


export default UserProfile;