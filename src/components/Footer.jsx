import { useTranslation } from 'react-i18next'




const Footer = () => {
  const { t } = useTranslation()

  return (
    <div className='py-4 flex justify-center container mx-auto mt-10'>
      <p>
        {t('footerRights')}
      </p>
    </div>
  )
}


export default Footer