import momentTurkmen from 'libs/moment-turkmen'
import { Link } from "react-router-dom";
import { t } from 'i18next'
import { GoTrash } from "react-icons/go";
import ConfirmationModal from './ConfirmationModal';
import { useState } from 'react';
import Button from './Button';
import { DeleteNewTranslation } from 'api/queries/put';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import roles, { canRenderComponent } from 'utils/roles';
import { Fragment } from 'react';
import handleAxiosError from 'utils/handleAxiosError';

const Card = ({ element }) => {

  const [isOpenDeleteTranslConfirmModal, setIsOpenDeleteTranslConfirmModal] = useState(false);
  const [isLoadingDeleteNewTransl, setIsLoadingDeleteNewTransl] = useState(false);

  const { user } = useSelector(state => state.userInfo);
  const hasAccess = canRenderComponent(user, [roles.ADMIN, roles.OPERATOR]);

  const deleteNewTranslation = async (guid) => {
    setIsLoadingDeleteNewTransl(true);
    try {
      const response = await DeleteNewTranslation(guid);
      console.log('response: ', response);
      if (response) {
        toast.success(response?.data?.msg);
        setIsOpenDeleteTranslConfirmModal(false);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
      }
    } finally {
      setIsLoadingDeleteNewTransl(false);
    }
  };

  return (
    <Link
      to={`/card-details/${element.guid}`}
      className={`rounded-md p-4 h-36 flex flex-col justify-center shadow-sm gap-1 dark:text-slate-300 cursor-pointer
        ${element.type === 'urgent'
          ? `border-l-4 border-red-400 bg-red-100 hover:bg-red-200 active:bg-red-200 dark:bg-second-dark-bg-color 
            dark:border-red-900 dark:hover:bg-slate-800 dark:active:bg-second-dark-bg-color`
          : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-200 dark:bg-second-dark-bg-color dark:hover:bg-slate-800 dark:active:bg-second-dark-bg-color'}`}
    >

      <div className="flex justify-between">

        <p className="underline underline-offset-4 text-sm lg:text-base">
          {element.doc_code}
        </p>

        <div className='flex lg:items-center lg:gap-2'>

          {/* Urgent red element */}
          {element.type === 'urgent' && (
            <div
              className={`scale-100 sm:scale-75 lg:scale-100 bg-red-400 text-slate-100 rounded-full px-4 flex gap-2 items-center 
               dark:bg-red-900 dark:text-slate-400 py-1 shadow-sm animate-pulse`}
            >
              <span className="text-sm">
                {t('urgent')}
              </span>
            </div>
          )}

          {/* Delete new translation button */}
          {hasAccess
            ? (
              <Fragment>
                {element.status === 'new'
                  ? (
                    <button
                      className={`btn btn-sm border-none scale-100 sm:scale-75 lg:scale-100 text-red-600 hover:bg-red-200 active:bg-red-300 dark:text-white dark:hover:text-red-700 shadow-none text-xs sm:-ml-3 lg:-ml-0`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsOpenDeleteTranslConfirmModal(true);
                      }}
                    >
                      <GoTrash />
                    </button>
                  )
                  : null}
              </Fragment>
            )
            : null}

        </div>

      </div>

      <p className="font-bold text-sm lg:text-base">
        {element.username}
      </p>

      <p className=" text-sm lg:text-base">
        {element.lang_name}
      </p>

      <p className=" text-sm lg:text-base">
        {momentTurkmen(element.created_at).format('LLL')}
      </p>

      {/* Delete new translation confirmation modal */}
      <div onClick={(e) => e.preventDefault()}>
        <ConfirmationModal
          isOpenConfirmModal={isOpenDeleteTranslConfirmModal}
          setIsOpenConfirmModal={setIsOpenDeleteTranslConfirmModal}
        >
          <div
            className='flex flex-col gap-10 p-0'
          >
            <h5 className='text-black dark:text-white'>
              {t('langDeleteConfirmation')}
            </h5>
            <div className='flex gap-4 w-full justify-end'>
              <Button
                className='max-w-sm'
                size='btn-sm'
                onClick={() => deleteNewTranslation(element.guid)}
                disabled={isLoadingDeleteNewTransl}
              >
                {t('langDeleteConfirmationYes')} {isLoadingDeleteNewTransl && <span className='loading loading-spinner loading-sm'></span>}
              </Button>
              <Button className='max-w-sm' onClick={() => setIsOpenDeleteTranslConfirmModal(false)} size='btn-sm'>
                {t('langDeleteConfirmationNo')}
              </Button>
            </div>
          </div>
        </ConfirmationModal>
      </div>

    </Link>
  )
};

export default Card;