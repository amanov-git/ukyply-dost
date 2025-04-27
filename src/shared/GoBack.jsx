import { Link } from 'react-router-dom';
import { t } from 'i18next'
import { FaArrowLeft } from 'react-icons/fa6'

const GoBack = ({ to, text = 'goBack', onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex gap-4 items-center w-fit cursor-pointer hover:text-slate-500 active:text-slate-600 dark:hover:text-slate-300  dark:active:text-slate-400 transition-colors"
    >
      <FaArrowLeft className="size-6 " />
      <h5 className="h-9 flex items-center">
        {t(text)}
      </h5>
    </Link>

  )
}

export default GoBack;