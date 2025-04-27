import { useState, useEffect, useRef } from 'react'
import 'assets/css/index.css'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { UserLogin } from 'api/queries/post'
import toast from 'react-hot-toast';
import { tokenStorage } from 'utils/storage.js';
import Cookies from 'js-cookie'
import Button from 'shared/Button'
import udLogoRemoveBg from 'assets/images/ud-logo-removebg-preview.png';
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup';
// icons
import { PiEyeSlashLight, PiEyeLight } from "react-icons/pi";
import { AxiosError } from 'axios';
import handleAxiosError from 'utils/handleAxiosError';

const Login = () => {
  const navigate = useNavigate();
  const passRef = useRef();
  const usernameRef = useRef();
  const { t } = useTranslation();

  const [showPass, setShowPass] = useState(false);
  
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  const usernameFocus = () => usernameRef.current.focus();

  useEffect(() => usernameFocus(), []);

  useEffect(() => {
    usernameRef.current.focus();
  }, [showPass]);

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, t('validationMinThreeSymbols'))
      .max(30, t('validMax')),
    password: Yup.string()
      .min(3, t('validationMaxSixteenSymbols'))
      .max(16, t('validationMaxSixteenSymbols'))
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async values => {
      setIsLoadingLogin(true);
      try {
        if (values.username.length > 0 && values.password.length > 0) {
          const res = await UserLogin(values);
          if (res.status === 200) {
            tokenStorage.setToken(res.data.data.access_token);
            Cookies.set('refreshToken', res.data.data.refresh_token, { sameSite: 'lax', expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
            navigate('/');
            toast.success('Successfully');
          }
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          handleAxiosError(error);
        } else {
          toast.error(error?.message);
        }
      } finally {
        setIsLoadingLogin(false);
      }
    }
  });

  return (
    <div className='min-h-[calc(100vh+350px)] md:min-h-screen h-screen flex items-center dark:bg-first-dark-bg-color'>
      <div className='h-5/6 w-full flex flex-nowrap flex-col md:flex-row'>

        <div className='w-full lg:w-1/2 flex justify-center items-center'>
          <img
            src={udLogoRemoveBg}
            alt='Logo'
            className='w-1/2'
          />
        </div>

        <section className='px-2 md:px-10 pt-4 md:pt-20 flex flex-col items-center w-full md:w-1/2 '>
          <h1 className='text-2xl dark:text-slate-300'>
            {t('signIn')}
          </h1>
          <form className='mt-10 flex flex-col gap-y-10 w-5/6 md:w-4/6' onSubmit={formik.handleSubmit}>

            <label className="form-control w-full relative">
              <input
                ref={usernameRef}
                type="text"
                placeholder={t('profileUsername')}
                className={`input input-bordered input-md w-full ${formik.errors.username ? 'input-error' : ''}`}
                id='username'
                name='username'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
                autoComplete='username'
              />
              {formik.touched.username && formik.errors.username ? (
                <div className='error-text absolute top-full left-0'>{formik.errors.username}</div>
              ) : null}
            </label>

            <div className='relative'>
              <label className="form-control w-full relative">
                <input
                  ref={passRef}
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('password')}
                  id="password"
                  name='password'
                  className={`input input-bordered input-md w-full pr-10 ${formik.errors.password ? 'input-error' : ''}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  autoComplete='current-password'
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className='error-text absolute top-full left-0'>{formik.errors.password}</div>
                ) : null}
              </label>

              <div
                className='absolute top-1 right-1 w-10 h-10 flex items-center justify-center text-xl cursor-pointer dark:text-slate-300'
                onClick={() => setShowPass(showPass ? false : true)}
              >
                {showPass ? <PiEyeLight /> : <PiEyeSlashLight />}
              </div>
            </div>
            <Button type='submit' disabled={isLoadingLogin}>
              {t('signIn')} {isLoadingLogin && <span className='loading loading-spinner loading-md'></span>}
            </Button>
          </form>
          <div className="divider w-5/6 mx-auto my-10 dark:text-slate-300">
            {t('or')}
          </div>
          <button
            className='btn btn-link dark:text-slate-300'
            type='button'
            onClick={() => navigate('/register')}
          >
            {t('register')}
          </button>
        </section>
      </div>
    </div>
  );
};


export default Login;