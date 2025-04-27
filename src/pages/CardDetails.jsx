import React, { Suspense, useState } from "react";
import { useFormik } from 'formik';
import { AssignTranslation } from "api/queries/post";
import { useQuery } from "@tanstack/react-query";
import { GetTranslation } from "api/queries/getters";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import momentTurkmen from 'libs/moment-turkmen';
import { canRenderComponent } from "utils/roles";
import roles from "utils/roles";
import { useSelector } from "react-redux";
import Button from "shared/Button";
import Modal from 'react-modal';
Modal.setAppElement('#root');
import ConfirmationModal from "shared/ConfirmationModal";
import GoBack from "shared/GoBack";
import { PURE_BASE_URL } from 'api/axiosInstance';
import { Helmet } from "react-helmet-async";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { RecreateProcessingTranslation } from "api/queries/put";
const CardDetailsFileUploading = React.lazy(() => import('./CardDetailsFileUploading'));
const CardDetailsOriginalDocsPreview = React.lazy(() => import('./CardDetailsOriginalDocsPreview'));
const CardDetailsPreviewModal = React.lazy(() => import('./CardDetailsPreviewModal'));
const CardDetailsTranslatedDocsPreviewSection = React.lazy(() => import('./CardDetailsTranslatedDocsPreviewSection'));
// Icons
import { LuFileType2 } from "react-icons/lu";
import { GrStatusUnknown } from "react-icons/gr";
import { CiUser } from "react-icons/ci";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { CiPhone } from "react-icons/ci";
import { MdOutlineDateRange } from "react-icons/md";
import { FaRegStickyNote } from "react-icons/fa";
import { LuUserCheck } from "react-icons/lu";
import { TbUrgent } from "react-icons/tb";

