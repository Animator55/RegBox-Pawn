import React from 'react'
import ProdPop from './pops/ProdPop'
import AccountPop from './pops/AccountPop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faCircleDollarToSlot, faRotate, faUserCircle, faWarning } from '@fortawesome/free-solid-svg-icons'
import { sessionType } from '../vite-env'

type Props = { pickerOn: boolean , session: sessionType |undefined, RequestHistorial:Function}

export default function TopBar({ pickerOn,session, RequestHistorial }: Props) {
    const [pop, setPop] = React.useState<"products" | "account" | undefined>(undefined)

    const closePop = () => {
        setPop(undefined)
    }

    const pops: { [key: string]: any } = {
        "products": <ProdPop close={closePop} />,
        "account": <AccountPop close={closePop} />,
    }
    return <header className='main-header'>
        {pickerOn ?
            <>
                <div className='select-warning'>
                    <FontAwesomeIcon icon={faWarning}/>
                    <p>Selecciona una mesa</p>
                </div>
            </>
            :
            <>
                {pop && pops[pop]}
                <button
                    onClick={() => { setPop("products") }}
                >
                    <FontAwesomeIcon icon={faCircleDollarToSlot} />
                </button>
                <button className='refresh' onClick={()=>{RequestHistorial()}}>
                    <FontAwesomeIcon icon={faRotate}/>
                </button>
                <button
                    className='account'
                    onClick={() => { setPop("account") }}
                >
                    <FontAwesomeIcon icon={faUserCircle} />
                    <p>{session?.name}</p>
                </button>
            </>
        }
    </header>
}