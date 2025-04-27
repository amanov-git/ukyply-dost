import Select from 'react-select'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';


const ReactSelect = (props) => {
  const { t } = useTranslation();

  const {
    selectOptions,
    isLoading = false,
    handleChange,
    id,
    name,
    defaultValue,
    value,
    isMulti = true
  } = props

  const controlStyles = {
    base: "border dark:border-slate-600 rounded-lg bg-transparent  hover:cursor-pointer",
    focus: "outline-double outline-3 outline-offset-2",
    nonFocus: "border-gray-300 hover:border-gray-400",
  };
  const placeholderStyles = "text-gray-500 pl-1 py-0.5";
  const selectInputStyles = "pl-1 py-0.5";
  const valueContainerStyles = "p-1 gap-1 bg-slate-50 rounded-md dark:bg-slate-700";
  const singleValueStyles = "leading-7 ml-1";
  const multiValueStyles =
    "bg-gray-100 rounded items-center py-0.5 pl-2 pr-1 gap-1.5 dark:bg-slate-700";
  const multiValueLabelStyles = "leading-6 py-0.5";
  const multiValueRemoveStyles =
    "border border-gray-200 bg-white hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md";
  const indicatorsContainerStyles = "p-1 gap-1 bg-slate-50 rounded-md dark:bg-slate-700";
  const clearIndicatorStyles =
    "text-gray-500 p-1 rounded-md hover:bg-red-50 hover:text-red-800";
  const indicatorSeparatorStyles = "bg-gray-300";
  const dropdownIndicatorStyles =
    "p-1 hover:bg-gray-100 text-gray-500 rounded-md hover:text-black";
  const menuStyles = "p-1 mt-2 border border-gray-500 bg-white dark:bg-slate-700 bg-main-night-bg-color  rounded-lg";
  const groupHeadingStyles = "ml-3 mt-2 mb-1 text-gray-500 text-sm";
  const optionStyles = {
    base: "hover:cursor-pointer px-3 py-2 rounded dark:bg-slate-700",
    focus: "bg-gray-100 active:bg-gray-200 dark:bg-gray-600",
    selected: "after:content-['✔'] after:ml-2 after:text-green-500 text-gray-500",
  };
  const noOptionsMessageStyles =
    "text-gray-500 p-2 bg-gray-50 border border-dashed border-gray-200 rounded-sm";

  return (
    <Select
      // isMulti
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      placeholder={t('select')}
      unstyled
      styles={{
        input: (base) => ({
          ...base,
          "input:focus": {
            boxShadow: "none",
          },
        }),
        // On mobile, the label will truncate automatically, so we want to
        // override that behaviour.
        multiValueLabel: (base) => ({
          ...base,
          whiteSpace: "normal",
          overflow: "visible",
        }),
        control: (base) => ({
          ...base,
          transition: "none",
        }),
      }}
      classNames={{
        control: ({ isFocused }) =>
          clsx(
            isFocused ? controlStyles.focus : controlStyles.nonFocus,
            controlStyles.base,
          ),
        placeholder: () => placeholderStyles,
        input: () => selectInputStyles,
        valueContainer: () => valueContainerStyles,
        singleValue: () => singleValueStyles,
        multiValue: () => multiValueStyles,
        multiValueLabel: () => multiValueLabelStyles,
        multiValueRemove: () => multiValueRemoveStyles,
        indicatorsContainer: () => indicatorsContainerStyles,
        clearIndicator: () => clearIndicatorStyles,
        indicatorSeparator: () => indicatorSeparatorStyles,
        dropdownIndicator: () => dropdownIndicatorStyles,
        menu: () => menuStyles,
        groupHeading: () => groupHeadingStyles,
        option: ({ isFocused, isSelected }) =>
          clsx(
            isFocused && optionStyles.focus,
            isSelected && optionStyles.selected,
            optionStyles.base,
          ),
        noOptionsMessage: () => noOptionsMessageStyles,
      }}
      options={selectOptions}
      isLoading={isLoading}
      onChange={handleChange}
      id={id}
      name={name}
      defaultValue={defaultValue}
      value={value}
      isMulti={isMulti}
    />
  )
}

export default ReactSelect;