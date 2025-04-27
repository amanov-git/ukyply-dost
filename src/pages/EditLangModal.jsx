import { useState } from 'react';
import Modal from 'react-modal'
import { RxCross2 } from "react-icons/rx";
import { UpdateLanguage } from "api/queries/put";
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'shared/Button';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import handleAxiosError from 'utils/handleAxiosError';

// COMPONENT
const EditLangModal = (
  { isOpenUpdateLangModal, toggleUpdateLangModal, translatorLangsRefetch, langsValue, translatorLangs, setIsOpenUpdateLangModal }
) => {
  // Modal package neccesary function
  Modal.setAppElement('#root');
  const [isLoadingEditLang, setIsLoadingEditLang] = useState(false);

  const { t } = useTranslation();

  const [langValues, setLangValues] = useState({
    from: '',
    to: '',
  });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingEditLang(true);
    try {
      if (translatorLangs && translatorLangs.data?.data.length > 0) {
        const response = await UpdateLanguage({
          id: langsValue.value,
          lang_name: `${langValues.from} -> ${langValues.to}`
        });
        translatorLangsRefetch();
        toggleUpdateLangModal();
        toast.success(response?.data?.msg);
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
      }
    } finally {
      setIsLoadingEditLang(false);
    }
  }

  useEffect(() => {
    if (Object.keys(langsValue).length > 0) {
      setLangValues({
        from: langsValue.label.split('->')[0].trim(),
        to: langsValue.label.split('->')[1].trim(),
      })
    }
  }, [langsValue]);

  return (
    <Modal
      isOpen={isOpenUpdateLangModal}
      onRequestClose={() => toggleUpdateLangModal()}
      contentLabel='Example Label'
      className='sm:w-[600px] h-72 bg-second-light-bg-color dark:bg-second-dark-bg-color outline-none p-7 flex flex-col justify-center items-center gap-1 shadow-md z-20 rounded-xl absolute top-1/2 -translate-y-1/2 scale-75 sm:scale-100'
      overlayClassName='fixed top-0 left-0 w-full h-full flex justify-center z-20 backdrop-blur-sm'
    >
      <button
        onClick={() => setIsOpenUpdateLangModal(false)}
        className='text-black dark:text-white w-6 h-6 absolute top-6 right-6 hover:text-[red]/50 dark:hover:text-[red]/50'>
        <RxCross2 className='w-full h-full' />
      </button>
      <form onSubmit={handleEditSubmit} className='w-full flex flex-col gap-8'>
        <div className='flex w-full gap-8'>
          <input
            type="text"
            className='input input-sm input-bordered w-full'
            value={langValues.from}
            onChange={e => setLangValues(lastState => {
              return {
                ...lastState,
                from: e.target.value
              }
            })}
          />
          <input
            type="text"
            className='input input-sm input-bordered w-full'
            value={langValues.to}
            onChange={e => setLangValues(lastState => {
              return {
                ...lastState,
                to: e.target.value
              }
            })}
          />
        </div>
        <div className='w-full flex justify-end'>
          <Button type='submit' className='p-4 rounded-md' disabled={isLoadingEditLang}>
            {t('langPressToEdit')} {isLoadingEditLang && <span className='loading loading-spinner loading-md'></span>}
          </Button>
        </div>
      </form>
    </Modal>
  )
};


export default EditLangModal;