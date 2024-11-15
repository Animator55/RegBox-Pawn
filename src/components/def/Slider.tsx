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
            let result = (value/2 +e2.touches[0].clientY -prevY)
            target.style.top = result/2 < 0 ? "0%" : result/2 > 200 ? "100%" : result/2 + "%"
            let draggable = document.querySelector(".draggable") as HTMLDivElement
            if(draggable) draggable.style.scale = `${result/100}`
        }

        const end = () => {
            document.removeEventListener("touchmove", move)
            document.removeEventListener("touchend", end)
            setValue(parseInt(target.style.top)*2/100)
        }

        document.addEventListener("touchmove", move)
        document.addEventListener("touchend", end)
    }

    return <div className={"slider"}>
        <div className='back-slider'></div>
        <div className='drag-slider'
            onTouchStart={drag}
            style={{ top: value/2 + "%" }}
        >
        </div>
    </div>
}