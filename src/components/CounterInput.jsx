import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai'

export function CounterInput({ onAdd, onReduce, value, title, subtitle }) {
  return (
    <div className="w-full p-3 flex flex-row items-center justify-between bg-[#e0e0e0] border-2 border-neutral-300 rounded-md">
      <div className="flex flex-col">
        <div className="font-medium text-neutral-500 text-sm sm:text-base min-h-10">
          {title}
        </div>
        <div className="font-light text-gray-600 text-sm sm:text-base">
          {subtitle}
        </div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <button
          type="button"
          onClick={onReduce}
          className="
            w-10
            h-10
            rounded-full
            border-[1px]
            border-neutral-400
            flex
            items-center
            justify-center
            text-zinc-500
            cursor-pointer
            bg-white/60
            hover:opacity-80
            transition
          "
        >
          <AiOutlineMinus />
        </button>
        <div className="text-center font-light text-xl text-neutral-600 select-none min-w-5">
          {value}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="
            w-10
            h-10
            rounded-full
            border-[1px]
          bg-white/60
            border-neutral-400
            flex
            items-center
            justify-center
            text-neutral-600
            cursor-pointer
            hover:opacity-80
            transition
          "
        >
          <AiOutlinePlus />
        </button>
      </div>
    </div>
  )
}
