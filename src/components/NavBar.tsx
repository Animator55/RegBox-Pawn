import { faArrowLeft, faList, faMap } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { router } from '../vite-env'

type Props = {
  currentNav: string
  defaultSelector: string
  setNav: Function
}

export default function NavBar({ currentNav, defaultSelector, setNav }: Props) {
  const routing : router ={
    "list":"map",
    "view": defaultSelector,
    "map": "list"
  }
  const routingIcon : router ={
    "list":faMap,
    "view": faArrowLeft,
    "map": faList
  }

  return <button className='main-nav' onClick={() => { 
      setNav(routing[currentNav]) 
    }}>
    <FontAwesomeIcon icon={routingIcon[currentNav]} />
  </button>
}