import React from 'react'
import ProdPop from './pops/ProdPop'
import AccountPop from './pops/AccountPop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign, faUserCircle } from '@fortawesome/free-solid-svg-icons'

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
  return <header>
    {pop && pops[pop]}
    <button
        onClick={()=>{setPop("products")}}
    >
        <FontAwesomeIcon icon={faDollarSign}/>
    </button>
    <button
        onClick={()=>{setPop("account")}}
    >
        <FontAwesomeIcon icon={faUserCircle}/>
    </button>
  </header>
}