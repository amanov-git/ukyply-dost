import { useState, useRef } from 'react';
import { useEffect } from 'react';
import Card from 'shared/Card'
import { useTranslation } from "react-i18next";
import { Fragment } from 'react';
import { GetAllTranslations } from 'api/queries/getters';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import roles from 'utils/roles';
import { canRenderComponent } from 'utils/roles';
import { useSearchParams } from 'react-router-dom';
import socketIOclient from 'socket.io-client';
import { tokenStorage } from 'utils/storage';
import { Helmet } from 'react-helmet-async';
import { GetAllBranches } from 'api/queries/getters';
import { GetUsersShortInfo } from 'api/queries/getters';
import Button from 'shared/Button';
import { IoMdArrowDropdown } from "react-icons/io";
import { useLocation } from 'react-router-dom';
// Icons
import { MdFiberNew } from "react-icons/md";
import { SiProcesswire } from "react-icons/si";
import { SiTicktick } from "react-icons/si";
import { PURE_BASE_URL } from 'api/axiosInstance';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const allParams = searchParams.toString();
  const location = useLocation();
  const { t } = useTranslation();

  const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowWidth;
  };

  const windowWidth = useWindowWidth();

  const [cardsListID, setCardsListID] = useState(Number(localStorage.getItem('cardsListId')) || 1);

  const [filterStatus, setFilterStatus] = useState(localStorage.getItem('dashboardShowStatus'));

  const [showNewCards, setShowNewCards] = useState(false);
  const [showProcessingCards, setShowProcessingCards] = useState(false);
  const [showCompletedCards, setShowCompletedCards] = useState(false);

  const [isOpenUsersFilterDropdown, setIsOpenUsersFilterDropdown] = useState(false);

  // Roles
  const { user } = useSelector(state => state.userInfo);

  const adminOperatorRoles = canRenderComponent(user, [roles.ADMIN, roles.OPERATOR]);
  const operatorRole = canRenderComponent(user, [roles.OPERATOR]);
  const adminRole = canRenderComponent(user, [roles.ADMIN]);
  const translatorRole = canRenderComponent(user, [roles.TRANSLATOR]);
  const accountantRole = canRenderComponent(user, [roles.ACCOUNTANT]);

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

  const beginDate = searchParams.get('begin_dt') !== null ? searchParams.get('begin_dt') + 'T00:00:00' : '';
  const endDate = searchParams.get('end_dt') !== null ? searchParams.get('end_dt') + 'T23:59:59' : '';
  const search = searchParams.get('search') !== null ? searchParams.get('search') : '';
  const order = searchParams.get('order') !== null ? searchParams.get('order') : '';
  const sortBy = searchParams.get('sort_by') !== null ? searchParams.get('sort_by') : 'doc_code';
  const type = searchParams.get('type') !== null ? searchParams.get('type') : '';
  const branchId = searchParams.get('branch_id') !== null ? searchParams.get('branch_id') : '';
  const userId = searchParams.get('user_id') !== null ? searchParams.get('user_id') : '';

  const {
    data: allTranslations,
    refetch: refetchAllTranslations,
    isLoading: allTranslationsLoading,
  } = useQuery({
    queryKey: [
      'getAllTranslations',
      '?' + `begin_dt=${beginDate}&end_dt=${endDate}&search=${search}&order=${order}&sort_by=${sortBy}&type=${type}&branch_id=${branchId}&user_id=${operatorRole ? user?.user_id : userId}`
    ],
    queryFn: GetAllTranslations,
  });

  const {
    data: allBranches,
  } = useQuery({
    queryKey: ['getAllBranches'],
    queryFn: GetAllBranches,
    enabled: adminOperatorRoles ? true : false
  });

  const {
    data: usersShortInfo,
  } = useQuery({
    queryKey: ['getUsersShortInfo'],
    queryFn: GetUsersShortInfo,
    enabled: adminOperatorRoles ? true : false
  });

  // Socket
  useEffect(() => {
    const token = tokenStorage.getToken();

    if (token) {

      const socket = socketIOclient(PURE_BASE_URL, {
        auth: { token },
        transports: ['websocket'],
        secure: true
      });

      socket.on('added_new_translation', (data) => {
        refetchAllTranslations();
      });

      socket.on('updated_translation', (data) => {
        refetchAllTranslations();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    refetchAllTranslations();
  }, [location.pathname === '/', allParams]);

  useEffect(() => {
    const savedFilterStatus = localStorage.getItem('filterStatus') || '';
    if (savedFilterStatus) {
      setFilterStatus(savedFilterStatus);
    }
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    localStorage.setItem('filterStatus', value);
  };

  const handleDescAscFilterChange = (e) => {
    const value = e.target.value;
    searchParams.set('order', value || '');
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const order = searchParams.get('order') || '';
    if (order) {
      document.getElementById('order-select').value = order;
    }
  }, [searchParams]);

  const handleSortByChange = (e) => {
    const value = e.target.value;
    searchParams.set('sort_by', value || '');
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const sortBy = searchParams.get('sort_by') || '';
    if (sortBy) {
      document.getElementById('sortby-select').value = sortBy;
    }
  }, [searchParams]);

  const handleTypeChange = (e) => {
    const value = e.target.value;
    searchParams.set('type', value || '');
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const type = searchParams.get('type') || '';
    if (type) {
      document.getElementById('type-select').value = type;
    }
  }, [searchParams]);

  const handleBranchChange = (e) => {
    const value = e.target.value;
    searchParams.set('branch_id', value || '');
    setSearchParams(searchParams);
  }

  useEffect(() => {
    const branchId = searchParams.get('branch_id') || '';
    if (branchId) {
      document.getElementById('branch-id-select').value = branchId;
    }
  }, [searchParams]);

  const handleUserFilterChange = (user) => {
    searchParams.set('user_id', user.user_id);
    setSearchParams(searchParams);
    setIsOpenUsersFilterDropdown(false);
  };

  const handleAllUsersClick = () => {
    searchParams.set('user_id', '');
    setSearchParams(searchParams);
    setIsOpenUsersFilterDropdown(false);
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

  const handleCardsListIdClick = (id) => {
    setCardsListID(id);
    localStorage.setItem('cardsListId', JSON.stringify(id));
    setSearchParams(searchParams);
  };

  // Sends request for showing notifications
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
          .then(permission => {
            if (permission === 'granted') {
              console.log('Notification permission granted.');
            } else if (permission === 'denied') {
              console.log('Notification permission denied.');
            }
          })
          .catch(err => {
            console.error('Notification permission error:', err);
          });
      }
    } else {
      console.log('Notifications are not supported by this browser.');
    }
  }, []);

  // ref users' dropdown
  const refUsersDropdown = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refUsersDropdown.current && !refUsersDropdown.current.contains(event.target)) {
        setIsOpenUsersFilterDropdown(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpenUsersFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [refUsersDropdown]);

  // Checks user_id param
  useEffect(() => {
    const userIds = usersShortInfo?.data?.data?.map((user) => String(user.user_id));
    const checkParam = userIds?.length > 0 && userIds?.some((userId) => userId === searchParams.get('user_id')) || searchParams.get('user_id') === '';
    if (usersShortInfo?.data?.data !== undefined) {
      if (searchParams.get('user_id')) {
        if (!checkParam) {
          searchParams.delete('user_id');
          setSearchParams(searchParams);
        }
      }
    }
  }, [usersShortInfo?.data?.data, searchParams]);

  return (
    <Fragment>

      <Helmet>
        <title>
          {t('listItemDashboard')}
        </title>
        <meta name='description' />
      </Helmet>

      {/* Admin, operator roles */}
      {adminOperatorRoles
        ? (
          <div className='container mx-auto px-8 sm:px-0 flex flex-col gap-10 pt-28 lg:pt-4'>

            <div className='flex gap-6 px-6 flex-col items-center xl:flex-row xl:justify-center'>

              <div className='flex gap-6 justify-around'>

                {adminRole
                  ? (
                    <Fragment>
                      {/* Filter - users */}
                      {windowWidth > 640 ? (
                        <div
                          className='relative'
                          ref={refUsersDropdown}
                        >

                          <Button
                            className='rounded-md shadow-none bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-800'
                            onClick={() => setIsOpenUsersFilterDropdown(!isOpenUsersFilterDropdown)}
                          >
                            <div className='flex items-center gap-6'>

                              <div className='flex flex-col gap-1 py-2'>

                                <span className='text-slate-600 dark:text-slate-300'>
                                  {searchParams.get('user_id')
                                    ? (
                                      usersShortInfo?.data?.data.filter((user) => (
                                        String(user.user_id) === searchParams.get('user_id')
                                      ))[0]?.username
                                    )
                                    : t('branchDetailsAllUsers')}
                                </span>

                                <span className='text-xs text-slate-400'>
                                  {searchParams.get('user_id') ? usersShortInfo?.data?.data.filter((user) => (
                                    String(user.user_id) === searchParams.get('user_id')
                                  ))[0]?.fullname : null}
                                </span>

                              </div>

                              <IoMdArrowDropdown className='text-slate-600 dark:text-slate-200' />

                            </div>
                          </Button>

                          {isOpenUsersFilterDropdown && (
                            <ul
                              className={`bg-slate-200 dark:border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-md
                      w-52 absolute top-[110%] left-0 z-10`}
                            >
                              <li
                                className='hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md p-2 cursor-pointer px-5'
                                onClick={handleAllUsersClick}
                              >
                                <span>
                                  {t('branchDetailsAllUsers')}
                                </span>
                              </li>
                              {usersShortInfo?.data?.data.map((user, index) => (
                                <li
                                  key={index}
                                  className='hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md p-2 cursor-pointer px-5'
                                  onClick={() => handleUserFilterChange(user)}
                                >
                                  <div className='flex flex-col items-start gap-0'>
                                    <span>
                                      {user.username}
                                    </span>
                                    <span className='text-xs text-slate-500'>
                                      {user.fullname}
                                    </span>
                                  </div>
                                </li>
                              ))}

                            </ul>
                          )}
                        </div>
                      ) : null}

                      {/* Filter - branches */}
                      {windowWidth > 640 && (
                        <div className='flex justify-end'>
                          <select
                            className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                            id="branch-id-select"
                            onChange={handleBranchChange}
                            value={searchParams.get('branch_id') || ''}
                          >

                            <option value="">
                              {t('branchDetailsAllBranches')}
                            </option>

                            {allBranches?.data?.data.map((branch) => (
                              <option key={branch.branch_id} value={branch.branch_id}>
                                {branch.branch_name}
                              </option>
                            ))}

                          </select>
                        </div>
                      )}
                    </Fragment>
                  )
                  : null}

                {/* Filter - type */}
                {windowWidth > 640 && (
                  <div className='flex justify-end'>
                    <select
                      className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                      id="type-select"
                      onChange={handleTypeChange}
                    >

                      <option value="">
                        {t('allTypes')}
                      </option>

                      <option value='urgent'>
                        {t('urgent')}
                      </option>

                      <option value="normal">
                        {t('normal')}
                      </option>

                    </select>
                  </div>
                )}
              </div>

              <div className='flex gap-6 justify-around'>

                {/* Filter - sort by */}
                {windowWidth > 640 && (
                  <div className='flex justify-end'>
                    <select
                      className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                      id="sortby-select"
                      onChange={handleSortByChange}
                    >

                      <option value='doc_code'>
                        {t('translationCode')}
                      </option>

                      <option value='created_at'>
                        {t('createdAt')}
                      </option>

                      <option value="type">
                        {t('type')}
                      </option>

                      <option value="status">
                        {t('branchDetailsStatus')}
                      </option>

                    </select>
                  </div>
                )}

                {/* Filter - desc, asc */}
                {windowWidth > 640 && (
                  <div className='flex justify-end'>
                    <select
                      className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                      id="order-select"
                      onChange={handleDescAscFilterChange}
                    >

                      <option value='asc'>
                        {t('asc')}
                      </option>

                      <option value='desc'>
                        {t('desc')}
                      </option>

                    </select>
                  </div>
                )}

                {/* Filter - new, processing, completed */}
                {windowWidth > 640 && (
                  <div className='flex justify-end'>
                    <select
                      className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                      value={filterStatus || ''}
                      onChange={handleFilterChange}
                    >
                      <option value='all'>{t('branchDetailsAll')}</option>
                      <option value='new'>{t('enquiryType1')}</option>
                      <option value='processing'>{t('enquiryType2')}</option>
                      <option value='completed'>{t('enquiryType3')}</option>
                    </select>
                  </div>
                )}
              </div>

            </div>

            <div className='flex flex-col sm:flex-row gap-16 sm:gap-0'>

              {/* Heading with icons for mobile version */}
              {windowWidth < 600 && (
                <div className='flex flex-col gap-10 -mt-20'>
                  <div className='flex w-full justify-center items-center gap-10 px-6'>
                    {cardsList.map(({ id, icon: Icon }) => (
                      <Fragment key={id}>
                        <button
                          className={`${cardsListID === id && 'scale-125 transition-all duration-500'} 
                      ${id === 3 || id === 2 ? 'w-8 h-8' : 'w-10 h-10'}`}
                          // onClick={() => setCardsListID(id)}
                          onClick={() => handleCardsListIdClick(id)}
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
                        {allTranslations?.data?.data[0]?.translation_docs.length > 0 ? allTranslations?.data?.data[0]?.translation_docs.map((transl, index) => (
                          <div key={index} className={`flex flex-col gap-6 py-4`}>
                            <Card element={transl} />
                          </div>
                        )) : <div className='text-center'><h6>{t('noTranslations')}</h6></div>}
                      </div>
                    ) : cardsListID === 2 ? (
                      <div>
                        <h5 className='text-center'>
                          {t('enquiryType2')}
                        </h5>
                        {allTranslations?.data?.data[1]?.translation_docs.length > 0 ? allTranslations?.data?.data[1]?.translation_docs.map((transl, index) => (
                          <div key={index} className={`flex flex-col gap-6 py-4`}>
                            <Card element={transl} />
                          </div>
                        )) : <div className='text-center'><h6>{t('noTranslations')}</h6></div>}
                      </div>
                    ) : cardsListID === 3 ? (
                      <div>
                        <h5 className='text-center'>
                          {t('enquiryType3')}
                        </h5>
                        {allTranslations?.data?.data[2]?.translation_docs.length > 0 ? allTranslations?.data?.data[2]?.translation_docs.map((transl, index) => (
                          <div key={index} className={`flex flex-col gap-6 py-4`}>
                            <Card element={transl} />
                          </div>
                        )) : <div className='text-center'><h6>{t('noTranslations')}</h6></div>}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Section for normal screen */}
              {windowWidth > 640 && (
                <div className='w-full flex'>

                  {/* New translations */}
                  {showNewCards && (
                    <div className={`${filterStatus === 'new' ? 'w-full' : 'w-1/3'} px-6 transition-all duration-300`}>
                      <div className='flex justify-between items-center px-1 '>
                        <h3 className='text-center text-base sm:text-sm lg:text-2xl flex items-center gap-1'>
                          {t('enquiryType1')} <span className="inline-block size-3 lg:size-4 bg-blue-700 rounded-full"></span>
                        </h3>
                        <span className={`h-fit w-fit rounded-full px-3 text-sm lg:text-base text-slate-400 border`}>
                          {allTranslations?.data?.data[0]?.count || '0'}
                        </span>
                      </div>
                      <div className={`grid gap-4 py-4 ${filterStatus === 'new' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {allTranslationsLoading
                          ? <div className='flex items-center'><span>{t('loading')}</span><span className='loading loading-spinner loading-md'></span></div>
                          : allTranslations?.data?.data[0]?.translation_docs.length > 0
                            ? allTranslations?.data?.data[0]?.translation_docs.map((transl, index) => (
                              <div key={index} className={``}>
                                <Card element={transl} />
                              </div>
                            ))
                            : <div className='text-center'><h6>{t('noTranslations')}</h6></div>}
                      </div>
                    </div>
                  )}

                  {/* Processing translations */}
                  {showProcessingCards && (
                    <div className={`${filterStatus === 'processing' ? 'w-full' : 'w-1/3'} px-6 transition-all duration-300`}>
                      <div className='flex justify-between items-center px-1 '>
                        <h3 className='text-center text-base sm:text-sm lg:text-2xl flex items-center gap-1'>
                          {t('enquiryType2')} <span className="inline-block size-3 lg:size-4 bg-orange-600 rounded-full"></span>
                        </h3>
                        <span className={`h-fit w-fit rounded-full px-3 text-sm lg:text-base text-slate-400 border`}>
                          {allTranslations?.data?.data[1]?.count || '0'}
                        </span>
                      </div>
                      <div className={`grid gap-4 py-4 ${filterStatus === 'processing' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {allTranslationsLoading
                          ? <div className='flex items-center'><span>{t('loading')}</span><span className='loading loading-spinner loading-md'></span></div>
                          : allTranslations?.data?.data[1]?.translation_docs.length > 0
                            ? allTranslations?.data?.data[1]?.translation_docs.map((transl, index) => (
                              <Fragment key={index}>
                                <div key={index} className={``}>
                                  <Card element={transl} />
                                </div>
                              </Fragment>
                            ))
                            : <div className='text-center'><h6>{t('noTranslations')}</h6></div>}
                      </div>
                    </div>
                  )}

                  {/* Completed translations */}
                  {showCompletedCards && (
                    <div className={`${filterStatus === 'completed' ? 'w-full' : 'w-1/3'} px-6 transition-all duration-300`}>
                      <div className='flex justify-between items-center px-1 '>
                        <h3 className='text-center text-base sm:text-sm lg:text-2xl flex items-center gap-1'>
                          {t('enquiryType3')} <span className="inline-block size-3 lg:size-4 bg-green-500 rounded-full"></span>
                        </h3>
                        <span
                          className={`h-fit w-fit rounded-full px-3 text-sm lg:text-base text-slate-400 border`}
                        >
                          {allTranslations?.data?.data[2]?.count || '0'}
                        </span>
                      </div>
                      <div className={`grid gap-4 py-4 ${filterStatus === 'completed' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {allTranslationsLoading
                          ? <div>{t('loading')}<span className='loading loading-spinner loading-md'></span></div>
                          : allTranslations?.data?.data[2]?.translation_docs.length > 0
                            ? allTranslations?.data?.data[2]?.translation_docs.map((transl, index) => (
                              <Fragment key={index}>
                                <div>
                                  <Card element={transl} />
                                </div>
                              </Fragment>
                            ))
                            : <div className='text-center'><h6>{t('noTranslations')}</h6></div>}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        )
        : null}

      {/* Translator role */}
      {translatorRole
        ? (
          <div className='container mx-auto px-8 sm:px-0 flex flex-col gap-10 pt-28 lg:pt-4'>

            <div className='flex gap-6 px-6 items-center justify-center'>

              {/* Filter - type */}
              {windowWidth > 640 && (
                <div className='flex justify-end'>
                  <select
                    className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                    id="type-select"
                    onChange={handleTypeChange}
                  >

                    <option value="">
                      {t('allTypes')}
                    </option>

                    <option value='urgent'>
                      {t('urgent')}
                    </option>

                    <option value="normal">
                      {t('normal')}
                    </option>

                  </select>
                </div>
              )}

              {/* Filter - sort by */}
              {windowWidth > 640 && (
                <div className='flex justify-end'>
                  <select
                    className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                    id="sortby-select"
                    onChange={handleSortByChange}
                  >

                    <option value='doc_code'>
                      {t('translationCode')}
                    </option>

                    <option value='created_at'>
                      {t('createdAt')}
                    </option>

                    <option value="type">
                      {t('type')}
                    </option>

                    <option value="update_at">
                      {t('byUpdate')}
                    </option>

                    <option value="status">
                      {t('branchDetailsStatus')}
                    </option>

                  </select>
                </div>
              )}

              {/* Filter - desc, asc */}
              {windowWidth > 640 && (
                <div className='flex justify-end'>
                  <select
                    className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                    id="order-select"
                    onChange={handleDescAscFilterChange}
                  >

                    <option value='asc'>
                      {t('asc')}
                    </option>

                    <option value='desc'>
                      {t('desc')}
                    </option>

                  </select>
                </div>
              )}

            </div>

            <div className={`px-6 transition-all duration-300`}>
              <div className='flex justify-between items-center px-1'>
                <h3 className='text-center text-xl lg:text-2xl'>
                  {t('enquiryType1')}
                </h3>
                <span className={`h-fit w-fit rounded-full px-3 text-slate-400 border`}>
                  {allTranslations?.data?.data[0]?.count || '0'}
                </span>
              </div>
              <div className={`grid gap-4 py-4 grid-cols-1 md:grid-cols-3`}>
                {allTranslationsLoading ? <div><span>{t('loading')}</span><span className='loading loading-spinner loading-md'></span></div> : allTranslations?.data?.data[0]?.translation_docs.length > 0 ? allTranslations?.data?.data[0]?.translation_docs.map((transl, index) => (
                  <div key={index}>
                    <Card element={transl} />
                  </div>
                )) : <div className='text-center'><h6>{t('noTranslations')}</h6></div>}
              </div>
            </div>

          </div>
        )
        : null}

      {/* Accountant role */}
      {accountantRole
        ? (
          <div className='container mx-auto px-8 sm:px-0 flex flex-col gap-10 pt-28 lg:pt-4'>

            {/* Filters section */}
            <div className='flex flex-col lg:flex-row gap-6 px-6 items-center justify-center'>

              {/* Wrapper - filter users, filter branches */}
              <div className='flex gap-6'>
                {/* Filter - users */}
                {windowWidth > 640 ? (
                  <div
                    className='relative'
                    ref={refUsersDropdown}
                  >

                    <Button
                      className='rounded-md shadow-none bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-800'
                      onClick={() => setIsOpenUsersFilterDropdown(!isOpenUsersFilterDropdown)}
                    >
                      <div className='flex items-center gap-6'>

                        <div className='flex flex-col gap-1 py-2'>

                          <span className='text-slate-600 dark:text-slate-300'>
                            {searchParams.get('user_id')
                              ? (
                                usersShortInfo?.data?.data.filter((user) => (
                                  String(user.user_id) === searchParams.get('user_id')
                                ))[0]?.username
                              )
                              : t('branchDetailsAllUsers')}
                          </span>

                          <span className='text-xs text-slate-400'>
                            {searchParams.get('user_id') ? usersShortInfo?.data?.data.filter((user) => (
                              String(user.user_id) === searchParams.get('user_id')
                            ))[0]?.fullname : null}
                          </span>

                        </div>

                        <IoMdArrowDropdown className='text-slate-600 dark:text-slate-200' />

                      </div>
                    </Button>

                    {isOpenUsersFilterDropdown && (
                      <ul
                        className={`bg-slate-200 dark:border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-md
                      w-52 absolute top-[110%] left-0 z-10`}
                      >
                        <li
                          className='hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md p-2 cursor-pointer px-5'
                          onClick={handleAllUsersClick}
                        >
                          <span>
                            {t('branchDetailsAllUsers')}
                          </span>
                        </li>
                        {usersShortInfo?.data?.data.map((user, index) => (
                          <li
                            key={index}
                            className='hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md p-2 cursor-pointer px-5'
                            onClick={() => handleUserFilterChange(user)}
                          >
                            <div className='flex flex-col items-start gap-0'>
                              <span>
                                {user.username}
                              </span>
                              <span className='text-xs text-slate-500'>
                                {user.fullname}
                              </span>
                            </div>
                          </li>
                        ))}

                      </ul>
                    )}
                  </div>
                ) : null}

                {/* Filter - branches */}
                {windowWidth > 640 && (
                  <div className='flex justify-end'>
                    <select
                      className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                      id="branch-id-select"
                      onChange={handleBranchChange}
                      value={searchParams.get('branch_id') || ''}
                    >

                      <option value="">
                        {t('branchDetailsAllBranches')}
                      </option>

                      {allBranches?.data?.data.map((branch) => (
                        <option key={branch.branch_id} value={branch.branch_id}>
                          {branch.branch_name}
                        </option>
                      ))}

                    </select>
                  </div>
                )}
              </div>

              {/* Wrapper - filter type, filter sort by, filter desc, asc */}
              <div className='flex gap-6'>
                {/* Filter - type */}
                {windowWidth > 640 && (
                  <div className='flex justify-end'>
                    <select
                      className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                      id="type-select"
                      onChange={handleTypeChange}
                    >

                      <option value="">
                        {t('allTypes')}
                      </option>

                      <option value='urgent'>
                        {t('urgent')}
                      </option>

                      <option value="normal">
                        {t('normal')}
                      </option>

                    </select>
                  </div>
                )}

                {/* Filter - sort by */}
                {windowWidth > 640 && (
                  <div className='flex justify-end'>
                    <select
                      className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                      id="sortby-select"
                      onChange={handleSortByChange}
                    >

                      <option value='doc_code'>
                        {t('translationCode')}
                      </option>

                      <option value='created_at'>
                        {t('createdAt')}
                      </option>

                      <option value="type">
                        {t('type')}
                      </option>

                      <option value="update_at">
                        {t('byUpdate')}
                      </option>

                      <option value="status">
                        {t('branchDetailsStatus')}
                      </option>

                    </select>
                  </div>
                )}

                {/* Filter - desc, asc */}
                {windowWidth > 640 && (
                  <div className='flex justify-end'>
                    <select
                      className="select select-bordered max-w-xs rounded-md dark:bg-secondary dark:border-none"
                      id="order-select"
                      onChange={handleDescAscFilterChange}
                    >

                      <option value='asc'>
                        {t('asc')}
                      </option>

                      <option value='desc'>
                        {t('desc')}
                      </option>

                    </select>
                  </div>
                )}
              </div>


            </div>

            {/* Content section */}
            <div className={`px-6 transition-all duration-300`}>
              <div className='flex justify-between items-center px-1'>
                <h3 className='text-center text-xl lg:text-2xl'>
                  {t('enquiryType3')}
                </h3>
                <span className={`h-fit w-fit rounded-full px-3 text-slate-400 border`}>
                  {allTranslations?.data?.data[2]?.count || '0'}
                </span>
              </div>
              <div className={`grid gap-4 py-4 grid-cols-1 md:grid-cols-3`}>
                {allTranslationsLoading
                  ? <div><span>{t('loading')}</span><span className='loading loading-spinner loading-md'></span></div>
                  : allTranslations?.data?.data[2]?.translation_docs.length > 0
                    ? allTranslations?.data?.data[2]?.translation_docs.map((transl, index) => (
                      <div key={index}>
                        <Card element={transl} />
                      </div>
                    ))
                    : <div className='text-center'><h6>{t('noTranslations')}</h6></div>}
              </div>
            </div>

          </div>
        )
        : null}

    </Fragment >
  )
};

export default Dashboard;