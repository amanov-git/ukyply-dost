import { useState, useEffect } from 'react';
import ImageUploading from 'react-images-uploading';
import { Fragment } from 'react';
import Button from 'shared/Button';
import { IoMdClose } from "react-icons/io";
import { FiUpload } from "react-icons/fi";
import { useNavigate } from 'react-router-dom'
import { GetTranslatorSkillLangs } from 'api/queries/getters';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from 'api/axiosInstance';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import ReactSelect from 'components/ReactSelect';
import { useTranslation } from 'react-i18next';
import { SendEmailVerificationCode } from 'api/queries/post';
import ConfirmationModal from 'shared/ConfirmationModal';
import VerificationInput from 'react-verification-input';
import { VerifyEmailVerificationCode } from 'api/queries/post';
import udLogoRemoveBg from 'assets/images/ud-logo-removebg-preview.png';
import { AxiosError } from 'axios';
import handleAxiosError from 'utils/handleAxiosError';

// COMPONENT
const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState('register');
  const [isOpenEmailVerificationModal, setIsOpenEmailVerificationModal] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verificationCodeInfo, setVerificationCodeInfo] = useState({});
  const [isLoadingMail, setIsLoadingMail] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [isVerificationRequested, setIsVerificationRequested] = useState(false);

  // --
  const [images, setImages] = useState([]);
  const maxNumber = 2;

  // --
  const {
    data: translatorLangs,
    isLoading: translatorLangsLoading,
  } = useQuery({
    queryKey: ['getTranslatorSkillLangs'],
    queryFn: async () => {
      return await GetTranslatorSkillLangs()
    }
  })

  // --
  const onChange = (imageList) => {
    // data for submit
    setImages(imageList);
  };

  // Register form handling
  const validationSchema = Yup.object({
    fullname: Yup.string()
      .min(3, t('validationMinThreeSymbols'))
      .max(30, t('validMax'))
      .required(t('validRequired')),
    email: Yup.string()
      .min(7, t('profileMailValidMin'))
      .max(100, t('validMax100chars'))
      .required(t('validRequired')),
    phone: Yup.string()
      .matches(/^(61|62|63|64|65|66|67|71)\d{6}$/, t('mustContainOnlyDigits'))
      .required(t('validRequired')),
  });

  const formik = useFormik({
    initialValues: {
      fullname: '',
      email: '',
      phone: '',
      langs: [],
    },
    validationSchema,
    onSubmit: async values => {

      if (values.langs.length < 1) {
        formik.setFieldError('langs', t('chooseLanguage'))
        return
      }

      const formattedValues = {
        ...values,
        phone: '+993' + values.phone
      }

      setIsLoadingRegister(true);

      try {
        const formData = new FormData()
        formData.append('userImages', images[0].file)
        formData.append('userImages', images[1].file)
        Object.entries(formattedValues).forEach(el => el[0] === 'langs' ? formData.append(el[0], JSON.stringify(el[1])) : formData.append(el[0], el[1]))

        // Log formData to the console
        // for (let [key, value] of formData.entries()) {
        //   console.log(`${key}:`, value);
        // };

        try {
          const registerResponse = await axiosInstance({
            method: 'POST',
            url: `auth/register`,
            data: formData,
            headers: {
              'Content-type': 'multipart/form-data',
            }
          })
          console.log("🚀 ~ Register ~ registerResponse:", registerResponse)
          if (registerResponse.status === 201) {
            toast.success(registerResponse?.data.msg)
            setStep('emailVerification');
            return
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            handleAxiosError(error);
          } else {
            toast.error(error?.message);
            console.error('Error posting data: ', error)
          }
          return
        }

      } catch (error) {
        if (error instanceof AxiosError) {
          handleAxiosError(error);
        } else {
          toast.error(error?.message + '. 2 sany surat hökman ýüklenmeli.');
        }
      } finally {
        setIsLoadingRegister(false);
      }

    }
  });

  // Email verification
  const validationSchemaEmailVerification = Yup.object({
    email: Yup.string()
      .min(7, t('profileMailValidMin'))
      .max(30, t('validMax'))
      .required(t('validRequired')),
  });

  const formikEmailVerification = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchemaEmailVerification,
    onSubmit: (values) => {
      const sendEmailVerificationCode = async () => {
        setIsLoadingMail(true);
        try {
          const response = await SendEmailVerificationCode(values);
          console.log('email response: ', response);
          toast.success(response.data.msg);
          if (response) {
            setIsOpenEmailVerificationModal(true);
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            handleAxiosError(error);
          } else {
            toast.error(error?.message);
            console.error('Error posting data: ', error)

          }
        } finally {
          setIsLoadingMail(false);
        }
      };
      sendEmailVerificationCode();
    }
  });

  async function handleVerificationInfoSubmit(e) {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Verification code must be 6 digits');
    } else {
      setError('');
      setVerificationCodeInfo({
        email: formikEmailVerification.values.email,
        code: Number(code),
      });
      setIsVerificationRequested(true);
      setCode('');
    }
  };

  async function verifyEmailVerificationCode() {
    try {
      const response = await VerifyEmailVerificationCode(verificationCodeInfo);
      console.log('codeResponse: ', response);
      if (response) {
        setIsOpenEmailVerificationModal(false);
      }
      toast.success(response.data.msg);
      navigate('/register-success')
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
        console.error('Error posting data: ', error)
      }
    }
  };

  useEffect(() => {
    if (isVerificationRequested && verificationCodeInfo.email && verificationCodeInfo.code) {
      verifyEmailVerificationCode();
      setIsVerificationRequested(false);
    }
  }, [isVerificationRequested, verificationCodeInfo]);

  return (
    <main className='min-h-fit h-screen bg-white text-slate-800 dark:text-slate-300 dark:bg-first-dark-bg-color py-2'>
      <section className='w-full sm:w-3/5 mx-auto pt-20 pb-10 flex flex-col gap-y-6 items-center mb-10'>

        <div className='flex items-center justify-center gap-x-6'>

          <div>
            <img
              src={udLogoRemoveBg}
              width={280}
              height={280}
              alt="Logo"
            />
          </div>

        </div>

        <div className='sm:w-[65%]'>
          <ul className="steps step-primary w-full">
            <li
              className={`step step-primary ${step === 'register' || step === 'emailVerification' || step === 'phoneVerification' ? 'step-secondary' : ''}`}
            >
              {t('register')}
            </li>
            <li
              className={`step step-primary ${step === 'emailVerification' || step === 'phoneVerification' ? 'step-secondary' : ''}`}
            >
              {t('emailVerification')}
            </li>
          </ul>
        </div>

        {/* Register form */}
        {step === 'register' && (
          <Fragment>
            <h2 className='text-center text-xl font-semibold'>
              {t('registerForm')}
            </h2>
            <form className='mt-10 flex flex-col gap-y-5 w-5/6 md:w-3/6' onSubmit={formik.handleSubmit}>

              <label className="form-control w-full">
                <input
                  type="text"
                  placeholder={t('profileFullname')}
                  className={`input input-bordered input-md w-full  ${formik.errors.fullname ? 'input-error' : ''}`}
                  id='fullname'
                  name='fullname'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.fullname}
                />
                <div className="label">
                  <span className="label-text-alt text-red-400">{formik.errors.fullname && formik.touched.fullname ? formik.errors.fullname : ''}</span>
                </div>
              </label>
              <label className="form-control w-full">
                <input
                  type="email"
                  placeholder={t('profileEmail')}
                  className={`input input-bordered input-md w-full ${formik.errors.email ? 'input-error' : ''} `}
                  id='email'
                  name='email'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                <div className="label">
                  <span className="label-text-alt text-red-400">{formik.errors.email && formik.touched.email ? formik.errors.email : ''}</span>
                </div>

              </label>

              <label className="form-control w-full relative">
                <span className='absolute left-3 top-3 text-md text-slate-400'>
                  +993
                </span>
                <input
                  type="tel"
                  placeholder={t('profilePhone')}
                  className={`input input-bordered input-md w-full pl-16 ${formik.errors.phone ? 'input-error' : ''} `}
                  id='phone'
                  name='phone'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                />
                <div className="label">
                  <span className="label-text-alt text-red-400">{formik.errors.phone && formik.touched.phone ? formik.errors.phone : ''}</span>
                </div>
              </label>

              {/* Languages */}
              <div>
                <ReactSelect
                  selectOptions={translatorLangs?.data?.data}
                  isLoading={translatorLangsLoading}
                  id='langs'
                  name='langs'
                  handleChange={(choice) => formik.setFieldValue('langs', choice)}
                />
                {formik.touched.langs && formik.errors.langs ? <div className='error-text'>{formik.errors.langs}</div> : null}
              </div>

              <ImageUploading
                multiple
                value={images}
                onChange={onChange}
                maxNumber={maxNumber}
                dataURLKey="data_url"
              >
                {({
                  imageList,
                  onImageUpload,
                  onImageRemoveAll,
                  onImageUpdate,
                  onImageRemove,
                  isDragging,
                  dragProps,
                }) => (
                  // write your building UI
                  <div className="upload__image-wrapper  w-full ">
                    <div className='flex justify-between items-center'>
                      <Button
                        type='button'
                        style={isDragging ? { color: 'red' } : undefined}
                        onClick={onImageUpload}
                        className='btn '
                        {...dragProps}
                      >
                        + {t('clickOrDrop')}
                      </Button>
                      &nbsp;
                      <button type='button' onClick={onImageRemoveAll}>
                        {t('removeAllImages')}
                      </button>
                    </div>
                    {imageList.map((image, index) => (
                      <div key={index} className="image-item   w-full mt-4 relative">
                        <img src={image['data_url']} alt="" className='w-full h-80 object-cover rounded-md' />
                        <div className="image-item__btn-wrapper text-xl">
                          <button type='button' title="Re-upload" onClick={() => onImageUpdate(index)} className='bg-sky-300 hover:bg-sky-300/70 absolute top-11 right-3 rounded-md p-1'>
                            <FiUpload />
                          </button>
                          <button type='button' title="Remove" onClick={() => onImageRemove(index)} className='bg-red-300 hover:bg-red-300/70 absolute top-3 right-3 rounded-md p-1'>
                            <IoMdClose />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ImageUploading>

              <Button type='submit' disabled={isLoadingRegister}>
                {t('register')} {isLoadingRegister && <span className='loading loading-spinner loading-md'></span>}
              </Button>
            </form>
          </Fragment>
        )}

        {/* Email verification form */}
        {step === 'emailVerification' && (
          <Fragment>
            <h2 className='text-center text-xl font-semibold'>
              {t('verifyEmail')}
            </h2>
            <form className='mt-10 flex flex-col gap-y-5 w-5/6 md:w-3/6' onSubmit={formikEmailVerification.handleSubmit}>
              <label className="form-control w-full">
                <input
                  type="text"
                  placeholder={t('profileEmail')}
                  className={`input input-bordered input-md w-full ${formikEmailVerification.errors.email ? 'input-error' : ''}`}
                  id='email'
                  name='email'
                  onChange={formikEmailVerification.handleChange}
                  onBlur={formikEmailVerification.handleBlur}
                  value={formikEmailVerification.values.email}
                />
                <div className="label">
                  <span className="label-text-alt text-red-400">{formikEmailVerification.errors.email ? formikEmailVerification.errors.email : ''}</span>
                </div>
              </label>
              <Button
                type='submit'
                disabled={isLoadingMail}
                className='disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-500 dark:disabled:text-slate-700'
              >
                {isLoadingMail && <span className="loading loading-spinner loading-md"></span>}
                {t('submitTranslation')}
              </Button>
            </form>
            {/* Email code verification modal */}
            <ConfirmationModal
              isOpenConfirmModal={isOpenEmailVerificationModal}
              setIsOpenConfirmModal={(setIsOpenEmailVerificationModal)}
            >

              <form className='flex flex-col items-center gap-6' onSubmit={handleVerificationInfoSubmit}>
                <h5 className='text-slate-300'>
                  {t('enterCodeMail')}
                </h5>
                <VerificationInput
                  validChars="0-9"
                  inputProps={{ inputMode: "numeric" }}
                  value={code}
                  length={6}
                  onChange={(value) => setCode(value)}
                  classNames={{ character: 'rounded-md' }}
                />
                {error && <div className="text-red-500">{error}</div>}
                <Button className='mt-7' type='submit'>
                  {t('enterCodeMail2')}
                </Button>
              </form>

            </ConfirmationModal>

          </Fragment>
        )}

      </section>
    </main>
  )
};

export default Register;