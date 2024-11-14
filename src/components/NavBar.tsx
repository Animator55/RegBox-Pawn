import { faList, faMap } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Props = {
  currentNav: string
  setNav: Function
}

export default function NavBar({ currentNav, setNav }: Props) {
  return <button className='main-nav' onClick={() => { setNav(currentNav === "list" ? "map" :"list") }}>
    <FontAwesomeIcon icon={currentNav === "map" ? faList: faMap} />
  </button>
}