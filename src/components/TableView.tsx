import { faMinus, faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Item, TableEvents } from '../vite-env'
import { stateTraductions } from '../defaults/stateTraductions'
import { colorSelector } from '../logic/colorSelector'
import React from 'react'

type Props = {
  current: TableEvents | undefined
  setPage: Function
  setPicker: Function
  setMap: Function
  pickerOn: boolean
}

export default function TableView({ current, setPage, pickerOn, setPicker, setMap }: Props) {
  const Header = () => {
    if (!current) return
    return <header className='table-view-header'>
      <h3>Mesa {current.name}</h3>
      <p style={{ backgroundColor: colorSelector[current.state] }}>{stateTraductions[current.state]}</p>
    </header>
  }
  const List = () => { /// fix structure before doing this one
    return <ul className='table-list'>
      {current?.products.map((pha, i) => {
        return <div key={Math.random()}>
          <label>Tiempo {i + 1}</label>
          <ul>
            {pha.map((el: Item) => {
              return <div className='prod-item' key={Math.random()}>
                <div>{el.name}</div>
                <div>{el.amount}</div>
                <div className='amount-buttons'>
                  <button><FontAwesomeIcon icon={faPlus} /></button>
                  <button><FontAwesomeIcon icon={faMinus} /></button>
                </div>
              </div>
            })}
          </ul>
        </div>
      })}

    </ul>
  }
  
  React.useEffect(() => {
    history.pushState(null, "", location.href);

    const handlePopState = (event: PopStateEvent) => {
        event.preventDefault();
        setMap()
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
        window.removeEventListener("popstate", handlePopState);
    };
})


  return <section className='page'>
    <Header />
    <List />
    {(current && current.state !== "closed") && <>
      {!pickerOn && <button className='search-fixed-button'
        onClick={() => {
          setPicker(current.products)
          setPage("picker-with-data")
        }}>
        <FontAwesomeIcon icon={faPen} />
      </button>}
      <button className='picker-mode-button'
        style={pickerOn ? { backgroundColor: "var(--cgreen)" } : {}}
        onClick={() => { setPage("picker") }}>
        <FontAwesomeIcon icon={pickerOn ? faPen : faPlus} />
      </button>
    </>
    }
  </section>
}