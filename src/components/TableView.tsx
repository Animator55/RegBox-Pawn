import { faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Item, TableEvents } from '../vite-env'
import { stateTraductions } from '../defaults/stateTraductions'
import { colorSelector } from '../logic/colorSelector'

type Props = {
  current: TableEvents | undefined
  setPage: Function
  pickerOn: boolean
}

export default function TableView({ current, setPage, pickerOn }: Props) {
  const Header = () => {
    if (!current) return
    return <header className='table-view-header'>
      <h3>Mesa {current.name}</h3>
      <p style={{ backgroundColor: colorSelector[current.state] }}>{stateTraductions[current.state]}</p>
    </header>
  }
  const List = () => { /// fix structure before doing this one
    return <ul>
      {current?.products.map((pha, i) => {
        return <div key={Math.random()}>
          <label>Tiempo {i+1}</label>
          <ul>
            {pha.map((el:Item) => {
              return <div className='prod-item' key={Math.random()}>
                <div>{el.name}</div>
                <div>x{el.amount}</div>
              </div>
            })}
          </ul>
        </div>
      })}

    </ul>
  }


  return <section className='page'>
    <Header />
    <List />
    <button className='picker-mode-button'
      style={pickerOn ? { backgroundColor: "var(--cgreen)" } : {}}
      onClick={() => { setPage("picker") }}>
      <FontAwesomeIcon icon={pickerOn ? faPen : faPlus} />
    </button>
  </section>
}