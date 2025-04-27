import Lottie from 'react-lottie-player';
import lockAnimationLottie from 'assets/lottie/lock-animation-lottie.json';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "shared/Button";
import { FaArrowLeft } from "react-icons/fa6";

// COMPONENT
const RegisterSuccess = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    navigate('/login')
  };

  return (
    <div
      className='w-full h-screen flex justify-center items-center bg-white dark:bg-first-dark-bg-color text-slate-600 dark:text-slate-300
       px-8'
    >
      <div className="flex flex-col justify-center items-center gap-10">
        <div className="w-72 h-72">

          <Lottie
            play
            loop
            animationData={lockAnimationLottie}
            speed={0.7}
          />

        </div>
        <h4 className="text-center">
          {t('registeredText')}
        </h4>
        <Button className='flex' onClick={handleClick}>
          <FaArrowLeft className="w-4 h-4" />
          <span>
            {t('toLogin')}
          </span>
        </Button>
      </div>
    </div>
  )
};


export default RegisterSuccess;