const CardDetails = () => {

  const navigate = useNavigate();
  const { guid } = useParams();
  const { t } = useTranslation();

  const [isOpenPreviewModal, setIsOpenPreviewModal] = useState(false);
  const [chosenFile, setChosenFile] = useState('');
  const [isOpenConfirmationModalApply, setIsOpenConfirmationModalApply] = useState(false);
  const [isOpenConfirmationModalCancelTranslation, setIsOpenConfirmationModalCancelTranslation] = useState(false);
  const [isLoadingApplying, setIsLoadingApplying] = useState(false);
  const [isLoadingCancelTranslation, setIsLoadingCancelTranslation] = useState(false);

  const {
    data: translation,
  } = useQuery({
    queryKey: ['getTranslation', guid],
    queryFn: GetTranslation,
  });

  const { user } = useSelector(state => state.userInfo)
  const hasAccess = canRenderComponent(user, [roles.ADMIN, roles.OPERATOR]);

  const handleFullScreenModal = (transl) => {
    setChosenFile(transl.file);
    setIsOpenPreviewModal(true);
    if (Number(transl.size.split(' ')[0]) > 5 && transl.size.split(' ')[1].toLowerCase() === 'mb') {
      toast(t('docLoading') + ` ${transl.size}`);
    }
  };

  // Applying to translation
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      translation_guid: translation?.data?.data?.guid || 'Error fetching data',
    },
    onSubmit: (values) => {
      // console.log('values: ', values);
      const assignTranslation = async () => {
        setIsLoadingApplying(true);
        try {
          const response = await AssignTranslation(values);
          if (response) {
            toast.success(response?.data?.msg);
          };
        } catch (error) {
          if (error instanceof AxiosError) {
            handleAxiosError(error);
          } else {
            toast.error(error?.message);
          }
        } finally {
          setIsLoadingApplying(false);
        }
      };

      assignTranslation();
      navigate('/');

    }
  });

  const downloadFile = async (transl) => {
    const fileUrl = `${PURE_BASE_URL + transl}`;
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = transl.split('/').pop();
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const setStatusBottomText = () => {
    if (translation?.data?.data?.status === 'new') {
      return t('enquiryType1')
    } else if (translation?.data?.data?.status === 'processing') {
      return t('enquiryType2')
    } else if (translation?.data?.data?.status === 'completed') {
      return t('enquiryType3')
    }
  };

  const cardDetails = [
    {
      icon: LuFileType2,
      topText: t('type'),
      bottomText: translation?.data?.data?.type === 'urgent' ? t('urgent') : t('normal'),
    },
    // Urgent translation end time
    ...(translation?.data?.data?.urgent_end_time
      ? [{
        icon: TbUrgent,
        topText: t('urgentEndTime'),
        bottomText: momentTurkmen(translation?.data?.data?.urgent_end_time).format('LLL'),
      }]
      : []),
    // Status
    {
      icon: GrStatusUnknown,
      topText: t('branchDetailsStatus'),
      bottomText: setStatusBottomText(),
    },
    // Translation set by
    {
      icon: CiUser,
      topText: t('setBy'),
      bottomText: translation?.data?.data.username,
      fullName: translation?.data?.data?.fullname
    },
    // Translation received by
    ...(translation?.data?.data?.translator_username?.length > 0 ? [{
      icon: LuUserCheck,
      topText: t('receivedBy'),
      bottomText: translation?.data?.data?.translator_username,
      fullName: translation?.data?.data?.translator_fullname
    }] : []),
    ...(hasAccess ? [{
      icon: MdOutlineDriveFileRenameOutline,
      topText: t('clientName'),
      bottomText: translation?.data?.data.client_name,
    }] : []),
    ...(hasAccess ? [{
      icon: CiPhone,
      topText: t('clientPhone'),
      bottomText: translation?.data?.data.client_phone,
    }] : []),
    {
      icon: MdOutlineDateRange,
      topText: t('createdAt'),
      bottomText: momentTurkmen(translation?.data?.data?.created_at).subtract(5, 'hours').format('LLL'),
    },
    {
      icon: FaRegStickyNote,
      topText: t('note'),
      bottomText: translation?.data?.data.additional_info || t('noNote'),
    },
  ];

  const recreateProcessingTranslation = async (guid) => {
    setIsLoadingCancelTranslation(true);
    try {
      const response = await RecreateProcessingTranslation(guid);
      toast.success(response?.data?.msg);
      navigate('/');
    } catch (error) {
      if (error instanceof AxiosError) {
        handleAxiosError(error);
      } else {
        toast.error(error?.message);
      };
    } finally {
      setIsLoadingCancelTranslation(false);
    };
  };

  return (
    <div className='container mx-auto px-4 sm:px-8'>

      <Helmet>
        <title>
          {t('cardDetails')}
        </title>
        <meta name='description' />
      </Helmet>

      {/* Go back button */}
      <div className="flex gap-4 items-center w-fit cursor-pointer mb-10 text-sm sm:text-base">
        <GoBack onClick={() => navigate(-1)} />
      </div>

      <div
        className={`bg-slate-50 dark:bg-slate-800 lg:w-[768px] mx-auto rounded-md flex flex-col gap-1 sm:gap-4 p-4 sm:p-8 font-bold 
          border-t-4 ${translation?.data?.data.status === 'new' ? 'border-blue-700' : translation?.data?.data.status === 'processing' ?
            'border-orange-600' : translation?.data?.data.status === 'completed' ? 'border-green-500' : ''}`}
      >

        <div>

          <div className="flex flex-col sm:flex-row gap-4 justify-around sm:justify-between mb-4 items-center">

            <p className="sm:text-lg text-sm italic">
              <span className="font-semibold">
                {translation?.data?.data.lang_name}
              </span>
            </p>

            <div className="flex gap-2">

              <p className="font-bold text-sm sm:text-base bg-slate-100 px-4 py-1 rounded-full dark:bg-slate-700">
                {translation?.data?.data.doc_code}
              </p>

              {/* Cancel translation button */}
              {translation?.data?.data?.status === 'processing'
                ? (
                  <Button
                    className={'rounded-full outline-none text-slate-50 dark:text-slate-100'}
                    color={'bg-red-400 hover:bg-red-300 active:bg-red-400 dark:bg-red-900 dark:hover:bg-red-950 dark:active:bg-red-900'}
                    size={'btn-sm'}
                    onClick={() => setIsOpenConfirmationModalCancelTranslation(true)}
                  >
                    {t('cancelTranslation')}
                  </Button>
                ) : null}

            </div>

          </div>

          <div className="font-normal grid grid-cols-1 sm:grid-cols-2 gap-y-4 p-4">

            {cardDetails.map((el, index) => (
              <div key={index} className="flex w-fit items-center gap-4">
                <el.icon className="size-4" />
                <div>
                  <p className="text-sm">
                    {el.topText}:
                  </p>
                  <p className="font-semibold">
                    {el.bottomText}
                  </p>
                  {el.fullName
                    ? (
                      <p className="text-xs">
                        ({el.fullName})
                      </p>
                    ) : null}
                </div>
              </div>
            ))}

          </div>

        </div>

        {/* Original docs preview section text */}
        <div>
          <p>
            {t('originalDocs')}:
          </p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Original docs preview section */}
          <Suspense fallback={<div>{t('loading')}...</div>}>
            <CardDetailsOriginalDocsPreview
              translation={translation}
              downloadFile={downloadFile}
              handleFullScreenModal={handleFullScreenModal}
            />
          </Suspense>

          {/* Apply to translation button */}
          {translation?.data?.data?.status === 'new' && (
            <form className="flex mt-3 justify-end">
              <div>
                <Button
                  type={'button'}
                  onClick={() => setIsOpenConfirmationModalApply(true)}
                  disabled={isLoadingApplying}
                >
                  {t('apply')} {isLoadingApplying && <span className="loading loading-spinner loading-md"></span>}
                </Button>
              </div>
            </form>
          )}

        </div>

        {/* Translated documents preview section */}
        <Suspense fallback={<div>{t('loading')}...</div>}>
          <CardDetailsTranslatedDocsPreviewSection
            translation={translation}
            downloadFile={downloadFile}
            handleFullScreenModal={handleFullScreenModal}
          />
        </Suspense>

        {/* File uploading section - Filepond */}
        {translation?.data?.data?.status === 'processing'
          ? (
            <Suspense fallback={<div>{t('loading')}...</div>}>
              <CardDetailsFileUploading guid={guid} />
            </Suspense>
          ) : null}

        {/* Preview modal */}
        {isOpenPreviewModal
          ? (
            <Suspense fallback={<div>{t('loading')}...</div>}>
              <CardDetailsPreviewModal
                isOpenPreviewModal={isOpenPreviewModal}
                setIsOpenPreviewModal={setIsOpenPreviewModal}
                chosenFile={chosenFile}
                handleFullScreenModal={handleFullScreenModal}
                downloadFile={downloadFile}
              />
            </Suspense>
          ) : null}

      </div>

      {/* Confirmation modal for apply */}
      <ConfirmationModal isOpenConfirmModal={isOpenConfirmationModalApply} setIsOpenConfirmModal={setIsOpenConfirmationModalApply}>
        <div className='flex flex-col gap-10'>
          <h5>
            {t('confirmationApply')}
          </h5>
          <div className='flex gap-4 w-full justify-end'>
            <Button className='max-w-sm' size='btn-sm' onClick={formik.handleSubmit}>
              {t('langDeleteConfirmationYes')}
            </Button>
            <Button className='max-w-sm' onClick={() => setIsOpenConfirmationModalApply(false)} size='btn-sm'>
              {t('langDeleteConfirmationNo')}
            </Button>
          </div>
        </div>
      </ConfirmationModal>

      {/* Confirmation modal for cancelling translation */}
      <ConfirmationModal
        isOpenConfirmModal={isOpenConfirmationModalCancelTranslation}
        setIsOpenConfirmModal={setIsOpenConfirmationModalCancelTranslation}
      >
        <div className={`flex flex-col gap-10`}>
          <h5>
            {t('cancelTranslationConfirmation')}
          </h5>
          <div className='flex gap-4 w-full justify-end'>
            <Button
              className='max-w-sm flex items-center'
              size='btn-sm'
              disabled={isLoadingCancelTranslation}
              onClick={() => recreateProcessingTranslation(guid)}
            >
              {t('langDeleteConfirmationYes')} {isLoadingCancelTranslation && <span className="loading loading-spinner loading-sm"></span>}
            </Button>
            <Button className='max-w-sm' onClick={() => setIsOpenConfirmationModalCancelTranslation(false)} size='btn-sm'>
              {t('langDeleteConfirmationNo')}
            </Button>
          </div>
        </div>
      </ConfirmationModal>

    </div >
  )
};

export default CardDetails;