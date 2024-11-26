import React from "react"

type Props = {
    title: string
    subTitle?: string,
    confirm: Function
    close: Function
    time?: boolean
}

export default function ConfirmPop({ title, confirm, close, subTitle, time }: Props) {
    React.useEffect(() => {
        let pop = document.querySelector(".confirm-pop")
        if (time) setTimeout(() => {
            if (pop) confirm()
        }, 1000)
    })

    return <section className='back-blur confirm-spefic' onClick={(e) => {
        let target = e.target as HTMLDivElement
        if (target.className === "back-blur confirm-spefic") close()
    }}>
        <section className='pop confirm-pop'>
            <h2>{title}</h2>
            {subTitle && <p>{subTitle}</p>}
            {time ?
                <div>
                    <div className="progress-bar"></div>
                    <div className='buttons-confirm'>
                        <button className="default-button" onClick={() => { close() }}>Cancelar</button>
                    </div>
                </div>
                : <>
                    <hr></hr>
                    <div className='buttons-confirm'>
                        <button className="default-button" onClick={() => { confirm() }}>Si</button>
                        <button className="secondary-button" onClick={() => { close() }}>No</button>
                    </div>
                </>
            }
        </section>
    </section>
}