import React from 'react'
import ProdPop from './pops/ProdPop'
import AccountPop from './pops/AccountPop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faCircleDollarToSlot, faUserCircle, faWarning } from '@fortawesome/free-solid-svg-icons'

type Props = { pickerOn: boolean }

export default function TopBar({ pickerOn }: Props) {
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
                <button
                    onClick={() => { setPop("account") }}
                >
                    <FontAwesomeIcon icon={faUserCircle} />
                </button>
            </>
        }
    </header>
}