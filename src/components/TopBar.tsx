import React from 'react'
import ProdPop from './pops/ProdPop'
import AccountPop from './pops/AccountPop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleDollarToSlot, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { Item } from '../vite-env'

type Props = { pickerOn: Item[][] }

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
        {(pickerOn.length === 1 && pickerOn[0].length !== 0)?
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
            :
            <p>Selecciona una mesa</p>
        }
    </header>
}