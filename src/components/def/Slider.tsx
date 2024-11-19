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
            let result = (value + (e2.touches[0].clientY - prevY)/2)
            target.style.top = result < 0 ? "0%" : result > 90 ? "90%" : result + "%"
            let draggable = document.querySelector(".draggable") as HTMLDivElement
            if (!draggable) return
            let prevData = draggable.style.transform

            const regex = /scale\(([\d.]+)\)\s+translate\(([\d.-]+)px,\s*([\d.-]+)px\)/;

            const matches = prevData.match(regex);
            if (matches) {
                const translateX = parseFloat(matches[2]);
                const translateY = parseFloat(matches[3]);

                draggable.style.transform = `scale(${(parseFloat(target.style.top) / 100) * 1.5 + 0.5}) translate(${translateX}px,${translateY}px)`
            }

        }

        const end = () => {
            document.removeEventListener("touchmove", move)
            document.removeEventListener("touchend", end)
            setValue((parseFloat(target.style.top) / 100) * 1.5 + 0.5)
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