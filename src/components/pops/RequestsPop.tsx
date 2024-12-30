
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "../../assets/pops.css"
import { SingleEvent } from "../../vite-env"
import { faCaretDown, faCheck, faClipboard, faQuestionCircle, faWarning, faXmark } from "@fortawesome/free-solid-svg-icons"
import React from "react"

type Props = {
  close: Function
  setPicker: Function
  RequestNotificationState: Function
}

export default function RequestsPop({ close, setPicker, RequestNotificationState }: Props) {
  let [opened, setOpened] = React.useState<string[]>([])
  const divRef = React.useRef<HTMLUListElement | null>(null);

  let stor = window.localStorage.getItem("RegBoxPawn_requestHistorial")
  let newData: { [key: string]: SingleEvent } = {}
  if (stor !== null) newData = JSON.parse(stor)

  let list = []
  for (const key in newData) {
    let el = newData[key]
    let ul = []
    let isExpanded = el.notification_id && opened.includes(el.notification_id)
    let hasProds = el.products !== undefined && el.products.length !== 0
    let total = (el.products?.flat().length ? el.products?.flat().length : 0) - 1
    let phasesLength = (isExpanded) ? el.products?.length! : 1
    for (let i = 0; i < phasesLength; i++) {
      if (!el.products) break
      let length = (isExpanded) ? el.products[i]?.length! : 1
      for (let j = 0; j < length; j++) {
        if (!el.products || !el.products[i] || !el.products[i][j]) break
        ul.push(<div
          key={Math.random()}
        >
          <div>
            {el.products[i][j].amount}
          </div>
          <div>
            {el.products[i][j].name}
          </div>
        </div>)
      }
      if (isExpanded) ul.push(<hr
        key={Math.random()}></hr>)
    }

    list.unshift(<li
      key={Math.random()}
      className={
        (el.notification_id && opened.indexOf(el.notification_id) === opened.length - 1) ? "just-expanded" :
          isExpanded ? "expanded" :
            ""}
    >
      <header>
        <p>Mesa {el.name}</p>
        <i>{el.timestamp}</i>
        {(isExpanded) && <>
          <button
            className="copy-prods"
            onClick={() => { RequestNotificationState(el.notification_id) }}
            style={{ animationDelay: "100ms" }}
          >
            <FontAwesomeIcon icon={el.recieved ? faCheck : faQuestionCircle} />
          </button>
          <button className="copy-prods" onClick={() => { setPicker(el.products) }}>
            <FontAwesomeIcon icon={faClipboard} />
          </button>
        </>
        }
        {hasProds ? <button onClick={() => {
          if (!el.notification_id) return
          if (!opened.includes(el.notification_id)) setOpened([...opened, el.notification_id])
          else setOpened(opened.filter((id) => { if (id !== el.notification_id) return id }))
        }}>
          <FontAwesomeIcon icon={faCaretDown} />
        </button>
          : <button
            className="copy-prods"
            onClick={() => { RequestNotificationState(el.notification_id) }}
          >
            <FontAwesomeIcon icon={el.recieved ? faCheck : faQuestionCircle} />
          </button>
        }
      </header>
      <section className={isExpanded ? "request-products-list expanded" : "request-products-list"}>
        {ul}
        {(!(isExpanded) && total > 0) && <div className="extra-number">
          +{total}
        </div>}
      </section>
    </li>)
  }

  React.useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollTop
    }
  })

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
        <ul className="requests-list"
          ref={divRef}>
          {list}
        </ul>
      }
    </section>
  </section>
}