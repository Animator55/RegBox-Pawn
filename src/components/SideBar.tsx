import { faArrowRotateBack, faListUl, faWarning, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { histStructure, TablePlaceType } from '../vite-env'
import React from 'react'
import SearchBar from './def/Search'
import checkSearch from '../logic/checkSearch'
import { colorSelector } from '../logic/colorSelector'

import "../assets/sidebar.css"

type Props = {
  isCurrent: string | undefined
  setCurrent: Function
  tablePlaces: TablePlaceType[]
  historial: histStructure | undefined
  setMap: Function
  cancelPicker: Function
}

export default function SideBar({ setCurrent, tablePlaces, historial, setMap, isCurrent, cancelPicker }: Props) {
  const [search, setSearch] = React.useState("")
  const [visible, setVisibleState] = React.useState(false)

  const setVisible = (val: boolean) => {
    if (val) setVisibleState(val)
    let sidebar = document.querySelector(".side-bar") as HTMLDivElement
    if (!sidebar) return
    sidebar.classList.add("fade-to-left")
    sidebar.offsetTop
    setTimeout(() => {
      setVisibleState(val)   
      cancelPicker([[]])
    }, 300)
  }

  const constructor: { [key: string]: TablePlaceType[] } = {
    open: [],
    unnactive: [],
    closed: [],
  }

  for (let i = 0; i < tablePlaces.length; i++) {
    let key = "unnactive"
    if (historial && historial[tablePlaces[i]._id]) key = historial[tablePlaces[i]._id]?.historial[historial[tablePlaces[i]._id].historial.length - 1].state
    constructor[key].push(tablePlaces[i])
  }

  const TableList = () => {
    let ul: JSX.Element[] = []
    for (const key in constructor) {
      constructor[key].map((el) => {
        let check = checkSearch(el.name, search)
        if (search === "" || check !== el.name) ul.push(<button
          key={Math.random()}
          className={isCurrent === el._id ? "active" : ""}
          onClick={() => { setCurrent(el._id, key === "unnactive") }}
          style={{
            color: colorSelector[key],
            borderColor: colorSelector[key],
            background: "linear-gradient(270deg," + colorSelector[key] + " -30%, transparent, black 95%)",
            animationDelay: (ul.length * 100) + "ms",
          }}
          dangerouslySetInnerHTML={{ __html: check }}
        >
        </button>)
      })
    }

    return ul.length === 0 ? <div className='warning'>
      <FontAwesomeIcon icon={faWarning} />
      <p>No hay mesas que enlistar</p>
    </div>
      : <ul className="table-list-side">{ul}</ul>
  }

  return visible ? <section className='back' onClick={(e) => {
    let target = e.target as HTMLDivElement
    if (target.className === "back") setVisible(false)
  }}><section className='side-bar'>
      <SearchBar
        searchButton={setSearch}
        placeholder='Buscar...'
        defaultValue={search}
        onChange
        focus={search !== ""}
      />
      <TableList />
      <footer>
        <button className='main-nav close' onClick={() => { setVisible(false) }}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
        {isCurrent !== undefined && <button onClick={() => {
          setMap(); setVisible(false)
        }} className='return-to-map'>
          <FontAwesomeIcon icon={faArrowRotateBack} />
        </button>}
      </footer>
    </section>
  </section>
    : <button className='main-nav' onClick={() => { setVisible(true) }}>
      <FontAwesomeIcon icon={faListUl} />
    </button>
}