import React from 'react'
import { Item, router } from '../vite-env'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { productsType } from '../defaults/products'

type Props = {
    setPageMain: Function
    prods:productsType
}

export default function Picker({setPageMain, prods}: Props) {
    const [result, setResult] = React.useState<Item[][]>([[]])
    const [phase, setPhase] = React.useState<number>(0)

    const [page, setPage] = React.useState<string>("")

    const addPhase = ()=>{
        setResult([...result, []])
        setPhase(result.length)
    }

    const ShowCommand = ()=>{
        return <section>
            <div>Comanda</div>
            <hr/>
            {result.length !== 0 && result.map((pha, i)=>{
                return <section key={Math.random()}>
                    <label>Tiempo {i+1}</label>
                    <ul>
                        {pha.length !== 0 && pha.map(item=>{
                            return <li key={Math.random()}>
                                {item.name}
                            </li>
                        })}
                    </ul>
                </section>
            })}
        </section>
    }

    const Header = ()=>{
        return <header>
            <button onClick={()=>{setPageMain("main")}}>Cancel</button>
            <button>Confirm</button>
        </header>
    }

    const TypeSelector = ()=>{
        let phases = []
        for(let i=0; i<result.length; i++){
            phases.push(<button
                key={Math.random()}
                onClick={()=>{setPhase(i)}}
            >
                {i+1}
            </button>)
        }
        phases.push(<button
            key={Math.random()}
            onClick={()=>{addPhase()}}
        >
            <FontAwesomeIcon icon={faPlus}/>
        </button>)

        return <section>
            <header>
                {phases}
            </header>
            {Object.keys(prods).map(type=>{
                return <button
                    key={Math.random()}
                    onClick={()=>{setPage(type)}}
                >
                    {type}
                </button>
            })}
        </section>
    }

    const ItemSelector = ()=>{
        return <section></section>
    }

    const pages: router = {
        "types": <TypeSelector/>,
        "items": <ItemSelector/>,
    }

    return <section>
        <Header/>
        {pages[page !== "" ? "items" : "types"]}
        <button onClick={()=>{console.log("a")}}>Ver comanda</button>
    </section>
}