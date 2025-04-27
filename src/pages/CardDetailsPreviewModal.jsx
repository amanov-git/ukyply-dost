import { Fragment } from "react/jsx-runtime";
import { RxCross2 } from "react-icons/rx";
import { IoMdDownload } from "react-icons/io";
import { Suspense } from "react";
import Modal from 'react-modal';
import { t } from 'i18next';
import { PURE_BASE_URL } from 'api/axiosInstance';
import { useState, useEffect } from "react";
// PDF viewer
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { getFilePlugin } from '@react-pdf-viewer/get-file';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/full-screen/lib/styles/index.css';

const CardDetailsPreviewModal = ({ isOpenPreviewModal, setIsOpenPreviewModal, chosenFile, downloadFile }) => {

  // DOCX viewer
  const [FileViewer, setFileViewer] = useState(null);

  useEffect(() => {
    if (chosenFile.length > 0) {
      const loadViewer = async () => {
        if (chosenFile.toLowerCase().endsWith('docx')) {
          const { default: FileViewer } = await import('react-file-viewer');
          setFileViewer(() => FileViewer);
        } else {
          setFileViewer(null);
        }
      };

      loadViewer();
    };
  }, [chosenFile]);

  // PDF viewer
  const getFilePluginInstance = getFilePlugin();

  return (
    <Fragment>

      <Modal
        isOpen={isOpenPreviewModal}
        onRequestClose={() => setIsOpenPreviewModal(false)}
        contentLabel='Example Label'
        overlayClassName={`fixed top-0 left-0 w-full h-screen flex justify-center py-2 z-20 backdrop-blur-sm`}
        className={`w-full h-full sm:w-[60%] bg-second-light-bg-color dark:bg-second-dark-bg-color outline-none flex flex-col 
            justify-center items-center gap-1 z-20 rounded-xl`}
      >

        <div className="w-full h-full p-4 relative">

          {/* Download button for all format files */}
          <div
            className='absolute top-5 right-16 sm:top-5 sm:right-20 z-10 cursor-pointer'
            onClick={() => downloadFile(chosenFile)}
          >
            <IoMdDownload className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 hover:text-slate-500" />
          </div>

          {/* Close modal button */}
          <div
            className='absolute top-5 right-9 sm:top-5 sm:right-10 z-10 cursor-pointer'
            onClick={() => setIsOpenPreviewModal(false)}
          >
            <RxCross2 className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 hover:text-red-500" />
          </div>

          {/* Files preview jpg, png */}
          {chosenFile.toLowerCase().endsWith('jpg') || chosenFile.toLowerCase().endsWith('png')
            ? (
              <div className="flex items-center justify-center w-full h-full">
                <img className="rounded-md w-4/5 sm:h-full" src={`${PURE_BASE_URL + chosenFile}`} alt="image" />
              </div>
            ) : null}

          {/* Files preview docx */}
          {chosenFile.toLowerCase().endsWith('docx') && FileViewer && (
            <Suspense fallback={<div className="m-5">{t('loading')}...</div>}>
              <div className="w-full h-full rounded-md">
                <FileViewer fileType="docx" filePath={`${PURE_BASE_URL + chosenFile}`} />
              </div>
            </Suspense>
          )}

          {/* Files preview PDF */}
          {chosenFile.toLowerCase().endsWith('pdf') && (
            <Suspense fallback={<div className="m-5">{t('loading')}</div>}>
              <div className="w-full h-full">
                <Worker workerUrl={PURE_BASE_URL + '/libs/pdf.worker.min.js'}>
                {/* <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}> */}
                  <Viewer
                    fileUrl={`${PURE_BASE_URL + chosenFile}`}
                    plugins={[getFilePluginInstance]}
                  />
                </Worker>
              </div>
            </Suspense>
          )}

        </div>
      </Modal>

    </Fragment>
  )
}

export default CardDetailsPreviewModal;