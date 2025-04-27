import { useState, useRef, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GetAllUsers } from "api/queries/getters";
import { DeleteUser } from "api/queries/delete";
import Button from "shared/Button";
import { useFormik } from "formik";
import * as Yup from 'yup';
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { DeleteBranch } from "api/queries/delete";
import { useWindowWidth } from "@react-hook/window-size";
import { GetAllTranslationsWithBranchId } from 'api/queries/getters';
import Card from "shared/Card";
import ConfirmationModal from "shared/ConfirmationModal";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
// Icons
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearchSharp } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdFiberNew } from "react-icons/md";
import { SiProcesswire } from "react-icons/si";
import { SiTicktick } from "react-icons/si";
import GoBack from "shared/GoBack";
import { PiEyeSlashLight, PiEyeLight } from "react-icons/pi";
import { AxiosError } from "axios";
import handleAxiosError from "utils/handleAxiosError";

const BranchDetails = () => {
  const { t } = useTranslation();

  const { user } = useSelector(state => state.userInfo);

  const [tab, setTab] = useState(localStorage.getItem('branchDetailsTab') || 'users');
  const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpenDeleteBranchModal, setIsOpenDeleteBranchModal] = useState(false);
  const [isOpenDeleteBranchInputModal, setIsOpenDeleteBranchInputModal] = useState(false);
  const [deleteModalInputValue, setDeleteModalInputValue] = useState('');

  const [passwordInputValue, setPasswordInputValue] = useState('');
  const [errorPasswordInputValue, setErrorPasswordInputValue] = useState('');

  const [isOpenPasswords, setIsOpenPasswords] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isOpenPasswordConfirmationModal, setIsOpenPasswordConfirmationModal] = useState(false);

  const [isLoadingDeleteBranch, setIsLoadingDeleteBranch] = useState(false);
  const [isLoadingDeleteUser, setIsLoadingDeleteUser] = useState(false);

  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (isOpenPasswordConfirmationModal) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 0);
    }
  }, [isOpenPasswordConfirmationModal]);

  const handleUserActiveness = () => {
    if (searchParams.get('is_active') === 'true') {
      return t('branchDetailsTrue')
    } else if (searchParams.get('is_active') === 'false') {
      return t('branchDetailsFalse')
    } else {
      return t('allStatuses')
    }
  };

  const [isOpenDropdownActiveness, setIsOpenDropdownActiveness] = useState(false);
  const [activeness, setActiveness] = useState({
    activenessCondition: searchParams.get('is_active') || undefined,
    activenessName: handleUserActiveness()
  });

  const handleRoleCheck = () => {
    if (searchParams.get('role_id') === '1') {
      return t('branchDetailsAdmin')
    } else if (searchParams.get('role_id') === '2') {
      return t('branchDetailsOperator')
    } else if (searchParams.get('role_id') === '3') {
      return t('branchDetailsTranslator')
    } else {
      return t('branchDetailsAllRoles')
    };
  };

  const [isOpenDropdownRoles, setIsOpenDropdownRoles] = useState(false);
  const [role, setRole] = useState({
    roleId: searchParams.get('role_id') || 0,
    roleName: handleRoleCheck()
  });

  const activenessList = [
    {
      activenessCondition: true,
      activenessName: t('branchDetailsTrue')
    },
    {
      activenessCondition: false,
      activenessName: t('branchDetailsFalse')
    },
  ];

  const rolesList = [
    {
      roleId: 1,
      roleName: t('branchDetailsAdmin'),
    },
    {
      roleId: 2,
      roleName: t('branchDetailsOperator'),
    },
    {
      roleId: 3,
      roleName: t('branchDetailsTranslator'),
    },
  ];

  const navigate = useNavigate();

  const allParams = searchParams.toString();

  const {
    data: allUsersList,
    isLoading: allUsersListLoading,
    refetch: allUsersListRefetch,
  } = useQuery({
    queryKey: ['getAllUsers', allParams],
    queryFn: GetAllUsers
  });

  const deleteUser = async (userId) => {
    setIsLoadingDeleteUser(true);
    try {
      const response = await DeleteUser(userId);
      if (response?.data.msg) {
        toast.success(response.data.msg)
      };
      allUsersListRefetch();
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
      }
    } finally {
      setIsLoadingDeleteUser(false);
      setIsOpenDeleteConfirmModal(false);
    }
  };

  const refActiveness = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refActiveness.current && !refActiveness.current.contains(event.target)) {
        setIsOpenDropdownActiveness(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpenDropdownActiveness(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [refActiveness]);

  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpenDropdownRoles(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpenDropdownRoles(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);

  const handleDropdownActiveness = (activeness) => {
    setActiveness(activeness);
    searchParams.set('is_active', activeness.activenessCondition);
    setSearchParams(searchParams);
    setIsOpenDropdownActiveness(false);
  };

  const handleDropdownActivenessAll = () => {
    setActiveness({ activenessCondition: undefined, activenessName: t('allStatuses') });
    searchParams.delete('is_active');
    setSearchParams(searchParams);
    setIsOpenDropdownActiveness(false);
  };

  const handleDropdownRole = (role) => {
    setRole(role);
    searchParams.set('role_id', role.roleId);
    setSearchParams(searchParams);
    setIsOpenDropdownRoles(false);
  };

  const handleDropdownRoleAll = () => {
    setRole({ roleId: 0, roleName: t('branchDetailsAllRoles') });
    searchParams.delete('role_id');
    setSearchParams(searchParams);
    setIsOpenDropdownRoles(false);
  };

  const validationSchema = Yup.object({
    search: Yup.string()
      .min(3, 'Few letters')
  });

  const formik = useFormik({
    initialValues: {
      search: '',
    },
    validationSchema,
    onSubmit: (values) => {
      searchParams.set('search', values.search);
      setSearchParams(searchParams);
      values.search.length < 1 && searchParams.delete('search');
      setSearchParams(searchParams);
    },
  });

  const handleDeleteUserClick = (userId) => {
    setIsOpenDeleteConfirmModal(true);
    setCurrentUserId(userId);
  };

  const handleYesDeleteBranchModal = () => {
    setIsOpenDeleteBranchModal(false);
    setIsOpenDeleteBranchInputModal(true);
  };

  const handleDeleteBranchClick = () => {
    if (allUsersList && allUsersList?.data?.data?.length > 0) {
      toast.error(t('firstDeleteAllUsers'))
    } else {
      setIsOpenDeleteBranchModal(true);
    }
  };

  async function deleteBranch() {
    setIsLoadingDeleteBranch(true);
    try {
      const response = await DeleteBranch(searchParams.get('branch_id') !== null ? searchParams.get('branch_id') : '');
      if (response?.status === 200) {
        toast.success(response?.data?.msg);
        setIsOpenDeleteBranchInputModal(false);
        navigate('/branches');
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
      }
    } finally {
      setIsLoadingDeleteBranch(false);
    }
  };

  const handleDeleteInputChange = (e) => {
    const value = e.target.value;
    setDeleteModalInputValue(value);
  };

  const branchName = localStorage.getItem('branchName');

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (deleteModalInputValue.replace(/\s+/g, '').toLowerCase() === branchName.replace(/\s+/g, '').toLowerCase()) {
      await deleteBranch();
    } else {
      toast.error(t('branchNameError'))
    };
  };

  const handleUsersTabClick = () => {
    localStorage.setItem('branchDetailsTab', 'users');
    setTab('users');
  };

  const handleTranslationsTabClick = () => {
    localStorage.setItem('branchDetailsTab', 'translations');
    setTab('translations');
  };

  // Translations tab
  const screenWidth = useWindowWidth();
  const [cardsListID, setCardsListID] = useState(1);

  const [filterStatus, setFilterStatus] = useState(localStorage.getItem('dashboardShowStatus') || 'all');

  const [showNewCards, setShowNewCards] = useState(false);
  const [showProcessingCards, setShowProcessingCards] = useState(false);
  const [showCompletedCards, setShowCompletedCards] = useState(false);

  const cardsList = [
    {
      id: 1,
      headingText: t('enquiryType1'),
      icon: MdFiberNew,
    },
    {
      id: 2,
      headingText: t('enquiryType2'),
      icon: SiProcesswire,
    },
    {
      id: 3,
      headingText: t('enquiryType3'),
      icon: SiTicktick,
    },
  ];

  const {
    data: allTranslationsWithBranchId,
    refetch: refetchAllTranslationsWithBranchId,
    isLoading: allTranslationsWithBranchIdLoading,
  } = useQuery({
    queryKey: ['getAllTranslationsWithBranchId', !allParams.includes('all-users') ? searchParams.get('branch_id') : ''],
    queryFn: GetAllTranslationsWithBranchId,
  });

  useEffect(() => {
    const savedFilterStatus = localStorage.getItem('filterStatus');
    if (savedFilterStatus) {
      setFilterStatus(savedFilterStatus);
    }
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    localStorage.setItem('filterStatus', value);
  };

  // Show cards' sections
  useEffect(() => {
    if (filterStatus === 'new') {
      setShowNewCards(true);
      setShowProcessingCards(false);
      setShowCompletedCards(false);
      localStorage.setItem('dashboardShowStatus', 'new')
    } else if (filterStatus === 'processing') {
      setShowNewCards(false);
      setShowProcessingCards(true);
      setShowCompletedCards(false);
      localStorage.setItem('dashboardShowStatus', 'processing')
    } else if (filterStatus === 'completed') {
      setShowNewCards(false);
      setShowProcessingCards(false);
      setShowCompletedCards(true);
      localStorage.setItem('dashboardShowStatus', 'completed')
    } else {
      setShowNewCards(true);
      setShowProcessingCards(true);
      setShowCompletedCards(true);
      localStorage.setItem('dashboardShowStatus', 'all')
    }
  }, [filterStatus, showNewCards, showProcessingCards, showCompletedCards]);

  useEffect(() => {
    refetchAllTranslationsWithBranchId();
  }, []);

  // --
  const handleClickShowPasswordIcon = () => {
    if (isOpenPasswords) {
      setShowPasswords(!showPasswords);
    } else {
      setIsOpenPasswordConfirmationModal(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    setErrorPasswordInputValue('');

    if (passwordInputValue.length > 15) {
      setErrorPasswordInputValue('Uzynlygy 15 harpdan köp bolmaly däl')
    } else if (passwordInputValue.length < 3) {
      setErrorPasswordInputValue('Uzynlygy 3 harpdan az bolmaly däl')
    } else {
      if (passwordInputValue === user?.password) {
        setIsOpenPasswords(true);
        setIsOpenPasswordConfirmationModal(false);
        toast.success('Success');
      } else {
        toast.error('Gizlin kody ýalňyş girizdiňiz');
      }
    };

  };

  return (
    <div className="container mx-auto px-8 flex flex-col gap-16 sm:gap-5">

      <Helmet>
        <title>
          {t('branchDetails')}
        </title>
        <meta name='description' />
      </Helmet>

      {/* Top section */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between gap-4 w-full">

        <GoBack to='/branches' text='branchDetailsAllBranches' />

        {/* Branch name heading */}
        {searchParams.get('branch_id') !== 'null' && (
          <Fragment>
            {!allParams.includes('all-users') && (
              <h5 className="h-9 flex items-center">
                {localStorage.getItem('branchName')}
              </h5>
            )}
          </Fragment>
        )}

        {!allParams.includes('all-users') && (
          <div className="flex gap-8">
            <button
              className={`cursor-pointer rounded-full  ${tab === 'users' ? `btn btn-primary dark:btn-secondary btn-md rounded-full` : `hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-3 `} `}
              onClick={handleUsersTabClick}
            >
              {t('branchDetailsUsers')}
            </button>
            <button
              className={`cursor-pointer rounded-full  ${tab === 'translations' ? `btn btn-primary dark:btn-secondary btn-md rounded-full` : `hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-3 `} `}
              onClick={handleTranslationsTabClick}
            >
              {t('branchDetailsTranslations')}
            </button>
          </div>
        )}
      </div>

      {/* Users' section */}
      {tab === 'users' || allParams.includes('all-users')
        ? (
          <div className="flex flex-col gap-8">
            <div className="w-full flex flex-col gap-10 lg:flex-row justify-between lg:gap-6">
              <form onSubmit={formik.handleSubmit} className="input-custom-style w-full lg:w-72 relative">
                <input
                  type="text"
                  id='search'
                  name='search'
                  placeholder={t('branchDetailsSearchUser')}
                  className={`dark:bg-slate-300 input input-md input-bordered dark:input w-full text-black 
              ${formik.touched.search && formik.errors.search ? 'border-red-500' : ''}`}
                  value={formik.values.search}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button type='submit' className='w-6 h-6 absolute top-1/2 -translate-y-1/2 right-4 text-black'>
                  <IoSearchSharp className='w-full h-full text-slate-500' />
                </button>
              </form>
              <div className="flex flex-col justify-center gap-6 sm:flex-row sm:items-center">

                {/* Dropdown - activeness */}
                <div className="relative">
                  <div className="relative inline-block text-left w-full sm:w-fit" ref={refActiveness}>
                    <Button onClick={() => setIsOpenDropdownActiveness(!isOpenDropdownActiveness)} className='w-full sm:w-fit flex'>
                      <div className="flex items-center gap-2">
                        <p className="flex">
                          {activeness.activenessName}
                        </p>
                        <IoIosArrowDown className="w-5 h-5" />
                      </div>
                    </Button>
                    {isOpenDropdownActiveness && (
                      <ul
                        className="absolute z-10 sm:w-40 w-full mt-2 dropdown-ul"
                      >
                        <li
                          className="flex items-center px-4 py-2 cursor-pointer dropdown-li"
                          onClick={handleDropdownActivenessAll}
                        >
                          {t('branchDetailsAll')}
                        </li>
                        {activenessList.map((activeness, index) => (
                          <Fragment key={index}>
                            <li
                              className="flex items-center px-4 py-2 cursor-pointer dropdown-li"
                              onClick={() => handleDropdownActiveness(activeness)}
                            >
                              {activeness.activenessName}
                            </li>
                          </Fragment>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Dropdown - roles */}
                <div className="relative">
                  <div className="relative inline-block text-left w-full sm:w-fit" ref={ref}>
                    <Button onClick={() => setIsOpenDropdownRoles(!isOpenDropdownRoles)} className='w-full sm:w-fit'>
                      <div className="flex items-center gap-2">
                        <p>
                          {role.roleName}
                        </p>
                        <IoIosArrowDown className="w-5 h-5" />
                      </div>
                    </Button>
                    {isOpenDropdownRoles && (
                      <ul
                        className="absolute z-10 w-full sm:w-36 mt-2 dropdown-ul"
                      >
                        <li
                          className="flex items-center px-4 py-2 cursor-pointer dropdown-li"
                          onClick={handleDropdownRoleAll}
                        >
                          {t('branchDetailsAll')}
                        </li>
                        {rolesList.map((role) => (
                          <Fragment key={role.roleId}>
                            <li
                              className="flex items-center px-4 py-2 cursor-pointer dropdown-li"
                              onClick={() => handleDropdownRole(role)}
                            >
                              {role.roleName}
                            </li>
                          </Fragment>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/add-new-user/${searchParams.get('branch_id')
                    ? searchParams.get('branch_id')
                    : 'all-users'}`)}
                >
                  <div className="flex items-center gap-2">
                    <IoIosAddCircleOutline className='w-8 h-8' />
                    <p>
                      {t('branchDetailsAddUser')}
                    </p>
                  </div>
                </Button>
                {!allParams.includes('all-users') && (
                  <Button
                    className='bg-red-600 hover:bg-red-400 active:bg-red-600 dark:bg-red-900 dark:hover:bg-red-800 
                dark:active:bg-red-900'
                    onClick={handleDeleteBranchClick}
                  >
                    <div className="flex items-center gap-2">
                      <RiDeleteBinLine className="text-xl" />
                      <span>
                        {t('deleteBranch')}
                      </span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto dark:bg-second-dark-bg-color rounded-md p-4 shadow-md overflow-y-hidden">
              <table className="table table-sm">
                <thead>
                  <tr className="text-center bg-slate-100  dark:bg-transparent border-none text-xs sm:text-base text-gray-700 dark:text-slate-100">
                    <th></th>
                    <th className="text-left">{t('branchDetailsFullname')}</th>
                    <th>{t('branchDetailsEmail')}</th>
                    <th>{t('branchDetailsPhone')}</th>
                    <th>{t('branchDetailsRole')}</th>
                    <th>{t('branchDetailsStatus')}</th>
                    <th>{t('branchDetailsUsername')}</th>

                    <th
                      className="flex justify-center items-center cursor-pointer"
                      onClick={handleClickShowPasswordIcon}
                    >
                      {showPasswords ? <PiEyeSlashLight className="w-6 h-6" /> : <PiEyeLight className="w-6 h-6" />}
                    </th>

                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {allUsersListLoading
                    ? (
                      <tr>
                        <td colSpan="9" className="text-center">
                          <div className="flex gap-4 justify-center">
                            <h3>{t('loading')}</h3>
                            <span className="loading loading-spinner loading-lg"></span>
                          </div>
                        </td>
                      </tr>
                    )
                    : allUsersList && allUsersList.data.data.length > 0
                      ? (
                        allUsersList.data.data.map((user, index) => (
                          <tr
                            key={user.user_id}
                            className={`border-b border-slate-300 dark:border-gray-700 ${index % 2 === 1 ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}`}
                          >
                            <td className="font-bold text-center">{index + 1}</td>
                            <td className="text-xs sm:text-sm">
                              {user.fullname}
                            </td>
                            <td className="text-center text-xs sm:text-sm">{user.email}</td>
                            <td className="text-center text-xs sm:text-sm">{user.phone}</td>
                            <td className={`text-center text-xs sm:text-sm`}>
                              <span
                                className={`px-2 py-1 rounded-full text-xs text-white dark:text-gray-100 font-semibold
                                  ${user.role_name === 'operator' && 'text-[#3b82f6] dark:text-sky-300 '}
                                  ${user.role_name === 'translator' && 'text-[#fb923c] dark:text-orange-300'}
                                  ${user.role_name === 'accountant' && 'text-purple-700 dark:text-purple-500'}
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
                            </td>
                            <td className="text-center">
                              <span
                                className={`py-[2px] px-2 rounded-full text-white text-xs dark:text-gray-100 
                                  ${user.is_active
                                    ? 'bg-green-700'
                                    : 'bg-rose-400 dark:bg-rose-500'}`}
                              >
                                {user.is_active ? 'Tassyklandy' : 'Tassyklanmady'}
                              </span>
                            </td>
                            <td className="text-center text-xs sm:text-sm">{user.username}</td>

                            <td className="text-center text-xs sm:text-sm">
                              {showPasswords ? user?.password : '**********'}
                            </td>
                            <td className="flex gap-4 text-white">
                              {/* Edit button */}
                              <div className="tooltip tooltip-top tooltip-primary dark:tooltip-secondary" data-tip={t('langEditLang')}>
                                <button
                                  className="btn btn-sm border-none shadow-none  font-semibold hover:bg-slate-300 active:bg-slate-200 text-slate-900   dark:text-white    dark:hover:bg-slate-400 dark:hover:text-black"
                                  // onClick={() => navigate(`/edit-user/${user.user_id}?branch_id=${searchParams.get('branch_id')}`)}
                                  onClick={() => navigate(`/edit-user/${user.user_id}?${allParams}`)}
                                >
                                  <CiEdit />
                                </button>
                              </div>
                              {/* Delete button */}
                              <div className="tooltip tooltip-top tooltip-primary dark:tooltip-secondary" data-tip={t('langDeleteLang')}>
                                {user.role_name !== 'admin' &&
                                  <button
                                    className="btn btn-sm border-none text-red-600 hover:bg-red-200 active:bg-red-300 dark:text-white dark:hover:text-red-700 shadow-none text-xs"
                                    onClick={() => handleDeleteUserClick(user.user_id)}
                                  >
                                    <GoTrash />
                                  </button>}
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                      : (
                        <tr>
                          <td colSpan="9" className="text-center">
                            <h3>{t('noData')}</h3>
                          </td>
                        </tr>
                      )}
                </tbody>
              </table>
            </div>
          </div>
        )
        : null}

      {/* Delete user confirmation modal */}
      <ConfirmationModal isOpenConfirmModal={isOpenDeleteConfirmModal} setIsOpenConfirmModal={setIsOpenDeleteConfirmModal}>

        <div className='flex flex-col gap-10'>
          <h5 className='text-black dark:text-white'>
            {t('deleteUserConfirmation')}
          </h5>
          <div className='flex gap-4 w-full justify-end'>
            <Button
              className='max-w-sm flex gap-2 items-center'
              onClick={() => deleteUser(currentUserId)}
              size='btn-sm'
              disabled={isLoadingDeleteUser}
            >
              {t('langDeleteConfirmationYes')} {isLoadingDeleteUser ? <span className="loading loading-spinner loading-sm"></span> : null}
            </Button>
            <Button className='max-w-sm' onClick={() => setIsOpenDeleteConfirmModal(false)} size='btn-sm'>
              {t('langDeleteConfirmationNo')}
            </Button>
          </div>
        </div>

      </ConfirmationModal>

      {/* Delete branch confirmation modal */}
      <ConfirmationModal
        isOpenConfirmModal={isOpenDeleteBranchModal}
        setIsOpenConfirmModal={setIsOpenDeleteBranchModal}
        className='h-72'
      >
        <div className='flex flex-col gap-10'>
          <h4 className='text-red-500'>
            {t('deleteBranchConfirmation')}
          </h4>
          <div className='flex gap-4 w-full justify-end'>

            <Button
              className='max-w-sm'
              size='btn-md'
              onClick={() => setIsOpenDeleteBranchModal(false)}
            >
              {t('langDeleteConfirmationNo')}
            </Button>

            <Button
              className='max-w-sm text-slate-200'
              size='btn-md'
              color='bg-red-500 hover:bg-red-400 active:bg-red-500'
              onClick={handleYesDeleteBranchModal}
            >
              {t('langDeleteConfirmationYes')}
            </Button>

          </div>
        </div>
      </ConfirmationModal>

      {/* DELETE BRANCH - branch name confirmation modal */}
      <ConfirmationModal
        isOpenConfirmModal={isOpenDeleteBranchInputModal}
        setIsOpenConfirmModal={setIsOpenDeleteBranchInputModal}
        className='lg:w-2/3'
      >
        <div className='flex flex-col gap-6'>

          <h4 className="text-red-500 text-center text-2xl xl:text-2xl">
            {t('deleteBranchConfirmationWarning')}
          </h4>

          <h5 className='text-slate-600 dark:text-slate-200 text-center text-xl'>
            {branchName}
          </h5>

          <p className="text-slate-600 dark:text-slate-200 text-center text-lg">
            {t('branchEnterName')}
          </p>

          <form onSubmit={handleDeleteSubmit} className="flex flex-col gap-8">
            <input
              type="text"
              className="input input-md md:w-4/5 md:self-center text-slate-500 dark:text-slate-700 dark:bg-slate-400"
              value={deleteModalInputValue}
              onChange={handleDeleteInputChange}
            />
            <div className='flex gap-4 w-full justify-end'>
              <Button
                className='max-w-sm'
                onClick={() => setIsOpenDeleteBranchInputModal(false)}
                size='btn-md'
                type='button'
              >
                {t('langDeleteConfirmationNo')}
              </Button>
              <Button
                className='max-w-sm text-slate-200'
                size='btn-md'
                type='submit'
                color='bg-red-500 hover:bg-red-400 active:bg-red-500'
                disabled={isLoadingDeleteBranch}
              >
                {t('langDeleteConfirmationYes')} {isLoadingDeleteBranch && <span className="loading loading-spinner loading-md"></span>}
              </Button>
            </div>
          </form>
        </div>
      </ConfirmationModal>
      {/* Translations tab */}
      {tab === 'translations' && (
        <Fragment>
          {!allParams.includes('all-users')
            ? (
              <div className='px-8 sm:px-0 flex flex-col gap-10'>
                {/* Filter section */}
                {screenWidth > 640 && (
                  <div className='px-6 flex justify-end'>
                    <select
                      className="select select-bordered w-40 max-w-xs rounded-md dark:bg-secondary dark:border-none"
                      value={filterStatus}
                      onChange={handleFilterChange}
                    >
                      <option value='all'>{t('branchDetailsAll')}</option>
                      <option value='new'>{t('enquiryType1')}</option>
                      <option value='processing'>{t('enquiryType2')}</option>
                      <option value='completed'>{t('enquiryType3')}</option>
                    </select>
                  </div>
                )}
                <div className='flex flex-col sm:flex-row gap-16 sm:gap-0'>
                  {/* Heading with icons for mobile version */}
                  {screenWidth < 600 && (
                    <div className='flex flex-col gap-10'>
                      <div className='flex w-full justify-center items-center gap-10 px-6'>
                        {cardsList.map(({ id, icon: Icon }) => (
                          <Fragment key={id}>
                            <button
                              className={`${cardsListID === id && 'scale-125 transition-all duration-500'} 
                     ${id === 3 || id === 2 ? 'w-8 h-8' : 'w-10 h-10'}`}
                              onClick={() => setCardsListID(id)}
                            >
                              <Icon className='w-full h-full' />
                            </button>
                          </Fragment>
                        ))}
                      </div>
                      <div>
                        {cardsListID === 1 ? (
                          <div>
                            <h5 className='text-center'>
                              {t('enquiryType1')}
                            </h5>
                            {allTranslationsWithBranchIdLoading ? <div><span>Loading</span><span className="loading loading-spinner loading-md"></span></div> : allTranslationsWithBranchId?.data?.data[0]?.translation_docs.length > 0 ? allTranslationsWithBranchId?.data?.data[0]?.translation_docs.map((transl, index) => (
                              <div key={index} className={`flex flex-col gap-6 py-4`}>
                                <Card element={transl} />
                              </div>
                            )) : <div><p className="text-center">{t('noTranslations')}</p></div>}
                          </div>
                        ) : cardsListID === 2 ? (
                          <div>
                            <h5 className='text-center'>
                              {t('enquiryType2')}
                            </h5>
                            {allTranslationsWithBranchIdLoading ? <div><span>Loading</span><span className="loading loading-spinner loading-md"></span></div> : allTranslationsWithBranchId?.data?.data[1]?.translation_docs.length > 0 ? allTranslationsWithBranchId?.data?.data[1]?.translation_docs.map((transl, index) => (
                              <div key={index} className={`flex flex-col gap-6 py-4`}>
                                <Card element={transl} />
                              </div>
                            )) : <div><p className="text-center">{t('noTranslations')}</p></div>}
                          </div>
                        ) : cardsListID === 3 ? (
                          <div>
                            <h5 className='text-center'>
                              {t('enquiryType3')}
                            </h5>
                            {allTranslationsWithBranchIdLoading ? <div><span>Loading</span><span className="loading loading-spinner loading-md"></span></div> : allTranslationsWithBranchId?.data?.data[2]?.translation_docs.length > 0 ? allTranslationsWithBranchId?.data?.data[2]?.translation_docs.map((transl, index) => (
                              <div key={index} className={`flex flex-col gap-6 py-4`}>
                                <Card element={transl} />
                              </div>
                            )) : <div><p className="text-center">{t('noTranslations')}</p></div>}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                  {/* Section for normal screen */}
                  {screenWidth > 640 && (
                    <div className='w-full flex'>
                      {/* New translations */}
                      {showNewCards && (
                        <div className={`${filterStatus === 'new' ? 'w-full' : 'w-1/3'} px-6 transition-all duration-300`}>
                          <div className='flex justify-between items-center px-1 '>
                            <h3 className='text-center text-xl lg:text-2xl'>
                              {t('enquiryType1')}
                            </h3>
                            <span className={`h-fit w-fit rounded-full px-3 text-slate-400 border`}>
                              {allTranslationsWithBranchId?.data?.data[0]?.count || '0'}
                            </span>
                          </div>
                          <div className={`grid gap-4 py-4 ${filterStatus === 'new' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                            {allTranslationsWithBranchIdLoading ? <div><span>Loading</span><span className="loading loading-spinner loading-md"></span></div> : allTranslationsWithBranchId?.data?.data[0]?.translation_docs.length > 0 ? allTranslationsWithBranchId?.data?.data[0]?.translation_docs.map((transl, index) => (
                              <div key={index} className={``}>
                                <Card element={transl} />
                              </div>
                            )) : <div><p className='text-center'>{t('noTranslations')}</p></div>}
                          </div>
                        </div>
                      )}
                      {/* Processing translations */}
                      {showProcessingCards && (
                        <div className={`${filterStatus === 'processing' ? 'w-full' : 'w-1/3'} px-6 transition-all duration-300`}>
                          <div className='flex justify-between items-center px-1 '>
                            <h3 className='text-center text-xl lg:text-2xl'>
                              {t('enquiryType2')}
                            </h3>
                            <span className={`h-fit w-fit rounded-full px-3 text-slate-400 border`}>
                              {allTranslationsWithBranchId?.data?.data[1]?.count || '0'}
                            </span>
                          </div>
                          <div className={`grid gap-4 py-4 ${filterStatus === 'processing' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                            {allTranslationsWithBranchIdLoading ? <div><span>Loading</span><span className="loading loading-spinner loading-md"></span></div> : allTranslationsWithBranchId?.data?.data[1]?.translation_docs.length > 0 ? allTranslationsWithBranchId?.data?.data[1]?.translation_docs.map((transl, index) => (
                              <Fragment key={index}>
                                <div key={index} className={``}>
                                  <Card element={transl} />
                                </div>
                              </Fragment>
                            )) : <div><p className='text-center'>{t('noTranslations')}</p></div>}
                          </div>
                        </div>
                      )}
                      {/* Completed translations */}
                      {showCompletedCards && (
                        <div className={`${filterStatus === 'completed' ? 'w-full' : 'w-1/3'} px-6 transition-all duration-300`}>
                          <div className='flex justify-between items-center px-1 '>
                            <h3 className='text-center text-xl lg:text-2xl'>
                              {t('enquiryType3')}
                            </h3>
                            <span
                              className={`h-fit w-fit rounded-full px-3 text-slate-400 border`}
                            >
                              {allTranslationsWithBranchId?.data?.data[2]?.count || '0'}
                            </span>
                          </div>
                          <div className={`grid  gap-4 py-4 ${filterStatus === 'completed' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                            {allTranslationsWithBranchIdLoading ? <div><span>Loading</span><span className="loading loading-spinner loading-md"></span></div> : allTranslationsWithBranchId?.data?.data[2]?.translation_docs.length > 0 ? allTranslationsWithBranchId?.data?.data[2]?.translation_docs.map((transl, index) => (
                              <Fragment key={index}>
                                <div className={``}>
                                  <Card element={transl} />
                                </div>
                              </Fragment>
                            )) : <div><p className='text-center'>{t('noTranslations')}</p></div>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
        </Fragment>
      )}

      <ConfirmationModal
        isOpenConfirmModal={isOpenPasswordConfirmationModal}
        setIsOpenConfirmModal={setIsOpenPasswordConfirmationModal}
        className={'w-4/5 lg:w-2/5'}
      >

        <form className="flex flex-col gap-12 w-[90%] sm:w-4/5" autoComplete="off" onSubmit={handlePasswordSubmit}>

          <div className="flex flex-col gap-4 relative">
            <label htmlFor="password">
              {t('enterPassword')}:
            </label>
            <input
              id="password"
              type="text"
              name="password"
              className="input"
              value={passwordInputValue}
              onChange={(e) => setPasswordInputValue(e.target.value)}
              ref={passwordInputRef}
              autoComplete="off"
            />
            <span className="error-text absolute top-full left-0">{errorPasswordInputValue.length > 0 && errorPasswordInputValue}</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button
              className='bg-red-400 hover:bg-red-500 active:bg-red-400 dark:bg-red-900 dark:hover:bg-red-800 
              dark:active:bg-red-900'
              size={'btn-sm'}
              type={'button'}
              onClick={() => setIsOpenPasswordConfirmationModal(false)}
            >
              {t('profileCancel')}
            </Button>
            <Button
              className={'bg-green-400 hover:bg-green-500 active:bg-green-400 dark:bg-green-900 dark:hover:bg-green-800 dark:active:bg-green-900'}
              size={'btn-sm'}
              type='submit'
            >
              {t('confirm')}
            </Button>
          </div>

        </form>

      </ConfirmationModal>

    </div>
  );
};

export default BranchDetails;