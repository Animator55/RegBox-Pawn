import { faWarning, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { HistorialTableType } from "../../vite-env"
import { stateTraductions } from "../../defaults/stateTraductions"
import { colorSelector } from "../../logic/colorSelector"



type Props = {
    close: Function
    selectedTable: HistorialTableType | undefined
}

export default function TableHistorial({ close, selectedTable }: Props) {
    const jump = (index: number) => {
        let ul = document.querySelector(".historial-list")
        if (ul && ul.children[index]) ul.children[index].scrollIntoView({ block: "start", behavior: "smooth" })
    }
    const ViewTable = () => {
        if (!selectedTable) return
        let entries: string[][] = []
        let stor = selectedTable
        if (stor && stor.historial) for (let i = stor.historial.length - 1; i >= 0; i--) {
            entries?.push(stor.historial[i].opened)
        }

        const Historial = () => {
            if (!stor) return
            let list = []
            for (let i = stor.historial.length - 1; i >= 0; i--) {
                let el = stor.historial[i]
                let array = el.events
                list.push(<div key={Math.random()}>
                    <header className='span-header' style={{ background: colorSelector[el.state] }}>
                        <p className='time'>{el.opened[0]}</p>
                        <p>{stateTraductions[el.state]}</p>
                        {el.total !== "$0" ? el.discount !== 0 ?
                            <div>
                                <del style={{ opacity: 0.5 }}>{el.total}</del>
                                {" $" + Math.floor((parseInt(el.total.slice(1))) * (1 - (el.discount / 100)))}
                            </div>
                            :
                            <div>{el.total}</div>
                            : null}
                    </header>
                    <div className='event-list'>
                        {array && array.length !== 0 && array.map((li) => {
                            return <div className={li.important ? "event important" : 'event'} key={Math.random()}>
                                {li.timestamp}
                                {" "+li.comment}
                            </div>
                        })}
                    </div>
                </div>)

            }
            return list
        }

        return <>
            <nav className='historial-nav'>
                {entries && entries.map((el, i) => {
                    return <button key={Math.random()} onClick={() => { jump(i) }}>
                    {el[0]}
                    </button>
                })}
            </nav>
            <div>
                <div>
                    <h3>Mesa {selectedTable.name}</h3>
                </div>
                <hr></hr>
                <ul className='historial-list'>
                    <Historial />
                </ul>
            </div>
        </>
    }


    const Alert = () => {
        return <section className='warning'>
            <FontAwesomeIcon icon={faWarning} />
            <h2>No hay historial.</h2>
        </section>
    }
    return <section className='back-blur' onClick={(e) => {
        let target = e.target as HTMLDivElement
        if (target.className === "back-blur") close()
    }}>
        <section className='pop request-pop'>
            <header>
                <h3>Historial</h3>
                <button onClick={() => {
                    close()
                }}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </header>
            <section className="historial-content">
                {selectedTable ? <ViewTable /> : <Alert />}
            </section>
        </section>
    </section>
}