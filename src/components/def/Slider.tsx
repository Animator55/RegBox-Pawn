import React from 'react'

type Props = {
    value: number
    setValue: Function
}

export default function Slider({ value, setValue }: Props) {
    const drag = (e: React.TouchEvent) => {
        let target = e.currentTarget as HTMLDivElement

        if (target.className !== "drag-slider") return
        let prevY = e.touches[0].clientY

        const move = (e2: TouchEvent) => {
            let result = (value +e2.touches[0].clientY -prevY) 
            target.style.top = result < 0 ? "0%" : result > 100 ? "100%" : result + "%"
            let draggable = document.querySelector(".draggable") as HTMLDivElement
            if(draggable) draggable.style.scale = `${(parseInt(target.style.top)/100)*1.5+0.5}`
        }

        const end = () => {
            document.removeEventListener("touchmove", move)
            document.removeEventListener("touchend", end)
            setValue((parseInt(target.style.top)/100)*1.5+0.5)
        }

        document.addEventListener("touchmove", move)
        document.addEventListener("touchend", end)
    }

    return <div className={"slider"}>
        <div className='back-slider'></div>
        <div className='drag-slider'
            onTouchStart={drag}
            style={{ top: value + "%" }}
        >
        </div>
    </div>
}