import Lottie from 'react-lottie-player';
import error404AnimationLottie from 'assets/lottie/error-404-lottie.json'
import { useTranslation } from "react-i18next";
import Button from "shared/Button";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Error404 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className='w-full h-screen flex justify-center items-center bg-white dark:bg-first-dark-bg-color text-slate-600 dark:text-slate-300
       px-8'
    >
      <div className="flex flex-col justify-center items-center gap-10">
        <div className="w-72 h-72">

          <Lottie
            loop
            play
            animationData={error404AnimationLottie}
          />

        </div>
        <h4>
          {t('error404Text')}
        </h4>
        <Button className='flex' onClick={() => navigate('/')}>
          <FaArrowLeft className="w-4 h-4" />
          <span>
            {t('toDashboard')}
          </span>
        </Button>
      </div>
    </div>
  )
};

export default Error404;