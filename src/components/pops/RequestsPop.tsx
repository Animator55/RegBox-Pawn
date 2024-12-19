
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "../../assets/pops.css"
import { SingleEvent } from "../../vite-env"
import { faCaretDown, faXmark } from "@fortawesome/free-solid-svg-icons"

type Props = {
  close: Function
  RequestTables: Function
}

export default function RequestsPop({ close, RequestTables }: Props) {
  let stor = window.localStorage.getItem("RegBoxPawn_requestHistorial")
  let newData: { [key: string]: SingleEvent } = {}
  if (stor !== null) newData = JSON.parse(stor)

  let list = []
  for (const key in newData) {
    let el = newData[key]
    list.push(<li
      key={Math.random()}
    >
      <header>
        <p>Mesa {el.name}</p>
        <i>{el.timestamp}</i>
        <button className="default-button" onClick={() => { console.log(el.notification_id) }}>Request</button>
        <button onClick={() => { console.log("a") }}>
          <FontAwesomeIcon icon={faCaretDown} />
        </button>
      </header>
    </li>)
  }
  return <section className='back-blur' onClick={(e) => {
    let target = e.target as HTMLDivElement
    if (target.className === "back-blur") close()
  }}>
    <section className='pop request-pop'>
      <header>
        <h3>Envíos</h3>
        <button onClick={() => {
          close()
        }}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </header>
      <ul>
        {list}
      </ul>
    </section>
  </section>
}