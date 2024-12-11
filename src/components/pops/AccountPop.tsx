import { faArrowRightFromBracket, faRepeat } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "../../assets/pops.css"

type Props = {
    close: Function
    RequestTables: Function
}

export default function AccountPop({close, RequestTables}: Props) {
  return <section className='back' onClick={(e) => {
    let target = e.target as HTMLDivElement
    if (target.className === "back") close()
  }}>
    <section className='pop account-span'>
      <ul>
        <button onClick={()=>{
          RequestTables()
          close()
        }}>
          <FontAwesomeIcon icon={faRepeat}/>
          Actualizar mapa
        </button>
        <button onClick={()=>{
          console.log("close session")
        }}>
          <FontAwesomeIcon icon={faArrowRightFromBracket}/>
          Cerrar sesión
        </button>
      </ul>
    </section>
  </section>
}