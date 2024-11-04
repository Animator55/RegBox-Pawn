import React from 'react'
import SearchBar from './def/Search'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortAlphaDownAlt, faSortAlphaUpAlt, faSortAmountAsc, faSortAmountDesc } from '@fortawesome/free-solid-svg-icons'
import OrderListPop from './pops/OrderListPop'

type Props = {}

export default function TableList({}: Props) {
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
  return <section>
    {pop && <OrderListPop 
        options={orderOptions} 
        actual={"def"} 
        confirm={confirmOrderList} 
        close={()=>{setPop(undefined)}}
    />}
    <Top/>
  </section>
}