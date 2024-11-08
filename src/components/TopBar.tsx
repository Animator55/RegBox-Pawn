import React from 'react'
import ProdPop from './pops/ProdPop'
import AccountPop from './pops/AccountPop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleDollarToSlot, faDollarSign, faUserCircle } from '@fortawesome/free-solid-svg-icons'

type Props = {}

export default function TopBar({}: Props) {
    const [pop, setPop] = React.useState<"products" | "account" |undefined>(undefined)

    const closePop = ()=>{
        setPop(undefined)
    }

    const pops: {[key:string]: any}={
        "products" : <ProdPop close={closePop}/>,
        "account" : <AccountPop close={closePop}/>,
    }
  return <header className='main-header'>
    {pop && pops[pop]}
    <button
        onClick={()=>{setPop("products")}}
    >
        <FontAwesomeIcon icon={faCircleDollarToSlot}/>
    </button>
    <button
        onClick={()=>{setPop("account")}}
    >
        <FontAwesomeIcon icon={faUserCircle}/>
    </button>
  </header>
}