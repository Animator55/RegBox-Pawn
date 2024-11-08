import { faList, faMap } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Props = {
  currentNav: string
  setNav: Function
}

export default function NavBar({ currentNav, setNav }: Props) {
  return <nav className='main-nav'>
    <button
      className={currentNav === "list" ? "active" : ""}
      onClick={() => { setNav("list") }}
      ><FontAwesomeIcon icon={faList} /></button>
    <button
      className={currentNav === "map" ? "active" : ""}
      onClick={() => { setNav("map") }}
    ><FontAwesomeIcon icon={faMap} /></button>
  </nav>
}