import { t } from 'i18next';
import { IoMdDownload } from "react-icons/io";
import { GoScreenFull } from "react-icons/go";
import { PURE_BASE_URL } from 'api/axiosInstance';

const CardDetailsOriginalDocsPreview = ({ translation, handleFullScreenModal, downloadFile }) => {

  return (

    <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-40 gap-8${translation?.data?.data?.doc_files.length > 1 && 'self-center'}`}>
      {translation?.data?.data?.doc_files.map((transl, index) => (
        <div key={index} className="relative">
          <div className="w-64 flex justify-between text-sm mb-2">
            <p>
              {t('pages')}: {transl?.pages_count_of_file}
            </p>
            <p>
              {t('price')}: {transl?.price} tmt
            </p>
            <p className="absolute top-full left-0">
              {transl?.size}
            </p>
          </div>

          <div className={`relative w-64 h-44`}>

            {/* Download button for all formats of files */}
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

            {/* Files preview PDF */}
            {transl.file.toLowerCase().endsWith('pdf') && (
              <div className="border px-2 w-full h-full rounded-md flex justify-center items-center relative">

                <p className="text-center text-sm">
                  {transl.file.split('/').pop()}
                </p>

              </div>
            )}

            {/* Files preview jpg, png */}
            {transl.file.toLowerCase().endsWith('jpg') || transl.file.toLowerCase().endsWith('png')
              ? (
                <div className="border px-2 rounded-md w-64 h-44">
                  <img className="rounded-md w-full h-full" src={`${PURE_BASE_URL + transl.file}`} alt="image" loading="lazy" />
                </div>
              ) : null}

            {/* Files preview docx */}
            {transl.file.toLowerCase().endsWith('docx')
              ? (
                <div className="border w-64 h-44 flex justify-center items-center rounded-md px-2">
                  <p className="text-sm text-center overflow-hidden text-ellipsis cursor-default" title={transl.file.split('/').pop()}>
                    {transl.file.split('/').pop()}
                  </p>
                </div>
              ) : null}

          </div>
        </div>
      ))}
    </div >

  )
}

export default CardDetailsOriginalDocsPreview;