import { useRef, useState } from 'react'
import Select from 'react-select'

export function InputSelect({
  label,
  onChange,
  value,
  options,
  error,
  controlClass,
  labelSize
}) {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  const selectRef = useRef(null)

  const handleLabelClick = () => {
    if (selectRef.current) {
      selectRef.current.focus()
      selectRef.current.onMenuOpen()
    }
  }

  return (
    <div className="w-full relative h-full">
      <Select
        ref={selectRef}
        value={options.find((e) => e.value === value)}
        placeholder=" "
        options={options}
        onChange={(value) => onChange(value.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        isSearchable={false}
        formatOptionLabel={(option) => (
          <div className="flex flex-row items-center gap-3 cursor-pointer">
            <div>{option.label}</div>
          </div>
        )}
        classNamePrefix="react-select"
        classNames={{
          control: () =>
            `px-2 ${label ? 'pt-4 pb-2' : ''} h-full ` + controlClass,
          input: () => 'text-lg',
          option: () => 'text-lg',
          container: () => 'h-full'
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 6,
          zIndex: 100,
          colors: {
            ...theme.colors,
            primary: error && !value ? 'rgb(244 63 94)' : '#5599ff',
            primary25: '#3b83f661',
            neutral20: '#5599ff'
          }
        })}
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: '#fefefe',
            borderWidth: '2px',
            borderColor: error && !value ? 'rgb(244 63 94)' : '#5599ff',
            cursor: 'pointer',
            ':hover': {
              borderColor: error && !value ? '#5599ff' : '#5599ff'
            }
          })
        }}
      />
      <label
        onClick={handleLabelClick}
        className={`
        cursor-pointer
        absolute
        text-wrap
        text-sm
        sm:${labelSize || 'text-lg'}
        max-w-[75%]
        duration-150
        transform
        -translate-y-4
        top-5
        origin-[0]
        ${value || isFocused ? '-translate-y-4' : 'translate-y-0'}
        ${isFocused ? 'scale-75' : 'scale-100'}
        left-4
        ${error && !value ? 'text-rose-500' : 'text-zinc-500'}
      `}
      >
        {label}
      </label>
    </div>
  )
}
