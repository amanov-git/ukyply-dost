import { useState, useEffect, useRef } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import Button from 'shared/Button';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import roles from 'utils/roles';
import { canRenderComponent } from 'utils/roles';
import ConfirmationModal from 'shared/ConfirmationModal';
import logo from 'assets/images/ud-logo-removebg-preview.png';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { GetUser } from 'api/queries/getters';
import { setUser } from 'stores/userInfo';
// Icons
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross2 } from "react-icons/rx";
import { IoSearchSharp } from "react-icons/io5";
import { IoIosAddCircleOutline } from "react-icons/io";
import { GoPerson } from "react-icons/go";
import { FaRegCalendar } from "react-icons/fa";
// Calendar
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
  
const Header = () => {
  const [inputValue, setInputValue] = useState('');
  const [isOpenlogOutConfirmationModal, setIsOpenLogOutConfirmationModal] = useState(false);
  const [isOpenMainDropdown, setIsOpenMainDropdown] = useState(false);
  const [error, setError] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const refProfile = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refProfile.current && !refProfile.current.contains(event.target)) {
        setIsOpenProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refProfile]);

  const refMainDropdown = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refMainDropdown.current && !refMainDropdown.current.contains(event.target)) {
        setIsOpenMainDropdown(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpenMainDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [refMainDropdown]);

  // Dark light theme
  const { theme } = useSelector((state) => state.darkLightMode);
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')

    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme]);

  // Roles
  const { user } = useSelector(state => state.userInfo);
  const hasAccess = canRenderComponent(user, [roles.ADMIN, roles.OPERATOR]);
  const admin = canRenderComponent(user, [roles.ADMIN]);

  // Dropdown - user profile
  const [isOpenProfileDropdown, setIsOpenProfileDropdown] = useState(false);

  const handleProfileClick = () => {
    navigate('/user-profile');
    setIsOpenProfileDropdown(false);
  };

  const handleTranslationsClick = () => {
    navigate('/user-profile-translations?status=processing');
    setIsOpenProfileDropdown(false);
  };

  const handleChartClick = () => {
    navigate('/chart');
    setIsOpenProfileDropdown(false);
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('access_token');
    Cookies.remove('refreshToken');
    navigate('/login');
  };

  // Calendars
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [startFromDate, setStartFromDate] = useState(JSON.parse(localStorage.getItem('startFromDate')) || yesterday);
  const formattedFromDate = moment(startFromDate).format('YYYY-MM-DD');

  const [startToDate, setStartToDate] = useState(JSON.parse(localStorage.getItem('startToDate')) || new Date());
  const formattedToDate = moment(startToDate).format('YYYY-MM-DD');

  useEffect(() => {
    if (location.pathname === '/') {
      searchParams.set('begin_dt', formattedFromDate);
      searchParams.set('end_dt', formattedToDate);
      searchParams.delete('search');
      setSearchParams(searchParams);
      localStorage.setItem('startFromDate', JSON.stringify(startFromDate));
      localStorage.setItem('startToDate', JSON.stringify(startToDate));
      setError('');
    };
  }, [formattedFromDate, startFromDate, formattedToDate, startToDate, location.pathname, inputValue]);

  // Handle submit search
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (inputValue.trim().length > 20) {
      setError('Girizýän bahaňyz 20 harpdan köp bolmaly däl')
    } else {
      searchParams.set('search', inputValue);
      setSearchParams(searchParams);
    };
  };

  // --
  const handleClickLogout = () => {
    setIsOpenLogOutConfirmationModal(true);
    setIsOpenProfileDropdown(false);
  };

  const handleGoToDashboardClick = () => {
    navigate('/');
    searchParams.set('begin_dt', formattedFromDate);
    searchParams.set('end_dt', formattedToDate);
    setSearchParams(searchParams);
    setIsOpenMainDropdown(false);
  };

  const handleGoToLanguagesClick = () => {
    navigate('/languages');
    setIsOpenMainDropdown(false);
  };

  const handleGoToBranchesClick = () => {
    navigate('/branches');
    setIsOpenMainDropdown(false);
  };

  async function getUser() {
    const response = await GetUser()
    dispatch(setUser(response.data.data))
  };

  useEffect(() => {
    getUser();
  }, [location.pathname === '/']);

  return (
    <header
      className={`z-20 2xl:w-[1536px] mx-auto fixed top-0 right-0 left-0 flex flex-col items-center py-1 mb-10 border-b-[1px] gap-6 bg-gray-50 
        dark:border-b-slate-700 dark:bg-slate-800/50 backdrop-blur-md 
        ${location.pathname === '/' ? 'px-8 sm:justify-around lg:flex-row xl:gap-4 xl:px-0' : 'px-8 sm:justify-between sm:flex-row sm:gap-4'}`}
    >

      <div className='flex gap-2 sm:gap-8 xl:gap-10 items-center'>

        {/* Main dropdown (sidebar) */}
        <div className='relative'>

          <button
            className="w-8 h-8 active:text-[black] transition-all duration-400 outline-none"
            onClick={() => setIsOpenMainDropdown(!isOpenMainDropdown)}
          >
            {isOpenMainDropdown ? <RxCross2 className='w-full h-full' /> : <GiHamburgerMenu className='w-full h-full' />}
          </button>

          {isOpenMainDropdown && (
            <ul
              ref={refMainDropdown}
              className={`bg-slate-200 dark:bg-slate-800 dark:text-slate-300 menu rounded-box w-56 absolute top-14 left-0 z-10`}
            >
              <li onClick={handleGoToDashboardClick} className='hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md'><a>
                {t('listItemDashboard')}
              </a></li>
              {admin && (
                <Fragment>
                  <li onClick={handleGoToLanguagesClick} className='hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md'><a>
                    {t('listItemLang')}
                  </a></li>
                  <li onClick={handleGoToBranchesClick} className='hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md'><a>
                    {t('listItemBranch')}
                  </a></li>
                </Fragment>
              )}
            </ul>
          )}

        </div>

        {/* Logo image */}
        <div
          className='cursor-pointer w-32 h-20 flex justify-center items-center'
          onClick={() => navigate(`/?begin_dt=${formattedFromDate}&end_dt=${formattedToDate}`)}
        >
          <img className='w-4/5' src={logo} alt="Logo" />
        </div>

        {/* Calendars */}
        <div className='flex flex-col gap-3 scale-75 sm:scale-100 sm:flex-row sm:gap-6 z-10 '>

          {/* Calendar from date input 1 */}
          {location.pathname === '/' ? (
            <div className='w-fit relative'>
              <DatePicker
                calendarClassName="dark:bg-slate-800 dark:border-none"
                dayClassName={() => 'dark:text-slate-300'}
                selected={startFromDate}
                onChange={(date) => setStartFromDate(date)}
                dateFormat="dd-MM-yyyy"
                maxDate={formattedToDate}
                minDate={'2024-10-01'}
                customInput={
                  <input
                    className='input input-bordered input-sm w-36 bg-transparent dark:text-gray-300 custom-input-1'
                  // value={formattedDate}
                  />
                }
              />
              <FaRegCalendar
                className='absolute top-1/2 -translate-y-1/2 right-4'
                onClick={() => document.querySelector('.custom-input-1').focus()}
              />
            </div>
          ) : null}

          {/* Calendar to date input 2 */}
          {location.pathname === '/' ? (
            <div className='w-fit relative'>
              <DatePicker
                calendarClassName="dark:bg-slate-800 dark:border-none"
                dayClassName={() => 'dark:text-slate-300'}
                selected={startToDate}
                onChange={(date) => setStartToDate(date)}
                dateFormat="dd-MM-yyyy"
                minDate={formattedFromDate}
                maxDate={new Date()}
                customInput={
                  <input
                    className='input  input-bordered input-sm w-36 bg-transparent dark:text-gray-300 custom-input-2'
                  // value={formattedToDate}
                  />
                }
              />
              <FaRegCalendar
                className='absolute top-1/2 -translate-y-1/2 right-4'
                onClick={() => document.querySelector('.custom-input-2').focus()}
              />
            </div>
          ) : null}

        </div>

      </div>

      {/* Search input */}
      {location.pathname === '/' && (
        <form onSubmit={handleSubmit} className='relative'>
          <input
            className={`input input-bordered input-md w-[300px] xl:w-[400px] relative`}
            type="text"
            id='applicationCode'
            name='applicationCode'
            value={inputValue}
            placeholder={t('headerInputPlaceholder')}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {error && <span className='absolute top-full left-0 error-text'>{error}</span>}
          <button type='submit' className='w-6 h-6 absolute top-1/2 -translate-y-1/2 right-4 text-black'>
            <IoSearchSharp className='w-full h-full text-slate-400' />
          </button>
        </form>
      )}

      <div className={`w-fit flex items-center gap-6 lg:gap-4 xl:gap-6`}>
        {/* Add translation button */}
        {hasAccess && (
          <div className="tooltip tooltip-bottom tooltip-primary dark:tooltip-secondary -mb-2" data-tip={t('headerTooltip')}>
            <button
              type='button'
              className='size-12 active:scale-75 transition-all text-gray-500 dark:text-gray-300 p-2 hover:bg-gray-100 rounded-full active:bg-gray-200 dark:hover:bg-gray-700  dark:active:bg-gray-600'
              onClick={() => navigate('/add-new-enquiry')}
            >
              <IoIosAddCircleOutline className='w-full h-full' />
            </button>
          </div>
        )}

        {/* User profile dropdown */}
        <div className='w-full relative -mb-2' ref={refProfile}>

          <div className="tooltip tooltip-bottom tooltip-primary dark:tooltip-secondary relative" data-tip={t('headerUserTooltip')}>
            <button type='button' className='size-11 active:scale-75 transition-all text-gray-500 dark:text-gray-300 p-2 hover:bg-gray-100 rounded-full active:bg-gray-200 dark:hover:bg-gray-700  dark:active:bg-gray-600 ' onClick={() => setIsOpenProfileDropdown(!isOpenProfileDropdown)}>
              <GoPerson className='w-full h-full' />
            </button>
            {user?.processing_translation_count > 0 && (
              <span className='rounded-full bg-orange-500 w-3 h-3 absolute top-1 right-2'></span>
            )}
          </div>

          {isOpenProfileDropdown && (
            <ul
              className="border dark:border-slate-700 rounded-md bg-white dark:bg-secondary absolute top-full left-1/5 
              -translate-x-1/2 z-10 w-32 text-black dark:text-white text-center text-sm"
            >

              <li className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700  p-2 rounded-md" onClick={handleProfileClick} >
                {t('profile')}
              </li>

              <li className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2  rounded-md" onClick={handleTranslationsClick}>
                <div className='flex justify-center items-center relative'>
                  {t('branchDetailsTranslations')}

                  {user?.processing_translation_count > 0 && (
                    <span
                      className='rounded-full bg-red-500 text-slate-50 dark:text-slate-300 dark:bg-red-700 text-xs px-1 absolute top-1/2 -translate-y-1/2 right-1'
                    >
                      {user?.processing_translation_count}
                    </span>
                  )}

                </div>
              </li>

              <li
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
                onClick={handleChartClick}
              >
                {t('chart')}
              </li>

              <li
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
                onClick={handleClickLogout}
              >
                {t('logOut')}
              </li>

            </ul>
          )}
        </div>

      </div>
      <ConfirmationModal
        isOpenConfirmModal={isOpenlogOutConfirmationModal}
        setIsOpenConfirmModal={setIsOpenLogOutConfirmationModal}
      >
        <div className='flex flex-col gap-10'>
          <h5 className='text-black dark:text-white'>
            {t('logOutConfirmation')}
          </h5>
          <div className='flex gap-4 w-full justify-end'>
            <Button className='max-w-sm' size='btn-sm' onClick={handleLogoutClick}>
              {t('langDeleteConfirmationYes')}
            </Button>
            <Button className='max-w-sm' onClick={() => setIsOpenLogOutConfirmationModal(false)} size='btn-sm'>
              {t('langDeleteConfirmationNo')}
            </Button>
          </div>
        </div>
      </ConfirmationModal>
    </header>
  );
};


export default Header;