import { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useTranslation } from "react-i18next";
import { useQuery } from '@tanstack/react-query';
import { GetTranslatorSkillLangs } from "api/queries/getters";
import AddNewLangModal from "./AddNewLangModal";
import EditLangModal from "./EditLangModal";
import ConfirmationModal from "shared/ConfirmationModal";
import Button from "shared/Button";
import { DeleteLanguage } from 'api/queries/delete';
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { AxiosError } from "axios";
import handleAxiosError from "utils/handleAxiosError";

// COMPONENT
const Languages = () => {
  const [isOpenLangModal, setIsOpenLangModal] = useState(false);
  const [isOpenUpdateLangModal, setIsOpenUpdateLangModal] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [langsValue, setLangsValue] = useState({});
  const [deleteLangValue, setDeleteLangValue] = useState(null);

  const { t } = useTranslation();

  const toggleLangModal = () => {
    setIsOpenLangModal(!isOpenLangModal);
  };

  const toggleUpdateLangModal = (el = {}) => {
    setLangsValue(el)
    setIsOpenUpdateLangModal(!isOpenUpdateLangModal)
  };

  const {
    data: translatorLangs,
    isLoading: translatorLangsLoading,
    refetch: translatorLangsRefetch,
  } = useQuery({
    queryKey: ['getTranslatorSkillLangs'],
    queryFn: GetTranslatorSkillLangs,
  });

  const handleClickDeleteLang = (languageId) => {
    setIsOpenConfirmModal(true);
    setDeleteLangValue(languageId)
  };

  const handleDeleteLang = async () => {
    try {
      if (translatorLangs && translatorLangs.data.data.length > 0) {
        const response = await DeleteLanguage(deleteLangValue);
        if (response?.data?.msg.length > 0) {
          toast.success(response?.data?.msg);
        };
        translatorLangsRefetch();
        setIsOpenConfirmModal(false);
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
      }
    };
  };

  return (
    <div className='container mx-auto px-8 flex flex-col gap-8 lg:gap-12 xl:gap-20'>

      <Helmet>
        <title>
          {t('listItemLang')}
        </title>
        <meta name='description' />
      </Helmet>

      <AddNewLangModal
        isOpenLangModal={isOpenLangModal}
        toggleLangModal={toggleLangModal}
        translatorLangsRefetch={translatorLangsRefetch}
      />

      <EditLangModal
        isOpenUpdateLangModal={isOpenUpdateLangModal}
        toggleUpdateLangModal={toggleUpdateLangModal}
        langsValue={langsValue}
        translatorLangsRefetch={translatorLangsRefetch}
        translatorLangs={translatorLangs}
        setIsOpenUpdateLangModal={setIsOpenUpdateLangModal}
      />

      <ConfirmationModal isOpenConfirmModal={isOpenConfirmModal} setIsOpenConfirmModal={setIsOpenConfirmModal}>
        <div className='flex flex-col gap-10'>
          <h5 className='text-black dark:text-white'>
            {t('langDeleteConfirmation')}
          </h5>
          <div className='flex gap-4 w-full justify-end'>
            <Button className='max-w-sm' onClick={handleDeleteLang} size='btn-sm'>
              {t('langDeleteConfirmationYes')}
            </Button>
            <Button className='max-w-sm' onClick={() => setIsOpenConfirmModal(false)} size='btn-sm'>
              {t('langDeleteConfirmationNo')}
            </Button>
          </div>
        </div>
      </ConfirmationModal>

      {/* Add lang section */}
      <div className="w-full flex flex-row justify-end gap-2">
        <Button
          type='button'
          onClick={toggleLangModal}
          className={`outline-none flex rounded-md items-center gap-2 py-2 px-3 justify-center w-fit`}
          size='btn-md'
        >
          <IoIosAddCircleOutline className='w-8 h-8' />
          <h6>
            {t('langAddLanguage')}
          </h6>
        </Button>
      </div>
      {/* Main section */}
      <div>
        <div className="flex flex-col w-full">
          {translatorLangsLoading ?
            <div className="flex gap-4"><h3>Loading</h3><span className="loading loading-spinner loading-lg"></span></div>
            :
            translatorLangs && translatorLangs?.data?.data.length > 0 ? translatorLangs?.data?.data.map((el, idx) => (
              <div key={idx} className="w-full sm:w-3/4 lg:w-1/2 xl:w-2/5 p-1 flex items-center justify-between">
                <h4 className="text-base sm:text-2xl">
                  {el.label}
                </h4>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleClickDeleteLang(el.value)}
                    size='btn-xs'
                  >
                    {t('langDeleteLang')}
                  </Button>
                  <Button
                    onClick={() => toggleUpdateLangModal(el)}
                    size='btn-xs'
                  >
                    {t('langEditLang')}
                  </Button>
                </div>
              </div>
            )) : <div><h3>{t('noData')}</h3></div>}
        </div>
      </div>
    </div>
  );
};


export default Languages;