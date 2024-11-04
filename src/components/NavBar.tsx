import { faList } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

type Props = {
    setNav:Function
}

export default function NavBar({ setNav}: Props) {
  return <nav>
    <button
        onClick={()=>{setNav("list")}}
    ><FontAwesomeIcon icon={faList}/></button>
    <button
        onClick={()=>{setNav("map")}}
    ><FontAwesomeIcon icon={faList}/></button>
  </nav>
}