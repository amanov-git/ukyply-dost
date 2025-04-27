import { Fragment, useEffect, useState } from "react";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import { GetMyTranslations } from "api/queries/getters";
import { useTranslation } from "react-i18next";
import Card from "shared/Card";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import GoBack from "shared/GoBack";
// Calendar
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// Icons
import { FaRegCalendar } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";

const UserProfileTranslations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const location = useLocation();

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const getStatusFromLocalStorage = () => {
    const storedStatus = localStorage.getItem('status');
    return storedStatus ? storedStatus : 'processing';
  };

  useEffect(() => {
    const statusFromStorage = getStatusFromLocalStorage();
    const currentStatus = searchParams.get('status');
    if (!currentStatus || (currentStatus !== 'processing' && currentStatus !== 'completed')) {
      searchParams.set('status', statusFromStorage);
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const status = searchParams.get('status') || getStatusFromLocalStorage();

  const type = searchParams.get('type') !== null ? searchParams.get('type') : '';
  const sortBy = searchParams.get('sort_by') !== null ? searchParams.get('sort_by') : 'doc_code';
  const order = searchParams.get('order') !== null ? searchParams.get('order') : '';
  const beginDate = searchParams.get('begin_dt') !== null ? searchParams.get('begin_dt') + 'T00:00:00' : '';
  const endDate = searchParams.get('end_dt') !== null ? searchParams.get('end_dt') + 'T23:59:59' : '';
  const search = searchParams.get('search') !== null ? searchParams.get('search') : '';

  const {
    data: myTranslations,
    isLoading: myTranslationsLoading,
  } = useQuery({
    queryKey: [
      'getMyTranslations',
      `status=${status}&type=${type}&sort_by=${sortBy}&order=${order}&begin_dt=${beginDate}&end_dt=${endDate}&search=${search}`
    ],
    queryFn: GetMyTranslations
  });

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    searchParams.set('status', selectedValue);
    setSearchParams(searchParams);
    localStorage.setItem('status', selectedValue);
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    searchParams.set('type', value);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const type = searchParams.get('type');
    if (type) {
      document.getElementById('type-select').value = type;
    }
  }, [searchParams]);

  const handleSortByChange = (e) => {
    const value = e.target.value;
    searchParams.set('sort_by', value);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const sortBy = searchParams.get('sort_by');
    if (sortBy) {
      document.getElementById('sortby-select').value = sortBy;
    }
  }, [searchParams]);

  const handleDescAscFilterChange = (e) => {
    const value = e.target.value;
    searchParams.set('order', value);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const order = searchParams.get('order');
    if (order) {
      document.getElementById('order-select').value = order;
    }
  }, [searchParams]);

  // Calendars
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [startFromDate, setStartFromDate] = useState(searchParams.get('begin_dt') || '2024-10-01');

  const [startToDate, setStartToDate] = useState(searchParams.get('end_dt') || moment(new Date()).format('YYYY-MM-DD'));

  useEffect(() => {
    if (location.pathname === '/user-profile-translations') {
      searchParams.set('begin_dt', startFromDate);
      searchParams.set('end_dt', startToDate);
      searchParams.delete('search');
      setSearchParams(searchParams);
      setError('');
    };
  }, [startFromDate, startToDate, location.pathname, inputValue]);

  // Handle submit search
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (inputValue.trim().length > 20) {
      setError(t('validationMax20Chars'))
    } else {
      searchParams.set('search', inputValue);
      setSearchParams(searchParams);
    };
  };

  return (
    <div className="container mx-auto px-8 md:px-0 flex flex-col gap-6">

      <Helmet>
        <title>
          {t('branchDetailsTranslations')}
        </title>
        <meta name='description' />
      </Helmet>

      {/* Go to dashboard button */}
      <div className="flex gap-4 items-center w-fit cursor-pointer px-6">
        <GoBack text="toDashboard" to={'/'} />
      </div>

      {/* Top section - filters */}
      <div className="flex justify-center px-6 gap-6 flex-col lg:flex-row">

        {/* Calendars, search input */}
        <div className='flex gap-4 flex-col sm:flex-row z-10 justify-center items-center'>

          <div className="flex flex-col sm:flex-row gap-4">

            {/* Calendar from date input 1 */}
            <div className='w-fit relative'>
              <DatePicker
                calendarClassName="dark:bg-slate-800 dark:border-none"
                dayClassName={() => 'dark:text-slate-300'}
                selected={startFromDate}
                onChange={(date) => setStartFromDate(moment(date).format('YYYY-MM-DD'))}
                dateFormat="dd-MM-yyyy"
                maxDate={startToDate}
                minDate={'2024-10-01'}
                customInput={
                  <input
                    className='input input-bordered input-sm w-36 bg-transparent dark:text-gray-300 custom-input-1'
                  />
                }
              />
              <FaRegCalendar
                className='absolute top-1/2 -translate-y-1/2 right-4'
                onClick={() => document.querySelector('.custom-input-1').focus()}
              />
            </div>

            {/* Calendar to date input 2 */}
            <div className='w-fit relative'>
              <DatePicker
                calendarClassName="dark:bg-slate-800 dark:border-none"
                dayClassName={() => 'dark:text-slate-300'}
                selected={startToDate}
                onChange={(date) => setStartToDate(moment(date).format('YYYY-MM-DD'))}
                dateFormat="dd-MM-yyyy"
                minDate={startFromDate}
                maxDate={new Date()}
                customInput={
                  <input
                    className='input  input-bordered input-sm w-36 bg-transparent dark:text-gray-300 custom-input-2'
                  />
                }
              />
              <FaRegCalendar
                className='absolute top-1/2 -translate-y-1/2 right-4'
                onClick={() => document.querySelector('.custom-input-2').focus()}
              />
            </div>
          </div>

          {/* Search input */}
          <form onSubmit={handleSubmit} className='relative w-full sm:w-fit'>
            <input
              className={`input input-bordered w-full sm:input-md relative`}
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

        </div>

        <div className="flex gap-4 flex-col sm:flex-row justify-center">
          {/* Filter - type */}
          <div className='flex'>
            <select
              className="select select-bordered w-full md:max-w-xs rounded-md dark:bg-secondary dark:border-none"
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

          {/* Filter - sort by */}
          <div className='flex'>
            <select
              className="select select-bordered w-full md:max-w-xs rounded-md dark:bg-secondary dark:border-none"
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

          {/* Filter - desc, asc */}
          <div className='flex'>
            <select
              className="select select-bordered w-full md:max-w-xs rounded-md dark:bg-secondary dark:border-none"
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


          {/* Filter - processing, completed */}
          <div>
            <select
              className="select select-bordered w-full md:w-40 md:max-w-xs rounded-md dark:bg-secondary dark:border-none"
              onChange={handleSelectChange}
              value={status}
            >
              <option value='processing'>
                {t('enquiryType2')}
              </option>
              <option value='completed'>
                {t('enquiryType3')}
              </option>
            </select>
          </div>
        </div>

      </div>

      {/* Content section */}
      <div>
        <div className={`w-full px-6 transition-all duration-300`}>
          <div className='flex justify-between items-center px-1 '>
            <h3 className='text-center'>
              {status === 'processing' ? t('enquiryType2') : t('enquiryType3')}
            </h3>
            <span className={`h-fit w-fit rounded-full px-3 text-slate-400 border`}>
              {myTranslations?.data?.data[0]?.count || '0'}
            </span>
          </div>
          <div className={`grid gap-4 py-4 grid-cols-1 md:grid-cols-3`}>
            {myTranslationsLoading
              ? <div><span>{t('loading')}</span><span className="loading loading-spinner loading-md"></span></div>
              : myTranslations?.data?.data[0]?.translation_docs.length > 0
                ? myTranslations?.data?.data[0]?.translation_docs?.map((transl, index) => (
                  <Fragment key={index}>
                    <div>
                      <Card element={transl} />
                    </div>
                  </Fragment>
                ))
                : <div className="text-center"><p>{t('noTranslations')}</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileTranslations;