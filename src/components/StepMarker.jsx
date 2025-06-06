export function StepMarker({ selected, text, label, showText, line, step }) {
  return (
    <div
      className={`flex gap-2 sm:gap-4 items-start text-sm mb-10 sm:pl-1 ${line ? 'w-full' : ''}`}
    >
      <div className="flex flex-col items-center relative">
        <span
          className={`w-8 h-8 font-semibold flex items-center justify-center text-white transition-all duration-[660ms] rounded-full ${selected ? 'bg-blue-500' : 'bg-blue-500/20'}`}
        >
          {label}
        </span>
        <div
          className={`
            absolute
            text-xs
            sm:text-md
            font-semibold
            text-nowrap
            bottom-[-20px]
            text-blue-500
            transition-all
            duration-[660ms]
            ${showText ? 'opacity-100' : 'opacity-0'}
        `}
        >
          {text}
        </div>
      </div>
      {line ? (
        <div
          className={`grow mt-4 mr-2 sm:mr-4 w-1 h-1 rounded-full transition-all duration-[660ms]  ${step - 1 >= label ? 'bg-blue-500' : 'bg-blue-500/20'}`}
        />
      ) : (
        ''
      )}
    </div>
  )
}
