import React from 'react'
import { Item, router } from '../vite-env'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretLeft, faCaretUp, faPlus, faSortAlphaDownAlt, faSortAlphaUpAlt, faSortAmountAsc, faSortAmountDesc } from '@fortawesome/free-solid-svg-icons'
import { productsType } from '../defaults/products'
import SearchBar from './def/Search'
import OrderListPop from './pops/OrderListPop'

type Props = {
    setPageMain: Function
    prods: productsType
}

export default function Picker({ setPageMain, prods }: Props) {
    const [result, setResult] = React.useState<Item[][]>([[]])
    const [phase, setPhase] = React.useState<number>(0)
    const [search, setSearch] = React.useState<string>("")

    const [page, setPage] = React.useState<string>("")
    const [pop, setPop] = React.useState<"order" | undefined>(undefined)

    const [selectedItem, setSelectedItem] = React.useState<string | undefined>(undefined)

    const addPhase = () => {
        setResult([...result, []])
        setPhase(result.length)
    }

    const ShowCommand = () => {
        return <section>
            <div>Comanda</div>
            <hr />
            {result.length !== 0 && result.map((pha, i) => {
                return <section key={Math.random()}>
                    <label>Tiempo {i + 1}</label>
                    <ul>
                        {pha.length !== 0 && pha.map(item => {
                            return <li key={Math.random()}>
                                {item.name}
                            </li>
                        })}
                    </ul>
                </section>
            })}
        </section>
    }

    const Header = () => {
        return <header className='main-header picker'>
            <button className='default-button' onClick={() => { setPageMain("main") }}>Cancel</button>
            <button className='default-button'>Confirm</button>
        </header>
    }

    const TypeSelector = () => {
        let phases = []
        for (let i = 0; i < result.length; i++) {
            phases.push(<button
                key={Math.random()}
                onClick={() => { setPhase(i) }}
                className={phase === i ? "active" : ""}
            >
                {i + 1}
            </button>)
        }
        phases.push(<button
            key={Math.random()}
            onClick={() => { addPhase() }}
        >
            <FontAwesomeIcon icon={faPlus} />
        </button>)

        return <section className='page type-selector'>
            <header>
                {phases}
            </header>
            <ul>
                {Object.keys(prods).map(type => {
                    return <button
                        key={Math.random()}
                        onClick={() => { setPage(type) }}
                    >
                        {type}
                    </button>
                })}
            </ul>
        </section>
    }

    const sortIcons: { [key: string]: any } = {
        "abc-r": faSortAlphaDownAlt,
        "def": faSortAmountDesc,
        "abc": faSortAlphaUpAlt,
        "def-r": faSortAmountAsc,
    }

    const orderOptions = ["abc", "abc-r", "def", "def-r"]
    let sortValue = "def"

    const confirmOrderList = () => {
        console.log("confirm")
        setPop(undefined)
    }

    const ItemSelector = () => {
        if (page === "") return
        return <section className='page'>
            <div className='item-selector'>

                <header className='table-list-header'>
                    <SearchBar
                        searchButton={setSearch}
                        defaultValue={search}
                        placeholder='Buscar...'
                        onChange
                    />
                    <button className='default-button' onClick={() => {
                        setPop("order")
                    }}>
                        <FontAwesomeIcon icon={sortIcons[sortValue]} />
                    </button>
                </header>
                <ul>
                    {prods[page].map(item => {
                        return <button
                            key={Math.random()}
                            className={selectedItem === item._id ? "active" : ""}
                            onClick={() => { setSelectedItem(item.id) }}
                        >
                            {item.name}
                        </button>
                    })}
                </ul>
            </div>
            <div className='inspector'>
                    
            </div>

            <button className='return-to-type-selector' onClick={() => { setPage("") }}>
                <FontAwesomeIcon icon={faCaretLeft} />
                Volver
            </button>
        </section>
    }

    const pages: router = {
        "types": <TypeSelector />,
        "items": <ItemSelector />,
    }

    return <>
        {pop && <OrderListPop
            options={orderOptions}
            actual={"def"}
            confirm={confirmOrderList}
            close={() => { setPop(undefined) }}
        />}
        <Header />
        {pages[page !== "" ? "items" : "types"]}
        <button className='view-command-button' onClick={() => { console.log("a") }}>
            <FontAwesomeIcon icon={faCaretUp} /> Ver comanda</button>
    </>
}