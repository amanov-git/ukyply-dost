import { Fragment } from 'react/jsx-runtime';
import { tokenStorage } from 'utils/storage';
import { axiosInstance } from 'api/axiosInstance';
import { useState, useEffect } from 'react';
import { t } from 'i18next'
import Button from 'shared/Button';
import ConfirmationModal from 'shared/ConfirmationModal';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import handleAxiosError from "utils/handleAxiosError";
import { useSelector } from 'react-redux';
// Icons
import { RxCross2 } from 'react-icons/rx';
import { BsPlus } from 'react-icons/bs';

const CardDetailsFileUploading = ({ guid }) => {

  const [isOpenConfirmationModalUpload, setIsOpenConfirmationModalUpload] = useState(false);
  const [isLoadingSubmitFile, setIsLoadingSubmitFile] = useState(false);
  const [FilePondComponent, setFilePondComponent] = useState(null);
  const { theme } = useSelector((state) => state.darkLightMode);

  const navigate = useNavigate();

  // Filepond - file uploading
  const [docElements, setDocElements] = useState([{ id: 1, pages: '', price: '', files: [] }]);
  const [fileNames, setFileNames] = useState([]);

  useEffect(() => {

    const loadFilePond = async () => {
      const { FilePond, registerPlugin } = await import('react-filepond');
      const FilePondPluginFileValidateType = await import('filepond-plugin-file-validate-type');
      const FilePondPluginImagePreview = await import('filepond-plugin-image-preview');
      registerPlugin(FilePondPluginFileValidateType.default, FilePondPluginImagePreview.default);
      setFilePondComponent(() => FilePond);
    };

    loadFilePond();

    import('filepond/dist/filepond.min.css');
    import('filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css');

  }, []);

  const handleAddMore = () => {
    setDocElements((prev) => [...prev, { id: prev.length + 1, pages: '', files: [] }]);
  };

  const handleFileUpload = (files, index) => {
    setDocElements((prevDocElements) => {
      const updatedDocElements = prevDocElements.map((doc, docIndex) => {
        if (docIndex === index) {
          return { ...doc, files: files.map(fileItem => fileItem.file) }; // Only update the files for the specific doc
        }
        return doc; // Keep the rest unchanged
      });
      return updatedDocElements;
    });
  };

  const handleRemoveFile = (doc, index) => {
    setDocElements((prevDocElements) => {
      const updatedDocElements = prevDocElements.map((doc, docIndex) => {
        if (docIndex === index) {
          return { ...doc, files: [] }; // Clear the files array only for the document at this index
        }
        return doc; // Keep other document elements unchanged
      });
      return updatedDocElements;
    });

    const fileNameToRemove = doc?.files[0]?.name.toLowerCase();
    const filteredFileNames = fileNames.filter(
      (fileName) => fileName.toLowerCase() !== fileNameToRemove
    );
    setFileNames(filteredFileNames);
  };

  const handleRemoveDocElement = (doc, index) => {
    setDocElements((prev) => prev.filter((_, i) => i !== index));

    const fileNameToRemove = doc?.files[0]?.name.toLowerCase();
    const filteredFileNames = fileNames.filter(
      (fileName) => fileName.toLowerCase() !== fileNameToRemove
    );
    setFileNames(filteredFileNames);
  };

  const handleAddFile = (error, file) => {
    if (error) {
      console.error('Error while adding the file:', error);
    } else {
      const normalizedFileName = file.filename.toLowerCase();

      // Use a functional update to ensure the latest state
      setFileNames((prevFileNames) => [...prevFileNames, normalizedFileName]);
    }
  };

  const beforeAddFile = (file) => {

    const normalizedFileName = file.filename.toLowerCase();

    // Ensure that the comparison is case-insensitive
    const isDuplicate = fileNames.some(
      (existingFileName) => existingFileName.toLowerCase() === normalizedFileName
    );

    if (isDuplicate) {
      toast.error('File with the same name already exists');
      return false; // Prevent the file from being added again
    }

    return true; // Allow the file to be added if not a duplicate
  };

  const handleFileUploadingSubmit = async (e) => {
    e.preventDefault();

    setIsOpenConfirmationModalUpload(false);

    const emptyDocsPages = docElements.filter((doc) => doc.pages < 1)
    const emptyDocsFiles = docElements.filter((doc) => doc.files.length < 1)

    const formData = new FormData();
    formData.append('translation_guid', guid);
    docElements.forEach((doc) => {
      formData.append(`documents`, JSON.stringify({ id: doc.id, pages_count_of_file: doc.pages, price: doc.price }));  // [${index}][pages]
      formData.append(`${doc.id}`, doc.files[0])
    });
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // };
    setIsLoadingSubmitFile(true);
    try {
      if (emptyDocsPages.length < 1 && emptyDocsFiles.length < 1) {
        const accessToken = tokenStorage.getToken()
        const response = await axiosInstance({
          method: 'POST',
          url: '/translations/return-translation-doc',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + accessToken
          }
        })
        toast.success(response?.data.msg);
        navigate('/');
      } else {
        toast.error('Faýllar we sahypa sany boş bolmaly däl')
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
      }
    } finally {
      setIsLoadingSubmitFile(false);
    }
  };

  return (

    <Fragment>
      <form className="flex flex-col gap-8" onSubmit={handleFileUploadingSubmit} >

        {/* Return docs upload section text */}
        <div>
          <p>
            {t('returnDocs')}:
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2'>
          {docElements.map((doc, index) => (
            <div key={index} className='h-fit py-6 flex flex-col gap-4 relative flex-1 rounded-md px-3 border border-slate-400'>
              {index !== 0 && (
                <div className='absolute top-1 right-1 text-red-400 w-4 h-4 cursor-pointer'>
                  <RxCross2
                    className="w-full h-full"
                    onClick={() => handleRemoveDocElement(doc, index)}
                  />
                </div>
              )}
              <div className="flex gap-4 relative">
                <input
                  type='text'
                  placeholder={t('numberOfPages')}
                  value={doc.pages}
                  className='input input-md w-full'
                  pattern="[0-9]*"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      const newDocElements = [...docElements];
                      newDocElements[index].pages = value;
                      setDocElements(newDocElements);
                    }
                  }}
                />
              </div>

              {FilePondComponent && (
                <FilePondComponent
                  files={doc.files.map((file) => ({
                    source: file,
                    options: { type: 'local' }
                  }))}
                  allowMultiple={false}
                  acceptedFileTypes={[
                    'image/png',
                    'image/jpeg',
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  ]}
                  maxFileSize='100MB'
                  onupdatefiles={(fileItems) => handleFileUpload(fileItems, index)}
                  onremovefile={() => handleRemoveFile(doc, index)}
                  // labelIdle={t('uploadingFilesSection')}
                  labelIdle={`
                    <p style="${theme === 'light' ? 'color: #00077;' : 'color: #ffffff;'}">
                    ${t('dropHere')} <span class="filepond--label-action">${t('upload')}</span>
                    </p>
                    `}
                  className='bg-slate-400 hover:bg-slate-300 active:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-700 cursor-pointer rounded-md h-fit border dark:border-slate-600 text-slate-800 dark:text-slate-100'
                  imagePreviewHeight={170}
                  // stylePanelLayout="compact"
                  stylePanelLayout='integrated'
                  allowReplace={true}
                  onaddfile={handleAddFile}
                  beforeAddFile={beforeAddFile}
                />
              )}

            </div>
          ))}

          {/* Add More Documents Button */}
          <div className='flex flex-col flex-1 items-center justify-center'>
            <button
              type='button'
              onClick={handleAddMore}
              className='btn border-slate-400 h-full min-h-40 w-full'
            >
              <BsPlus size={24} />
              {t('addMoreDocs')}
            </button>
          </div>

        </div>

        <Button
          type={'button'}
          onClick={() => setIsOpenConfirmationModalUpload(true)}
          disabled={isLoadingSubmitFile}
        >
          {t('submitTranslation')} {isLoadingSubmitFile && <span className="loading loading-spinner loading-md"></span>}
        </Button>
      </form >

      {/* Confirmation modal for uploading files */}
      <ConfirmationModal isOpenConfirmModal={isOpenConfirmationModalUpload} setIsOpenConfirmModal={setIsOpenConfirmationModalUpload}>

        <div className='flex flex-col gap-10'>
          <h5>
            {t('confirmationUpload')}
          </h5>
          <div className='flex gap-4 w-full justify-end'>
            <Button className='max-w-sm' size='btn-sm' onClick={handleFileUploadingSubmit}>
              {t('langDeleteConfirmationYes')}
            </Button>

            <Button className='max-w-sm' onClick={() => setIsOpenConfirmationModalUpload(false)} size='btn-sm'>
              {t('langDeleteConfirmationNo')}
            </Button>
          </div>
        </div>

      </ConfirmationModal>

    </Fragment>

  )
};

export default CardDetailsFileUploading;