import React from 'react'
import SearchBar from './def/Search'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortAlphaDownAlt, faSortAlphaUpAlt, faSortAmountAsc, faSortAmountDesc } from '@fortawesome/free-solid-svg-icons'
import OrderListPop from './pops/OrderListPop'
import { histStructure, TablePlaceType } from '../vite-env'
import { stateTraductions } from '../defaults/stateTraductions'
import { colorSelector } from '../logic/colorSelector'

type Props = {
  setCurrent: Function
  tablePlaces: TablePlaceType[]
  historial: histStructure
}

export default function TableList({setCurrent,tablePlaces, historial}: Props) {
    const [search, setSearch] = React.useState("")
    const [pop, setPop] = React.useState<"order" | undefined>(undefined)
    const sortIcons:{[key:string]: any} = {
      "abc-r": faSortAlphaDownAlt,
      "def": faSortAmountDesc,
      "abc": faSortAlphaUpAlt,
      "def-r": faSortAmountAsc,
    }
  
    const orderOptions = ["abc", "abc-r", "def", "def-r"]
    let sortValue = "def"

    const confirmOrderList = ()=>{
        console.log("confirm")
        setPop(undefined)
    }

    const Top = ()=>{
        return <header>
            <SearchBar
                searchButton={setSearch}
                placeholder='Buscar...'
                defaultValue={search}
                onChange
                focus
            />
            <button onClick={()=>{
                setPop("order")
              }}>
              <FontAwesomeIcon icon={sortIcons[sortValue]}/>
            </button>
        </header>
    }

    const constructor: {[key:string]: TablePlaceType[]} = {
      open: [],
      unnactive: [],
      closed: [],
    }

    for(let i=0; i<tablePlaces.length; i++){
      let key = "unnactive"
      if(historial[tablePlaces[i]._id]) key = historial[tablePlaces[i]._id]?.historial[historial[tablePlaces[i]._id].historial.length-1].state
      constructor[key].push(tablePlaces[i])
    }

    const TableList = ()=>{
      return <section>
        {Object.keys(constructor).map(key=>{
          return <div
            key={Math.random()}
          >
            <label>{stateTraductions[key]}</label>
            <ul>
              {constructor[key].map(el=>{
                return <button
                  key={Math.random()}
                  onClick={()=>{setCurrent(el._id, key === "unnactive")}}
                  style={{backgroundColor: colorSelector[key]}}
                >
                  {el.name}
                </button>
              })}
            </ul>
          </div>
        })}
      </section>
    }

  return <section>
    {pop && <OrderListPop 
        options={orderOptions} 
        actual={"def"} 
        confirm={confirmOrderList} 
        close={()=>{setPop(undefined)}}
    />}
    <Top/>
    <TableList/>
  </section>
}