import { faCheck, faClockRotateLeft, faMinus, faPen, faPlus, faWarning } from '@fortawesome/free-solid-svg-icons'
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
  addItem: Function
  pickerOn: boolean
  picker: Item[][]
  confirmPicker: Function
  viewHistorial: Function
}

export default function TableView({ current, setPage, pickerOn, picker, setPicker, setMap, addItem, confirmPicker,viewHistorial }: Props) {
  const [selected, setSelected] = React.useState<{ phase: number, item: string } | undefined>(undefined)

  const Header = () => {
    if (!current) return
    return <header className='table-view-header'>
      <h3>Mesa {current.name}</h3>
      <button className='default-button' onClick={()=>{
        viewHistorial()
      }}>
        <FontAwesomeIcon icon={faClockRotateLeft}/>
      </button>
      <p style={{ color: colorSelector[current.state] }}>{stateTraductions[current.state]}</p>
    </header>
  }
  const List = () => { /// fix structure before doing this one
    return <ul className='table-list'>
      {current?.products.length === 0 ?
        <div className='warning'>
          <FontAwesomeIcon icon={faWarning} />
          <p>No hay productos que enlistar.</p>
        </div>
        :
        current?.products.map((pha, i) => {
          return <div key={Math.random()}>
            <label>Tiempo {i + 1}</label>
            <ul>
              {pha.map((el: Item, j) => {
                let check = picker[i]
                let isSelected = selected?.phase === i && selected.item === el._id
                return !(pickerOn && check && picker[i][j] === undefined) &&  <div
                  className={isSelected ? 'prod-item selected' : 'prod-item'}
                  onClick={() => {
                    if (!isSelected) setSelected({ phase: i, item: el._id })
                  }} key={Math.random()}>
                  <div>{el.name}</div>
                  <div style={pickerOn && check && picker[i][j].amount !== el.amount ? {color: picker[i][j].amount! > el.amount! ? "var(--cgreen)" : "var(--cred)"}: {}} className="amount-div">{pickerOn && check ? picker[i][j].amount : el.amount}</div>
                  <div className='amount-buttons'>
                    <button onClick={() => {
                      addItem(pickerOn && check ? picker[i][j] : el, 1, i)
                    }}>
                      <FontAwesomeIcon icon={faPlus} /></button>
                    <button onClick={() => {
                      addItem(pickerOn && check ? picker[i][j] : el, -1, i)
                    }}>
                      <FontAwesomeIcon icon={faMinus} /></button>
                  </div>
                </div>
              })}
            </ul>
          </div>
        })}

    </ul>
  }

  React.useEffect(() => {
    if(current?.state === "unnactive") setMap()
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


  return current && current.state !== "unnactive" && <section className='page'>
    <Header />
    <List />
    {(current && current.state !== "closed") && <>
      {(!pickerOn && current.products.length !== 0) && <button className='search-fixed-button'
        onClick={() => {
          setPicker(current.products)
          setPage("picker-with-data")
        }}>
        <FontAwesomeIcon icon={faPen} />
      </button>}
      <button className='picker-mode-button'
        style={pickerOn ? { backgroundColor: "var(--cgreen)" } : {}}
        onClick={() => {
          if (pickerOn) { confirmPicker() }
          else { setPage("picker") }
        }}>
        <FontAwesomeIcon icon={pickerOn ? faCheck : faPlus} />
      </button>
    </>
    }
  </section>
}