export function Input({ id, label, error, register, required }) {
  return (
    <div className="w-full relative">
      <input
        id={id}
        placeholder=" "
        {...register(id, { required })}
        className={`
        peer
        w-full
        p-4
        pt-6
        font-light
        bg-[#f7f7f7]
        border-2
        rounded-md
        outlined-none
        focus:outline-none
        transition
        disabled:opacity-70
        disabled:cursor-not-allowed
        pl-4
        focus:border-blue-500
        ${error ? 'border-rose-500' : 'border-blue-300'}
        ${error ? 'focus:border-rose-500' : 'focus:border-blue-500'}
      `}
      />
      <label
        htmlFor={id}
        className={`
        absolute
        text-xs
        sm:text-lg
        cursor-text
        duration-150
        transform
        -translate-y-5
        top-6
        sm:top-5
        origin-[0]
        peer-placeholder-shown:scale-100
        peer-placeholder-shown:translate-y-0
        peer-focus:scale-75
        peer-focus:-translate-y-4
        left-4
        ${error ? 'text-rose-500' : 'text-blue-500'}
      `}
      >
        {label}
      </label>
    </div>
  )
}
