import { Fragment } from 'react';
import { IoMdDownload } from "react-icons/io";
import { GoScreenFull } from "react-icons/go";
import { t } from 'i18next';

const CardDetailsTranslatedDocsPreviewSection = ({ translation, downloadFile, handleFullScreenModal }) => {

  return (
    <Fragment>

      {/* Translated documents preview section text */}
      {translation?.data?.data?.status === 'completed' && (
        <div className="mt-10">
          <p>
            {t('translatedDocs')}:
          </p>
        </div>
      )}

      {/* Translated documents preview section */}
      <div className="flex flex-col gap-6 pb-10">
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-40 ${translation?.data?.data?.doc_files.length > 1 && 'self-center'} gap-8`}>

          {translation?.data?.data?.returned_doc_files.map((transl, index) => (
            <div key={index} className="relative">
              <div className="border w-64 h-44 flex justify-center items-center rounded-md px-7 relative">

                {/* Download button */}
                <button
                  className="absolute top-2 right-16 z-10 w-7 h-7 border rounded-md border-slate-400 text-slate-500"
                  onClick={() => downloadFile(transl.file)}
                >
                  <IoMdDownload className="w-full h-full" />
                </button>

                {/* Full screen button */}
                <button
                  className="absolute top-2 right-7 z-10 w-7 h-7 border rounded-md border-slate-400 text-slate-500"
                  onClick={() => handleFullScreenModal(transl)}
                >
                  <GoScreenFull className="w-full h-full" />
                </button>

                <p className="text-sm text-center overflow-hidden text-ellipsis cursor-default" title={transl.file.split('/').pop()}>
                  {transl.file.split('/').pop()}
                </p>

              </div>
              <p className="absolute top-full left-0">
                {transl?.size}
              </p>
            </div>
          ))}

        </div>
      </div>

    </Fragment>
  )
}

export default CardDetailsTranslatedDocsPreviewSection;