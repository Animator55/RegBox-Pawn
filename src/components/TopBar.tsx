import React from 'react'
import ProdPop from './pops/ProdPop'
import AccountPop from './pops/AccountPop'

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
    ></button>
    <button
        onClick={()=>{setPop("account")}}
    ></button>
  </header>
}