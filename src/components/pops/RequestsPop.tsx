
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "../../assets/pops.css"
import { SingleEvent } from "../../vite-env"
import { faCaretDown, faClipboard, faWarning, faXmark } from "@fortawesome/free-solid-svg-icons"
import React from "react"

type Props = {
  close: Function
  setPicker: Function
}

export default function RequestsPop({ close, setPicker }: Props) {
  let [opened, setOpened] = React.useState<string[]>([])

  let stor = window.localStorage.getItem("RegBoxPawn_requestHistorial")
  let newData: { [key: string]: SingleEvent } = {}
  if (stor !== null) newData = JSON.parse(stor)

  let list = []
  for (const key in newData) {
    let el = newData[key]
    let ul=[]
    let phasesLength = (el.notification_id && opened.includes(el.notification_id)) ? el.products?.length! : 1
    for(let i=0;i<phasesLength; i++){
      if(!el.products) break
      let length = (el.notification_id && opened.includes(el.notification_id)) ? el.products[i]?.length! : 3
      for(let j=0; j<length; j++){
        if(!el.products || !el.products[0] || !el.products[0][j]) break
        ul.push(<div
          key={Math.random()}
        >
          {el.products[0][j].amount}
          X
          {el.products[0][j].name}
        </div>)
      }
      if(el.notification_id && opened.includes(el.notification_id))ul.push(<hr></hr>)
    }

    list.push(<li
      key={Math.random()}
    >
      <header>
        <p>Mesa {el.name}</p>
        <i>{el.timestamp}</i>
        <button className="default-button" onClick={() => { console.log(el.notification_id) }}>Request</button>
        <button onClick={() => {
          if (!el.notification_id) return
          if (!opened.includes(el.notification_id)) setOpened([...opened, el.notification_id])
          else setOpened(opened.filter((id) => { if (id !== el.notification_id) return id}))
        }}>
          <FontAwesomeIcon icon={faCaretDown} />
        </button>
      </header>
      {(el.notification_id && opened.includes(el.notification_id)) && <section>
        <button  onClick={() => { setPicker(el.products) }}>
          <FontAwesomeIcon icon={faClipboard} />
          Copiar Productos
        </button>
      </section>}
      <section>
        {ul}
      </section>
    </li>)
  }
  const Alert = () => {
    return <section className='warning'>
      <FontAwesomeIcon icon={faWarning} />
      <h2>No hay historial de envíos.</h2>
    </section>
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
      {list.length === 0 ?
        <Alert />
        :
        <ul>
          {list}
        </ul>
      }
    </section>
  </section>
}