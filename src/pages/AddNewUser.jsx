import { useParams } from 'react-router-dom';
import Button from 'shared/Button';
import { AddNewUserFunc } from 'api/queries/post';
import { GetAllBranches } from 'api/queries/getters';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Fragment } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import GoBack from 'shared/GoBack';
import { Helmet } from 'react-helmet-async';
import ReactSelect from 'components/ReactSelect';
import { GetTranslatorSkillLangs } from 'api/queries/getters';
import { useState } from 'react';
import { AxiosError } from 'axios';
import handleAxiosError from 'utils/handleAxiosError';

const AddNewUser = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { branchId } = useParams();

  const [isLoadingAddUser, setIsLoadingAddUser] = useState(false);

  const {
    data: regionsWithBranches,
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
      .min(3, t('nameMin'))
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
      role_id: 2,
      isActive: t('chooseActiveness'),
      branch_id: branchId !== 'all-users' ? branchId : Number(65),
      langs: []
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {

      const formattedValues = {
        ...values,
        role_id: Number(values.role_id),
        branch_id: Number(values.branch_id),
        phone: '+993' + values.phone
      };

      if (formattedValues.role_id === 3 && formattedValues.langs.length < 1) {
        formik.setFieldError('langs', t('chooseLanguage'))
        return
      };

      // Add new user function
      const addNewUser = async () => {
        setIsLoadingAddUser(true);
        try {
          const response = await AddNewUserFunc(formattedValues);
          if (response) {
            toast.success(response.data.msg);
            navigate(-1);
          };
        } catch (error) {
          if (error instanceof AxiosError) {
            handleAxiosError(error);
          } else {
            toast.error(error?.message);
          }
        } finally {
          setIsLoadingAddUser(false);
        }
      };
      addNewUser();
    },
  });

  return (
    <div className='container mx-auto flex flex-col items-center gap-8 input-custom-style px-8'>

      <Helmet>
        <title>
          {t('branchDetailsAddUser')}
        </title>
        <meta name='description' />
      </Helmet>

      <div className='w-4/5 sm:w-6/12 flex flex-col items-center gap-16 bg-slate-50 dark:bg-slate-800 p-8 rounded-md'>

        <div className='flex flex-col md:flex-row gap-8 items-center justify-between w-full'>
          <GoBack
            onClick={() => navigate(-1)}
            text={'backToBranch'}
          />
          <h3 className='text-slate-600 dark:text-slate-300 text-xl text-center md:text-start md:text-2xl'>
            {t('branchDetailsAddUser')}
          </h3>
        </div>

        {/* Form */}
        <form
          onSubmit={formik.handleSubmit}
          className='flex flex-col gap-6 items-center w-full'
        >

          {/* Full name */}
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor="fullname" className='cursor-pointer'>
              {t('branchDetailsFullname')}
            </label>
            <div className='w-full relative'>
              <input
                className='input input-md input-bordered w-full'
                id="fullname"
                name="fullname"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.fullname}
              />
              {formik.touched.fullname && formik.errors.fullname
                ? <div className='error-text absolute top-full left-0'>{formik.errors.fullname}</div>
                : null}
            </div>
          </div>

          <div className='flex flex-col gap-2 w-full '>
            <label htmlFor="email" className='cursor-pointer'>
              {t('branchDetailsEmail')}
            </label>
            <div className='w-full relative'>
              <input
                className='input input-md input-bordered text-black w-full'
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

          <div className='flex flex-col gap-2 w-full'>

            <label htmlFor="phone" className='cursor-pointer'>
              {t('branchDetailsPhone')}
            </label>
            <div className='w-full relative'>
              <span className='absolute left-3 top-3 text-md text-slate-400'>
                +993
              </span>
              <input
                className="input input-md input-bordered text-black w-full pl-16"
                id="phone"
                name="phone"
                type="tel"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[+0-9]*$/.test(value)) {
                    formik.setFieldValue("phone", value);
                  }
                }}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
              />
              {formik.touched.phone && formik.errors.phone ? (
                <div className='error-text absolute top-full left-0'>{formik.errors.phone}</div>
              ) : null}
            </div>
          </div>

          {/* Roles */}
          <div className='flex flex-col gap-2 w-full'>

            <label htmlFor="role_id" className='cursor-pointer'>
              {t('branchDetailsRole')}
            </label>

            <div className='w-full relative text-black'>

              <select
                id="role_id"
                name="role_id"
                onChange={formik.handleChange}
                value={formik.values.role_id}
                className="select select-bordered w-full"
              >

                <option value={2}>
                  {t('branchDetailsOperator')}
                </option>

                <option value={3}>
                  {t('branchDetailsTranslator')}
                </option>

                <option value={4}>
                  {t('accountant')}
                </option>

              </select>

              {formik.errors.role_id && <div>{formik.errors.role_id}</div>}
            </div>

          </div>

          {/* Choose language */}
          {Number(formik.values.role_id) === 3 && (
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
                onBlur={formik.handleBlur}
              />

              {formik.touched.langs && formik.errors.langs ? <div className='error-text'>{formik.errors.langs}</div> : null}

            </div>
          )}

          {/* Activeness */}
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor="isActive" className='cursor-pointer'>
              {t('branchDetailsStatus')}
            </label>
            <div className='w-full relative text-black'>
              <select
                id="isActive"
                name="isActive"
                value={formik.values.isActive}
                className="select select-bordered w-full"
                onChange={(e) => formik.setFieldValue("isActive", e.target.value === "true")}
              >
                <option disabled>
                  {t('chooseActiveness')}
                </option>
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

          {/* Branches */}
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
                className="select select-bordered w-full"
              >
                {regionsWithBranches?.data?.data?.length > 0 && regionsWithBranches?.data?.data?.map((branch) => (
                  <Fragment key={branch.branch_id}>
                    <option value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  </Fragment>
                ))}
              </select>
              {formik.errors.branch_id && <div>{formik.errors.branch_id}</div>}
            </div>

          </div>

          {/* Submit button */}
          <div className='w-full flex justify-end mt-6'>
            <Button className='w-full' type="submit" disabled={isLoadingAddUser}>
              {t('submitAddNewUser')} {isLoadingAddUser && <span className='loading loading-spinner loading-md'></span>}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
};


export default AddNewUser;