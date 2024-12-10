import React from 'react'
import ProdPop from './pops/ProdPop'
import AccountPop from './pops/AccountPop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faCircleDollarToSlot, faRotate, faUserCircle, faWarning } from '@fortawesome/free-solid-svg-icons'
import { sessionType } from '../vite-env'

type Props = { loading: string | undefined
    setLoading:Function
    currentTable: string | undefined
    pickerOn: boolean , session: sessionType |undefined, RequestHistorial:Function}

export default function TopBar({ loading, setLoading,pickerOn, currentTable,session, RequestHistorial }: Props) {
    const [pop, setPop] = React.useState<"products" | "account" | undefined>(undefined)

    const closePop = () => {
        setPop(undefined)
    }

    const pops: { [key: string]: any } = {
        "products": <ProdPop close={closePop} />,
        "account": <AccountPop close={closePop} />,
    }
    let hist =loading === "request-historial"
    return <header className='main-header'>
        {pickerOn ? currentTable ?
            <>
                <div className='select-warning'>
                    <FontAwesomeIcon icon={faWarning}/>
                    <p>Editando mesa</p>
                </div>
            </>
         :
            <>
                <div className='select-warning'>
                    <FontAwesomeIcon icon={faWarning}/>
                    <p>Selecciona una mesa</p>
                </div>
            </>
            :
            <>
                {pop && pops[pop]}
                <button className='refresh' onClick={()=>{
                    if(!hist) RequestHistorial()
                    else setLoading(undefined)
                }}>
                    <FontAwesomeIcon icon={faRotate} spin={hist}/>
                    <p>{hist ? "Actualizando":"Actualizar"}</p>
                </button>
                <button
                    onClick={() => { setPop("products") }}
                >
                    <FontAwesomeIcon icon={faCircleDollarToSlot} />
                </button>
                <button
                    className='account'
                    onClick={() => { setPop("account") }}
                >
                    <p>{session?.name}</p>
                    <FontAwesomeIcon icon={faUserCircle} />
                </button>
            </>
        }
    </header>
}