import React from 'react'
import SearchBar from './def/Search'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSortAlphaDownAlt, faSortAlphaUpAlt, faSortAmountAsc, faSortAmountDesc, faWarning } from '@fortawesome/free-solid-svg-icons'
import OrderListPop from './pops/OrderListPop'
import { histStructure, TablePlaceType } from '../vite-env'
import { stateTraductions } from '../defaults/stateTraductions'
import { colorSelector } from '../logic/colorSelector'
import checkSearch from '../logic/checkSearch'

type Props = {
  setCurrent: Function
  tablePlaces: TablePlaceType[]
  historial: histStructure
  setPage: Function
}

export default function TableList({ setCurrent, tablePlaces, historial,setPage }: Props) {
  const [search, setSearch] = React.useState("")
  const [pop, setPop] = React.useState<"order" | undefined>(undefined)
  const sortIcons: { [key: string]: any } = {
    "abc-r": faSortAlphaDownAlt,
    "def": faSortAmountDesc,
    "abc": faSortAlphaUpAlt,
    "def-r": faSortAmountAsc,
  }

  const orderOptions = ["abc", "abc-r", "def", "def-r"]
  let sortValue = "def"

  const confirmOrderList = () => {
    console.log("confirm")
    setPop(undefined)
  }

  const Top = () => {
    return <header className='table-list-header'>
      <SearchBar
        searchButton={setSearch}
        placeholder='Buscar...'
        defaultValue={search}
        onChange
      />
      <button className='default-button' onClick={() => {
        setPop("order")
      }}>
        <FontAwesomeIcon icon={sortIcons[sortValue]} />
      </button>
    </header>
  }

  const constructor: { [key: string]: TablePlaceType[] } = {
    open: [],
    unnactive: [],
    closed: [],
  }

  for (let i = 0; i < tablePlaces.length; i++) {
    let key = "unnactive"
    if (historial[tablePlaces[i]._id]) key = historial[tablePlaces[i]._id]?.historial[historial[tablePlaces[i]._id].historial.length - 1].state
    constructor[key].push(tablePlaces[i])
  }

  const TableList = () => {
    return <section>
      {Object.keys(constructor).map(key => {
        let ul = constructor[key].map(el => {
          let check = checkSearch(el.name, search)
          return (search === "" || check !== el.name) && <button
            key={Math.random()}
            onClick={() => { setCurrent(el._id, key === "unnactive") }}
            style={{ backgroundColor: colorSelector[key] }}
            dangerouslySetInnerHTML={{ __html: check }}
          >
          </button>
        })

        return <div
          className='table-list-div'
          key={Math.random()}
        >
          <label>{stateTraductions[key]}</label>
          <ul className='table-list-ul'>
            {ul.length === 0 ? 
              <div className='no-items'>
                <FontAwesomeIcon icon={faWarning}/>
                No hay mesas que enlistar
              </div> : ul
            }
          </ul>
        </div>
      })}
    </section>
  }

  return <section className='page'>
    {pop && <OrderListPop
      options={orderOptions}
      actual={"def"}
      confirm={confirmOrderList}
      close={() => { setPop(undefined) }}
    />}
    <Top />
    <TableList />

    <button className='picker-mode-button' onClick={() => { setPage("picker") }}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
  </section>
}