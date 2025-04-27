import Button from 'shared/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RxCross2 } from "react-icons/rx";
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { GetTranslatorSkillLangs } from 'api/queries/getters';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { useEffect, useCallback, useMemo } from 'react';
import { useBlocker } from 'react-router-dom';
import ReactSelect from 'components/ReactSelect';
import { useLocation } from 'react-router-dom';
// Filepond
import { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { BsPlus } from 'react-icons/bs';
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { tokenStorage } from 'utils/storage';
import { axiosInstance } from 'api/axiosInstance';
import { AxiosError } from 'axios';
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);
// Calendar
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaRegCalendar } from "react-icons/fa";
import moment from 'moment';
import handleAxiosError from 'utils/handleAxiosError';

const AddNewEnquiry = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.darkLightMode);
  const [isFormikDirty, setIsFormikDirty] = useState(false);
  const location = useLocation();

  // --
  const {
    data: translatorLangs,
    isLoading: translatorLangsLoading,
  } = useQuery({
    queryKey: ['getTranslatorSkillLangs'],
    queryFn: GetTranslatorSkillLangs
  });

  const [docElements, setDocElements] = useState([{ id: 1, pages: '', price: '', files: [] }]);

  const validationSchema = Yup.object({
    client_name: Yup.string()
      .required(t('validRequired')),
    client_phone: Yup.string()
      .matches(/^(61|62|63|64|65|66|67|71)\d{6}$/, t('mustContainOnlyDigits'))
      .required(t('validRequired')),
    type: Yup.string()
      .required(t('validRequired')),
    additional_info: Yup.string()
      .max(500, t('noteValidation')),
  });

  const formik = useFormik({
    initialValues: {
      client_name: '',
      client_phone: '',
      type: 'normal',
      lang_id: '',
      additional_info: '',
      urgent_end_time: ''
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values) => {

      if (formik.values.type === 'urgent' && formik.values.urgent_end_time === '') {
        formik.setFieldError('urgent_end_time', t('urgentTranslEndTimeValidation'))
        return
      }

      if (formik.values.lang_id.length < 1) {
        formik.setFieldError('lang_id', t('chooseLanguage'));
        return
      }

      setIsFormikDirty(false);

      const formData = new FormData();
      formData.append('client_name', values.client_name);
      formData.append('client_phone', '+993' + values.client_phone);
      formData.append('type', values.type);
      formData.append('lang_id', values.lang_id);
      formData.append('additional_info', values.additional_info);
      formData.append('urgent_end_time', moment(values.urgent_end_time).format('YYYY-MM-DD HH:mm'));

      docElements.forEach((doc) => {
        formData.append(`documents`, JSON.stringify({ id: doc.id, pages_count_of_file: doc.pages, price: doc.price }));  // [${index}][pages]
        formData.append(`${doc.id}`, doc.files[0])
      });

      // Log formData to the console
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // };

      const emptyDocsPages = docElements.filter((doc) => doc.pages < 1)
      const emptyDocsFiles = docElements.filter((doc) => doc.files.length < 1)
      const emptyPrice = docElements.filter((doc) => doc.price.length < 1)

      try {
        if (emptyDocsPages.length < 1 && emptyDocsFiles.length < 1 && emptyPrice.length < 1) {
          const accessToken = tokenStorage.getToken()
          const response = await axiosInstance({
            method: 'POST',
            url: '/translations/add-translation-doc',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: 'Bearer ' + accessToken
            }
          })
          console.log('addNewTranslResponse: ', response)
          toast.success(response?.data.msg)
          if (response?.data.msg) {
            navigate('/')
          }
        } else {
          toast.error(t('shouldNotBeEmpty'));
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          handleAxiosError(error);
        } else {
          toast.error(error?.message);
        }
      }

    },
  });

  useEffect(() => {
    setIsFormikDirty(formik.dirty);
  }, [formik.dirty]);

  // Filepond - file uploading
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

  const [fileNames, setFileNames] = useState([]); // Store all added file names

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

  const handleAddFile = (error, file) => {
    if (error) {
      console.error('Error while adding the file:', error);
    } else {
      const normalizedFileName = file.filename.toLowerCase();

      // Use a functional update to ensure the latest state
      setFileNames((prevFileNames) => [...prevFileNames, normalizedFileName]);
    }
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

  // Handle closing tab if formik is dirty
  const isFormDirty = useMemo(() => formik.dirty, [formik.dirty]);
  const handleBeforeUnload = useCallback((event) => {
    if (isFormDirty) {
      event.preventDefault();
      // event.returnValue = '';
    }
  }, [isFormDirty]);
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  // Handle going to another page if formik is dirty
  useBlocker(
    useCallback(() => {
      if (isFormikDirty && location.pathname === '/add-new-enquiry') {
        const confirmNavigation = window.confirm(t('leavePageConfirmation'));
        if (confirmNavigation) {
          return false;
        }
        return true;
      }
    }), [isFormDirty, location.pathname]);

  return (
    <div
      className={`container mx-auto px-8 lg:px-0 flex flex-col items-center gap-8 ${formik.isSubmitting && 'opacity-30 pointer-events-none'}`}
    >

      <Helmet>
        <title>
          {t('addNewTranslation')}
        </title>
        <meta name='description' />
      </Helmet>

      <div
        className='w-full lg:w-[768px] flex flex-col items-center gap-8 shadow-md sm:p-10 bg-slate-100 rounded-lg p-6 dark:bg-slate-800 dark:highlight-white/5'
      >

        {/* Form */}
        <form
          onSubmit={(event) => {
            window.removeEventListener('beforeunload', () => { }); // Allow navigation on successful submission
            formik.handleSubmit(event);
          }}
          className='w-full grid lg:grid-cols-2 gap-6 lg:gap-y-10 lg:gap-x-12'
        >

          {/* Form heading */}
          <div className='col-span-2 lg:col-span-2'>
            <h5 className=' text-2xl text-center'>
              {t('addNewTranslation')}
            </h5>
          </div>

          {/* client name */}
          <div className='flex flex-col gap-2 w-full col-span-2 lg:col-span-1'>
            <label htmlFor="client_name" className='cursor-pointer'>
              {t('clientName')}
            </label>
            <div className='w-full relative'>
              <input
                className='input input-md w-full'
                id="client_name"
                name="client_name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.client_name}
                placeholder={t('clientName')}
                disabled={formik.isSubmitting}
              />
              {formik.touched.client_name && formik.errors.client_name ? (
                <div className='error-text absolute top-full left-0'>{formik.errors.client_name}</div>
              ) : null}
            </div>
          </div>

          {/* Phone Number */}
          <div className='flex flex-col gap-2 w-full col-span-2 lg:col-span-1'>
            <label htmlFor="client_phone" className='cursor-pointer'>
              {t('clientPhone')}
            </label>
            <div className='w-full relative'>
              <span className='absolute left-3 top-3 text-md text-slate-400'>
                +993
              </span>
              <input
                className='input input-md w-full pl-16 border-slate-400 focus:border-slate-400 focus:outline-slate-400'
                id="client_phone"
                name="client_phone"
                type="tel"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    formik.setFieldValue('client_phone', value);
                  };
                }}
                onBlur={formik.handleBlur}
                value={formik.values.client_phone}
                placeholder={t('clientPhone')}
                disabled={formik.isSubmitting}
              />
              {formik.touched.client_phone && formik.errors.client_phone
                ? <div className='error-text absolute top-full left-0'>{formik.errors.client_phone}</div>
                : null}
            </div>
          </div>

          {/* Translation type radio buttons */}
          <div className='w-full col-span-2 flex flex-col gap-2'>
            <div className='w-full flex'>
              <p className='self-start'>
                {t('translationType')}
              </p>
            </div>
            <div className='flex flex-col lg:flex-row gap-4 lg:gap-12 w-full'>
              <div
                className="w-full bg-slate-50 border border-slate-400 dark:bg-slate-700 dark:border-slate-600 rounded-md px-2"
              >
                <label className="label cursor-pointer">
                  <span className="label-text text-xs">
                    {t('urgent')}
                  </span>
                  <input
                    type="radio"
                    name="type"
                    value="urgent"
                    className="radio checked:bg-red-500"
                    onChange={() => formik.setFieldValue('type', 'urgent')}
                    checked={formik.values.type === 'urgent'}
                    disabled={formik.isSubmitting}
                  />
                </label>
              </div>
              <div
                className="w-full bg-slate-50 border border-slate-400 dark:bg-slate-700 dark:border-slate-600 rounded-md px-2"
              >
                <label className="label cursor-pointer">
                  <span className="label-text text-xs">
                    {t('normal')}
                  </span>
                  <input
                    type="radio"
                    name="type"
                    value="normal"
                    className="radio checked:bg-blue-500"
                    onChange={() => formik.setFieldValue('type', 'normal')}
                    checked={formik.values.type === 'normal'}
                    disabled={formik.isSubmitting}
                  />
                </label>
              </div>
            </div>
          </div>
          {formik.touched.type && formik.errors.type ? (
            <div className='error-text'>{formik.errors.type}</div>
          ) : null}

          {/* Time choose field */}
          {formik.values.type === 'urgent'
            ? (
              <div className='col-span-2 flex flex-col items-center justify-center gap-2'>
                <label htmlFor="time">
                  {t('chooseEndTimeUrgentTranslation')}
                </label>
                <div id='time' className='relative w-fit'>
                  <DatePicker
                    calendarClassName="dark:bg-slate-800 dark:border-none"
                    dayClassName={() => 'dark:text-slate-300'}
                    id='urgent_end_time'
                    selected={formik.values.urgent_end_time}
                    onChange={value => formik.setFieldValue('urgent_end_time', value)}
                    onBlur={formik.handleBlur}
                    value={formik.values.urgent_end_time}
                    showTimeSelect
                    timeClassName={() => 'dark:bg-slate-800 dark:text-slate-300'}
                    timeFormat='HH:mm'
                    dateFormat="dd-MM-yyyy/HH:mm"
                    timeCaption={<span className='text-slate-800 dark:text-slate-300'>Time</span>}
                    minDate={new Date()}
                    minTime={new Date(new Date().setHours(new Date().getHours(), new Date().getMinutes()))}
                    maxTime={new Date(new Date().setHours(23, 30, 0))}
                    customInput={
                      <input
                        className='input input-bordered input-sm text-center dark:text-gray-300 custom-input-1 w-96'
                      />
                    }
                  />
                  <FaRegCalendar
                    className='absolute top-1/2 -translate-y-1/2 right-4'
                    onClick={() => document.querySelector('.custom-input-1').focus()}
                  />
                </div>
                {formik.touched.urgent_end_time && formik.errors.urgent_end_time
                  ? <div className='error-text'>{formik.errors.urgent_end_time}</div>
                  : null}
              </div>
            ) : null}

          {/* Languages */}
          <div className='w-full relative col-span-2 flex flex-col gap-2'>

            <label htmlFor="lang_id" className='text-slate-600 dark:text-slate-200'>
              {t('listItemLang')}
            </label>

            <ReactSelect
              selectOptions={translatorLangs?.data?.data}
              isLoading={translatorLangsLoading}
              id='lang_id'
              name='lang_id'
              handleChange={(choice) => formik.setFieldValue('lang_id', choice?.value)}
              onBlur={formik.handleBlur}
              isMulti={false}
            />

            {formik.touched.lang_id && formik.errors.lang_id ? <div className='error-text'>{formik.errors.lang_id}</div> : null}

          </div>

          {/* Note */}
          <textarea
            className="col-span-2 h-52 w-full input resize-none pt-4"
            placeholder={t('note')}
            id="additional_info"
            name="additional_info"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.additional_info}
            disabled={formik.isSubmitting}
          />
          {formik.touched.additional_info && formik.errors.additional_info ? (
            <div className='error-text -mt-10'>{formik.errors.additional_info}</div>
          ) : null}

          {/* File upload text */}
          <div className='col-span-2'>
            <p className='text-center'>
              {t('uploadFiles')}: PDF, JPG, PNG, DOCX.
            </p>
          </div>

          {/* File Upload Section */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2'>
            {docElements.map((doc, index) => (
              <div key={index} className='h-fit pt-6 flex flex-col gap-4 relative flex-1 rounded-md px-3  pb-6 border border-slate-400'>
                {index !== 0 && (
                  <div className='absolute top-1 right-1 text-red-400 w-4 h-4 cursor-pointer'>
                    <RxCross2
                      className="w-full h-full"
                      onClick={() => handleRemoveDocElement(doc, index)}
                    />
                  </div>
                )}

                <div className='flex gap-4 relative'>

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
                    disabled={formik.isSubmitting}
                  />

                  <input
                    type='text'
                    placeholder={t('price')}
                    value={doc.price}
                    className='input input-md w-4/5 pr-10'
                    disabled={formik.isSubmitting}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        const newDocElements = [...docElements];
                        newDocElements[index].price = value;
                        setDocElements(newDocElements);
                      }
                    }}
                  />

                  <b className='absolute top-1/2 -translate-y-1/2 right-2 '>tmt</b>
                </div>

                <FilePond
                  files={doc.files.map((file) => ({
                    source: file,
                    options: { type: 'local' }
                  }))}
                  allowMultiple={false}
                  acceptedFileTypes={[
                    'image/png',
                    'image/jpeg',
                    'application/pdf',
                    // 'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  ]}
                  maxFileSize='100MB'
                  onupdatefiles={(fileItems) => handleFileUpload(fileItems, index)}
                  onremovefile={() => handleRemoveFile(doc, index)}
                  labelIdle={`
                    <p style="${theme === 'light' ? 'color: #00077;' : 'color: #ffffff;'}">
                    ${t('dropHere')} <span class="filepond--label-action">${t('upload')}</span>
                    </p>
                    `}
                  className='bg-slate-400 hover:bg-slate-300 active:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-700 cursor-pointer rounded-md h-fit border dark:border-slate-600 text-slate-800 dark:text-slate-100'
                  imagePreviewHeight={170}
                  stylePanelLayout='integrated'
                  allowReplace={true}
                  onaddfile={handleAddFile}
                  beforeAddFile={beforeAddFile}
                  disabled={formik.isSubmitting}
                />
              </div>
            ))}

            {/* Add More Documents Button */}
            <div className='flex flex-col flex-1 items-center justify-center' aria-disabled={formik.isSubmitting}>
              <button
                type='button'
                onClick={handleAddMore}
                className='bg-slate-50 flex justify-center items-center gap-x-3 rounded-md hover:bg-slate-200 active:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-700 cursor-pointer h-full min-h-40 w-full'
              >
                <BsPlus size={24} />
                {t('addMoreDocs')}
              </button>
            </div>

          </div>

          {/* Submit button */}
          <Button
            className={`w-full col-span-2`}
            type="submit"
            disabled={formik.isSubmitting}
          >
            {t('submitAddNewUser')} {formik.isSubmitting ? <span className='loading loading-spinner loading-md'></span> : null}
          </Button>

        </form>

      </div>
    </div>
  );
};


export default AddNewEnquiry;