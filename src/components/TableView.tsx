import { faCaretLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { TableEvents } from '../vite-env'

type Props = {
    current: TableEvents | undefined
    setDisplay: Function
}

export default function TableView({current, setDisplay}: Props) {
  const Header = ()=>{
    if(!current) return
    return <header>
      <button onClick={()=>{setDisplay("list")}}>
        <FontAwesomeIcon icon={faCaretLeft}/>
      </button>
      <h3>{current.name}</h3>
      <p>{current.state}</p>
    </header>
  }
  const List = ()=>{ /// fix structure before doing this one
    return <ul>
      {current?.products.map(el=>{
        return <div key={Math.random()}>{el.name}</div>
      })}
    </ul>
  }

  const Bottom = ()=>{
    return <section>

    </section>
  }

  return <section>
    <Header/>
    <List/>
  </section>
}