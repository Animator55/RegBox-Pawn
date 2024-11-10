import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TableEvents } from '../vite-env'
import { stateTraductions } from '../defaults/stateTraductions'
import { colorSelector } from '../logic/colorSelector'

type Props = {
    current: TableEvents | undefined
    setDisplay: Function
    setPage: Function
}

export default function TableView({current, setDisplay, setPage}: Props) {
  const Header = ()=>{
    if(!current) return
    return <header className='table-view-header'>
      <button className='default-button' onClick={()=>{setDisplay("list")}}>
        <FontAwesomeIcon icon={faArrowLeft}/>
      </button>
      <h3>Mesa {current.name}</h3>
      <p style={{backgroundColor: colorSelector[current.state]}}>{stateTraductions[current.state]}</p>
    </header>
  }
  const List = ()=>{ /// fix structure before doing this one
    return <ul>
      {current?.products.map(el=>{
        return <div key={Math.random()}>{el.name}</div>
      })}
    </ul>
  }


  return <section className='page'>
    <Header/>
    <List/>
    <button className='picker-mode-button' onClick={() => { setPage("picker") }}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
  </section>
}