import Flag from 'react-world-flags';
import { toggleTheme } from 'stores/darkLightMode';
import { CiLight } from "react-icons/ci";
import { MdDarkMode } from "react-icons/md";
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useMemo } from 'react';
import { t } from 'i18next';
import i18n from 'libs/i18';
import { useRef } from 'react';
import Button from 'shared/Button';

const UserProfileSettingsTab = ( ) => {

  const [isOpen, setIsOpen] = useState(false);

  const countries = useMemo(() => [
    { code: "GB", name: "EN", lang: 'en' },
    { code: "TM", name: "TM", lang: 'tm' },
    { code: "RU", name: "RU", lang: 'ru' },
  ], []);

  const getStoredLanguage = useMemo(() => {
    const storedLanguage = localStorage.getItem("language");
    return storedLanguage ? countries.find(country => country.lang === storedLanguage) : countries[0];
  }, [countries]);

  const [selectedCountry, setSelectedCountry] = useState(getStoredLanguage);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  useEffect(() => {
    i18n.changeLanguage(selectedCountry.lang);
    localStorage.setItem("language", selectedCountry.lang);
    localStorage.setItem("langDropdown", JSON.stringify(selectedCountry));
  }, [selectedCountry, i18n]);

  const { theme } = useSelector((state) => state.darkLightMode);
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme]);

  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);

  return (
    <div className='flex flex-col sm:flex-row gap-14'>

      {/* Dropdown languages menu */}
      <div className='flex items-center gap-4'>
        <p>
          {t('selectWebsiteLanguage')} :
        </p>
        <div className="relative inline-block text-left" ref={ref}>
          <button
            className={`inline-flex justify-center w-24 px-4 py-2 rounded-md shadow-md focus:outline-none dark:bg-secondary`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center">
              <Flag code={selectedCountry.code} className="w-5 h-5 mr-2" />
              {selectedCountry.name}
            </div>
          </button>
          {isOpen && (
            <ul className="absolute z-10 w-32 mt-2 bg-white border dark:bg-secondary rounded-md dark:border-slate-700 shadow-md">
              {countries.map((country) => (
                <li
                  key={country.code}
                  onClick={() => handleCountryChange(country)}
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                >
                  <Flag code={country.code} className="w-5 h-5 mr-2" />
                  {country.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Dark light mode button */}
      <div className='flex items-center gap-4'>
        <p>
          {t('selectWebsiteThemeMode')} :
        </p>
        <Button className='w-fit' onClick={() => dispatch(toggleTheme())}>
          {localStorage.getItem('theme') === 'light' ? <MdDarkMode className='w-8 h-8' /> : <CiLight className='w-8 h-8' />
            || <MdDarkMode className='w-8 h-8' />}
        </Button>
      </div>

    </div>
  )
}

export default UserProfileSettingsTab;