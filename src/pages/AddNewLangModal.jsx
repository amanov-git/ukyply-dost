import { useState } from 'react';
import Modal from 'react-modal'
import { RxCross2 } from "react-icons/rx";
import { AddLanguage } from 'api/queries/post';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import Button from 'shared/Button';
import { AxiosError } from 'axios';
import handleAxiosError from 'utils/handleAxiosError';

const AddNewLangModal = ({ isOpenLangModal, toggleLangModal, translatorLangsRefetch }) => {
  // Modal package neccesary function
  Modal.setAppElement('#root');

  const [isLoadingAddBranch, setIsLoadingAddBranch] = useState(false);

  const { t } = useTranslation();

  const [langValues, setLangValues] = useState({
    from: '',
    to: ''
  });

  const toastSuccess = () => toast.success(t('langToastSuccess'));

  const handleAddLanguage = async (e) => {
    e.preventDefault();
    setIsLoadingAddBranch(true);
    try {
      if (langValues.from.length > 1 && langValues.to.length > 1) {
        const res = await AddLanguage({
          lang_name: `${langValues.from} -> ${langValues.to}`
        });
        translatorLangsRefetch();
        toggleLangModal(!isOpenLangModal);
        toastSuccess();
      } else if (langValues.from.length < 1 && langValues.to.length < 1) {
        toast.error('Language names can not be empty')
      };
      setLangValues({
        from: '',
        to: '',
      });
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

  return (
    <Modal
      isOpen={isOpenLangModal}
      onRequestClose={() => toggleLangModal()}
      contentLabel='Example Label'
      className='sm:w-[600px] h-72 bg-second-light-bg-color dark:bg-second-dark-bg-color outline-none flex flex-col justify-center 
      items-center gap-1 shadow-md z-20 rounded-xl absolute top-1/2 -translate-y-1/2 scale-75 sm:scale-100 text-black dark:text-white'
      overlayClassName='fixed top-0 left-0 w-full h-full flex justify-center z-20 backdrop-blur-sm'
    >
      <button onClick={toggleLangModal} className='w-6 h-6 absolute top-6 right-6 hover:text-[red]/50 z-20'>
        <RxCross2 className='w-full h-full' />
      </button>
      <form onSubmit={handleAddLanguage} className='w-full h-full flex flex-col justify-center items-center gap-8 p-7'>
        <div className='flex w-full gap-8'>
          <div className='w-full flex flex-col gap-4'>
            <label htmlFor="fromLang" className='cursor-pointer'>
              {t('langFromWhichLang')}
            </label>
            <input
              id='fromLang'
              type="text"
              className='input input-sm input-bordered w-full text-black'
              value={langValues.from}
              onChange={e => setLangValues(lastState => {
                return {
                  ...lastState,
                  from: e.target.value
                }
              })}
            />
          </div>
          <div className='w-full flex flex-col gap-4'>
            <label htmlFor="toLang" className='cursor-pointer'>
              {t('langToWhichLang')}
            </label>
            <input
              id='toLang'
              type="text"
              className='input input-sm input-bordered w-full text-black'
              value={langValues.to}
              onChange={e => setLangValues(lastState => {
                return {
                  ...lastState,
                  to: e.target.value
                }
              })}
            />
          </div>
        </div>
        <div className='w-full flex justify-end'>
          <Button type='submit' className='p-4 rounded-md' disabled={isLoadingAddBranch}>
            {t('langPressToAdd')} {isLoadingAddBranch && <span className='loading loading-spinner loading-md'></span>}
          </Button>
        </div>
      </form>
    </Modal>
  )
};


export default AddNewLangModal;