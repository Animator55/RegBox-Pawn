import React from 'react'
import ProdPop from './pops/ProdPop'
import AccountPop from './pops/AccountPop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {   faRotate, faUserCircle, faWarning, faXmark } from '@fortawesome/free-solid-svg-icons'
import { sessionType } from '../vite-env'
import { productsType } from '../defaults/products'
import RequestsPop from './pops/RequestsPop'

type Props = { loading: string | undefined
    setLoading:Function
    currentTable: string | undefined
    pickerOn: boolean , session: sessionType |undefined, 
    RequestHistorial:Function
    RequestTables:Function
    RequestProds:Function
    RequestNotificationState:Function
    setPicker:Function
    prods: productsType
}

export default function TopBar({ 
    loading, setLoading,
    pickerOn, setPicker, 
    prods, currentTable,
    session, 
    RequestHistorial, RequestTables, RequestProds,RequestNotificationState
}: Props) {
    const [pop, setPop] = React.useState<"products" | "account" | "requests" | undefined>(undefined)

    const closePop = () => {
        setPop(undefined)
    }

    const pops: { [key: string]: any } = {
        "products": <ProdPop setLoading={setLoading} loading={loading} prods={prods} close={closePop} RequestProds={RequestProds} />,
        "account": <AccountPop close={closePop} RequestTables={RequestTables} openPop={(val:"products" | "requests")=>{setPop(val)}}  />,
        "requests": <RequestsPop RequestNotificationState={RequestNotificationState} setPicker={setPicker} close={closePop}  />,
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
                    if(!hist && loading === undefined) RequestHistorial()
                    else setLoading(undefined)
                }}>
                    <FontAwesomeIcon icon={!hist && loading !== undefined ? faXmark: faRotate} spin={hist}/>
                    <p>{hist ? "Actualizando": loading === undefined ? "Actualizar" : "Cancelar"}</p>
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