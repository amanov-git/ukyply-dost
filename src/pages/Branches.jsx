import { useRef, useEffect, useState } from "react";
import { GetAllRegions } from "api/queries/getters";
import { GetRegionsWithBranches } from "api/queries/getters";
import { useNavigate } from "react-router-dom";
import { AddBranch } from "api/queries/post";
import { useQuery } from "@tanstack/react-query";
import Button from "shared/Button";
import ModalVertical from "shared/ModalVertical";
import { useTranslation } from "react-i18next";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
// Icons
import { IoIosArrowDown } from "react-icons/io";
import { IoIosAddCircleOutline } from "react-icons/io";
import { AxiosError } from "axios";
import handleAxiosError from "utils/handleAxiosError";

// COMPONENT
const Branches = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useSelector((state) => state.darkLightMode);
  const [isLoadingAddBranch, setIsLoadingAddBranch] = useState(false);

  // Ref
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  // Dropdown
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: regions,
  } = useQuery({
    queryKey: ['getAllRegions'],
    queryFn: GetAllRegions
  });

  const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('region') || t('branchDetailsAll'));
  const [selectedRegionId, setSelectedRegionId] = useState(searchParams.get('region_id') || '');

  const [selectedRegionForAddBranch, setSelectedRegionForAddBranch] = useState('Aşgabat');

  // Regions with branches
  const {
    data: regionsWithBranches,
    isLoading: regionsWithBranchesLoading,
    refetch: regionsWithBranchesRefetch,
  } = useQuery({
    queryKey: ['getRegionsWithBranches', selectedRegionId],
    queryFn: GetRegionsWithBranches,
    refetchOnWindowFocus: true
  });

  // Refetching regionsWithBranches
  useEffect(() => {
    if (location.pathname === '/branches') {
      regionsWithBranchesRefetch();
    }
  }, [location.pathname]);

  const handleRegionChange = (region) => {
    setSelectedRegion(region.region_name);
    searchParams.set('region_id', region.region_id);
    setSearchParams(searchParams);
    setSelectedRegionId(region.region_id);
    localStorage.setItem('region', region.region_name);
    setIsOpen(false);
  };

  const handleRegionChangeRegionsInModal = (region) => {
    setSelectedRegionForAddBranch(region.region_name);
    formik.setFieldValue('region_id', region.region_id);
    setIsOpenModalDropdown(false);
  };

  useEffect(() => {
    if (selectedRegion === 'All' || 'Ählisi' || 'Все') {
      setSelectedRegion(t('branchDetailsAll'));
    }
  }, [])

  const handleRegionChangeAll = () => {
    setSelectedRegion(t('branchDetailsAll'));
    searchParams.delete('region_id');
    setSelectedRegionId('');
    setSearchParams(searchParams);
    localStorage.setItem('region', t('branchDetailsAll'));
    setIsOpen(false);
  };

  useEffect(() => {
    if (localStorage.getItem('region') === null) {
      setSelectedRegionId('')
      searchParams.delete('region_id')
      setSearchParams(searchParams)
    }
  }, []);

  // Modal - add new branch
  const [isOpenAddBranchModal, setIsOpenAddBranchModal] = useState(false);

  // Ref
  const refModalDropdown = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refModalDropdown.current && !refModalDropdown.current.contains(event.target)) {
        setIsOpenModalDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refModalDropdown]);

  // Dropdown in modal
  const [isOpenModalDropdown, setIsOpenModalDropdown] = useState(false);

  // Form validation - Formik and Yup
  const validationSchema = Yup.object({
    branch_name: Yup.string()
      .required('Branch name is required')
      .min(3, 'Branch name must be at least 3 characters')
      .max(50, 'Branch name must max 50 characters'),
    region_id: Yup.string().required('Region is required'),
  });

  // Add new branch
  const formik = useFormik({
    initialValues: {
      branch_name: '',
      region_id: regions?.data?.data.length > 0 ? regions.data?.data[0].region_id : '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {

      console.log('Form values:', values);

      const addBranch = async () => {
        setIsLoadingAddBranch(true);
        try {
          if (values.branch_name.length > 0) {
            const response = await AddBranch(values);
            console.log("🚀 ~ addBranch ~ response:", response)
            if (response?.status === 201) {
              toast.success(response?.data.msg);
              setIsOpenAddBranchModal(false);
              regionsWithBranchesRefetch();
              resetForm({
                values: {
                  branch_name: '',
                  region_id: regions?.data?.data.length > 0 ? regions.data?.data[0].region_id : '',
                }
              });
            }
          };

        } catch (error) {
          if (error instanceof AxiosError) {
            handleAxiosError(error);
          } else {
            toast.error(error?.message);
          }
        } finally {
          setIsLoadingAddBranch(false);
        }
      };
      await addBranch();
    },
  });

  const handleNavigateToBranchDetails = (reg) => {
    localStorage.setItem('region', t('branchDetailsAll'));
    navigate(`/branch-details?branch_id=${reg.branch_id}`);
    localStorage.setItem('branchName', reg.branch_name);
  };

  return (
    <div className={`container mx-auto px-8 flex flex-col gap-16`}>

      <Helmet>
        <title>
          {t('listItemBranch')}
        </title>
        <meta name='description' />
      </Helmet>

      {/* Top section */}
      <div className="flex flex-col sm:flex-row gap-4 xl:gap-0 justify-between items-center">
        <h4>
          {t('listItemBranch')}
        </h4>
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-10 items-center">
          {/* Dropdown filter regions in header */}
          <div className="relative inline-block text-left" ref={ref}>
            <Button onClick={() => setIsOpen(!isOpen)} className='w-40'>
              <div className="flex items-center gap-2">
                <p>
                  {selectedRegion}
                </p>
                <IoIosArrowDown className="w-5 h-5" />
              </div>
            </Button>
            {isOpen && (
              <ul className="absolute z-10 w-36 mt-2 bg-white  dark:bg-secondary rounded-md shadow-md dark:border-slate-700  dark:border">
                <li
                  className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md`}
                  onClick={handleRegionChangeAll}
                >
                  {t('branchDetailsAll')}
                </li>
                {regions?.data?.data.map((region) => (
                  <li
                    key={region.region_id}
                    className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md`}
                    onClick={() => handleRegionChange(region)}
                  >
                    {region.region_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button onClick={() => setIsOpenAddBranchModal(true)}>
            <div className="flex items-center gap-2">
              <IoIosAddCircleOutline className='w-8 h-8' />
              <p>
                {t('branchesAddBranch')}
              </p>
            </div>
          </Button>
        </div>
      </div>

      {/* Content section */}
      <div className="w-full">
        <div className="w-full grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mx-auto">
          {selectedRegion === t('branchDetailsAll') && (
            <div
              className="dark:bg-second-dark-bg-color  w-full p-4 flex flex-col items-center gap-2 cursor-pointer justify-center bg-slate-50 hover:bg-slate-100 active:bg-slate-50 dark:hover:bg-slate-700/80 dark:active:bg-slate-800 select-none  rounded-full"
              onClick={() => navigate(`/branch-details?branch_id=all-users`)}
            >
              <h5>
                {t('branchDetailsAllUsers')}
              </h5>
            </div>
          )}
          {regionsWithBranchesLoading
            ? <div className="flex gap-4"><h3>Loading</h3><span className="loading loading-spinner loading-lg"></span></div>
            : regionsWithBranches && regionsWithBranches.data.data.length > 0
              ? regionsWithBranches.data.data.map((reg) => (
                <div
                  key={reg.branch_id}
                  className="dark:bg-second-dark-bg-color  w-full p-4 flex flex-col items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 active:bg-slate-50   dark:hover:bg-slate-700/80 dark:active:bg-slate-800 select-none  rounded-full"
                  onClick={() => handleNavigateToBranchDetails(reg)}
                >
                  <p className="font-semibold text-lg text-slate-600 dark:text-slate-300">
                    {reg.branch_name.length > 25 ? reg.branch_name.slice(0, 25) + '...' : reg.branch_name}
                  </p>
                  <div className="flex gap-x-2 text-slate-400">
                    <p>
                      {reg.operator_count} {t('operators')}
                    </p>
                    <p>
                      {reg.translator_count} {t('translators')}
                    </p>
                  </div>
                </div>
              ))
              : <div><h3>{t('noData')}</h3></div>}
        </div>
      </div>

      {/* Modal - add branch */}
      <ModalVertical
        isOpenModal={isOpenAddBranchModal}
        setIsOpenModal={setIsOpenAddBranchModal}
        heading={t('branchesAddBranch')}
      >
        {/* Form */}
        <form onSubmit={formik.handleSubmit} className='w-full flex flex-col items-center gap-8'>
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor="branch_name" className='cursor-pointer'>
              {t('branchName')}
            </label>
            <input
              id='branch_name'
              name='branch_name'
              type="text"
              className={` input input-md w-full text-black  ${formik.touched.branch_name && formik.errors.branch_name ?
                'border-red-500 dark:text-red-300' : ''}`}
              value={formik.values.branch_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t('branchName')}
            />
            {formik.touched.branch_name && formik.errors.branch_name ? (
              <div className="error-text">{formik.errors.branch_name}</div>
            ) : null}
          </div>
          {/* Dropdown for regions in modal */}
          <div className='flex flex-col gap-2 w-full'>
            <p>
              {t('branchRegion')}
            </p>
            <div className="relative inline-block text-left w-full" ref={refModalDropdown}>
              <Button
                className='w-full dark:bg-slate-700'
                style={theme === 'light' ? { border: '1px solid #94a3b8 ' } : {}}
                color='bg-slate-50 hover:bg-slate-100'
                onClick={() => setIsOpenModalDropdown(!isOpenModalDropdown)}
                type='button'
              >
                <div className="flex items-center justify-between w-full dark:text-slate-100">
                  <p>
                    {selectedRegionForAddBranch}
                  </p>
                  <IoIosArrowDown className="w-5 h-5" />
                </div>
              </Button>
              {isOpenModalDropdown && (
                <ul className="absolute z-10 w-full mt-2 bg-white dark:bg-secondary rounded-md">
                  {regions?.data?.data.map((region) => (
                    <li
                      key={region.region_id}
                      className="flex items-center px-4 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                      onClick={() => handleRegionChangeRegionsInModal(region)}
                    >
                      {region.region_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className='mt-4 w-full flex justify-end'>
            <div className='flex gap-6'>
              <Button
                type="button"
                size='btn-sm'
                color='bg-red-700 border-none hover:bg-red-700/70 text-white'
                onClick={() => setIsOpenAddBranchModal(false)}
              >
                {t('profileCancel')}
              </Button>
              <Button
                type="submit"
                size='btn-sm'
                color='bg-green-700 border-none hover:bg-green-700/70 text-white'
                disabled={isLoadingAddBranch}
              >
                {t('confirm')} {isLoadingAddBranch && <span className="loading loading-spinner loading-md"></span>}
              </Button>
            </div>
          </div>
        </form>
      </ModalVertical>
    </div>
  );
};


export default Branches;