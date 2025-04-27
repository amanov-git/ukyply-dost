import Button from 'shared/Button';
import { Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GetUserForEdit } from 'api/queries/getters';
import { GetAllBranches } from 'api/queries/getters';
import { UpdateUser } from 'api/queries/put';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import GoBack from 'shared/GoBack';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import Modal from 'react-modal';
Modal.setAppElement('#root');
import { PURE_BASE_URL } from 'api/axiosInstance';
import ReactSelect from 'components/ReactSelect';
import { GetTranslatorSkillLangs } from 'api/queries/getters';
import handleAxiosError from 'utils/handleAxiosError';
// Icons
import { GoScreenFull } from 'react-icons/go';
import { IoMdDownload } from 'react-icons/io';
import { RxCross2 } from 'react-icons/rx';
import { useEffect } from 'react';
import { AxiosError } from 'axios';

// COMPONENT
const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isOpenPreviewModal, setIsOpenPreviewModal] = useState(false);
  const [chosenImage, setChosenImage] = useState('');
  const [isLoadingEditUser, setIsLoadingEditUser] = useState(false);

  const {
    data: userForEdit,
    isLoading: userForEditLoading
  } = useQuery({
    queryKey: ['getUserForEdit', userId],
    queryFn: GetUserForEdit,
  });

  const {
    data: allBranches,
  } = useQuery({
    queryKey: ['getAllBranches'],
    queryFn: GetAllBranches,
  });

  // --
  const {
    data: translatorLangs,
    isLoading: translatorLangsLoading,
  } = useQuery({
    queryKey: ['getTranslatorSkillLangs'],
    queryFn: async () => {
      return await GetTranslatorSkillLangs()
    }
  });

  const validationSchema = Yup.object({
    fullname: Yup.string()
      .min(3, t('profileMailValidMin'))
      .max(30, "Name should be max 30 characters long")
      .required("Name is required"),
    email: Yup.string()
      .min(7, t('profileMailValidMin'))
      .max(100, t('validMax100chars'))
      .required(t('validRequired')),
    phone: Yup.string()
      .matches(/^(\+993|8)(6\d{7}|71\d{6})$/, t('mustContainOnlyDigits'))
      .required("Phone number is required"),
  });

  const formik = useFormik({
    initialValues: {
      fullname: userForEdit?.data?.data?.fullname || '',
      email: userForEdit?.data?.data?.email || '',
      phone: userForEdit?.data?.data?.phone || '',
      isActive: userForEdit?.data?.data?.is_active || false,
      branch_id: userForEdit?.data?.data?.branch_id || 0,
      langs: userForEdit?.data?.data?.translator_skills || ''
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {

      const formattedValues = {
        ...values,
        user_id: Number(userId),
      };

      if (userForEdit?.data?.data?.role_name === 'translator' && formattedValues.langs.length < 1) {
        formik.setFieldError('langs', t('chooseLanguage'))
        return
      }

      const updateUser = async () => {
        setIsLoadingEditUser(true);
        try {
          const response = await UpdateUser(formattedValues);
          if (response) {
            toast.success(response.data.msg);
            navigate(-1)
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            handleAxiosError(error);
          } else {
            toast.error(error?.message);
          }
        } finally {
          setIsLoadingEditUser(false);
        }
      };
      updateUser();
    },
  });

  useEffect(() => {
    if (!userForEditLoading) {
      formik.setFieldValue('langs', userForEdit?.data?.data?.translator_skills)
    }
  }, [userForEditLoading]);

  const handleFullScreenClick = (image) => {
    const imageUrl = PURE_BASE_URL + '/images/' + image.image_url;
    setChosenImage(imageUrl);
    setIsOpenPreviewModal(true);
  };

  const downloadImage = async (image) => {
    const imageUrl = `${PURE_BASE_URL + '/images/' + image.image_url}`;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = image.image_url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const downloadImageForModal = async (chosenImage) => {
    try {
      const response = await fetch(chosenImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = chosenImage.split('/').pop();
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <div className='container mx-auto flex flex-col items-center gap-8 px-8'>

      <Helmet>
        <title>
          {t('editUser')}
        </title>
        <meta name='description' />
      </Helmet>

      <div className="flex justify-start gap-4 items-center cursor-pointer w-full">
        <GoBack
          onClick={() => navigate(-1)}
          text={'backToBranch'}
        />
      </div>

      <div className='w-4/5 sm:w-[512px] flex flex-col items-center gap-16'>

        {/* Heading */}
        <div>
          <h3 className='underline underline-offset-8 text-center'>
            {t('editUser')}
          </h3>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className='flex flex-col gap-6 items-center w-full'
        >
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor="fullname" className='cursor-pointer'>
              {t('branchDetailsFullname')}
            </label>
            <div className='w-full relative'>
              <input
                className='input input-md input-bordered dark:border-none text-black w-full'
                id="fullname"
                name="fullname"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.fullname}
              />
              {formik.touched.fullname && formik.errors.fullname ? (
                <div className='error-text absolute top-full left-0'>{formik.errors.fullname}</div>
              ) : null}
            </div>
          </div>
          <div className='flex flex-col gap-2 w-full '>
            <label htmlFor="email" className='cursor-pointer'>
              {t('branchDetailsEmail')}
            </label>
            <div className='w-full relative'>
              <input
                className='input input-md input-bordered dark:border-none text-black w-full'
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className='error-text absolute top-full left-0'>{formik.errors.email}</div>
              ) : null}
            </div>
          </div>

          {/* Phone */}
          <div className='flex flex-col gap-2 w-full '>
            <label htmlFor="phone" className='cursor-pointer'>
              {t('branchDetailsPhone')}
            </label>
            <div className='w-full relative'>
              <input
                className='input input-md input-bordered dark:border-none text-black w-full'
                id="phone"
                name="phone"
                type="tel"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
              />
              {formik.touched.phone && formik.errors.phone
                ? <div className='error-text absolute top-full left-0'>{formik.errors.phone}</div>
                : null}
            </div>
          </div>

          {/* Choose language */}
          {userForEdit?.data?.data?.role_name === 'translator' && (
            <div className='w-full flex flex-col gap-2'>
              <p>
                {t('chooseLanguage')}:
              </p>
              <ReactSelect
                selectOptions={translatorLangs?.data?.data}
                isLoading={translatorLangsLoading}
                id='langs'
                name='langs'
                handleChange={(choice) => formik.setFieldValue('langs', choice)}
                value={formik.values.langs}
              />
              {formik.touched.langs && formik.errors.langs ? <div className='error-text'>{formik.errors.langs}</div> : null}
            </div>
          )}

          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor="isActive" className='cursor-pointer'>
              {t('branchDetailsStatus')}
            </label>
            <div className='w-full relative text-black'>
              <select
                id="isActive"
                name="isActive"
                value={formik.values.isActive}
                className="select select-bordered w-full dark:border-none"
                onChange={(e) => formik.setFieldValue("isActive", e.target.value === "true")}
              >
                <option value={true}>
                  {t('branchDetailsTrue')}
                </option>
                <option value={false}>
                  {t('branchDetailsFalse')}
                </option>
              </select>
              {formik.errors.isActive && <div>{formik.errors.isActive}</div>}
            </div>
          </div>

          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor="branch_id" className='cursor-pointer'>
              {t('listItemBranch')}
            </label>
            <div className='w-full relative text-black'>
              <select
                id="branch_id"
                name="branch_id"
                onChange={formik.handleChange}
                value={formik.values.branch_id}
                className="select select-bordered w-full dark:border-none"
              >
                {allBranches?.data?.data?.length > 0 && allBranches.data.data.map((branch) => (
                  <Fragment key={branch.branch_id}>
                    <option value={branch.branch_id} className='border-2 border-red-700'>
                      {branch.branch_name}
                    </option>
                  </Fragment>
                ))}
              </select>
              {formik.errors.branch_id && <div>{formik.errors.branch_id}</div>}
            </div>
          </div>

          {/* Images preview section */}
          {userForEdit?.data?.data?.role_name === 'translator' && (
            <div className='flex justify-between h-fit w-full'>

              {userForEdit?.data?.data?.user_images.map((image) => (
                <div className='relative'>
                  <img src={PURE_BASE_URL + '/images/' + image.image_url} alt="rose" className='h-52 w-60' />

                  {/* Full screen button */}
                  <button
                    className="absolute top-2 right-3 z-10 w-7 h-7 border rounded-md border-slate-400 text-slate-500"
                    type='button'
                    onClick={() => handleFullScreenClick(image)}
                  >
                    <GoScreenFull className="w-full h-full" />
                  </button>

                  {/* Download button */}
                  <button
                    className="absolute top-2 right-12 z-10 w-7 h-7 border rounded-md border-slate-400 text-slate-500"
                    type='button'
                    onClick={() => downloadImage(image)}
                  >
                    <IoMdDownload className="w-full h-full" />
                  </button>

                </div>
              ))}

            </div>
          )}

          <div className='w-full flex justify-end mt-6'>
            <Button className='w-full' type="submit" disabled={isLoadingEditUser}>
              {t('langEditLang')} {isLoadingEditUser && <span className='loading loading-spinner loading-md'></span>}
            </Button>
          </div>

        </form>
      </div>

      {/* Preview modal */}
      <Modal
        isOpen={isOpenPreviewModal}
        onRequestClose={() => setIsOpenPreviewModal(false)}
        contentLabel='Example Label'
        overlayClassName={`fixed top-0 left-0 w-full h-screen flex justify-center py-2 z-20 backdrop-blur-sm`}
        className={`w-full h-full sm:w-[60%] bg-second-light-bg-color dark:bg-second-dark-bg-color outline-none flex flex-col 
            justify-center items-center gap-1 z-20 rounded-xl`}
      >
        <div className="w-full h-full p-4 relative">

          {/* Download button for jpg, png files */}
          <Fragment>
            <div
              className='absolute top-5 right-16 sm:top-5 sm:right-20 z-10 cursor-pointer'
              onClick={() => downloadImageForModal(chosenImage)}
            >
              <IoMdDownload className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 hover:text-slate-500" />
            </div>
          </Fragment>

          {/* Close modal button */}
          <div
            className='absolute top-5 right-9 sm:top-5 sm:right-10 z-10 cursor-pointer'
            onClick={() => setIsOpenPreviewModal(false)}
          >
            <RxCross2 className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 hover:text-red-500" />
          </div>

          {/* Files jpg, png */}
          <div className="flex items-center justify-center w-full h-full">
            <img className="rounded-md w-4/5 sm:h-full"
              src={`${chosenImage}`}
              alt="image" />
          </div>

        </div>
      </Modal>

    </div>
  )
};

export default EditUser;