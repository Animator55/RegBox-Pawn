import React from 'react'
import { Item, router } from '../vite-env'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faAsterisk, faCaretUp, faMinus, faPlus, faSortAlphaDownAlt, faSortAlphaUpAlt, faSortAmountAsc, faSortAmountDesc } from '@fortawesome/free-solid-svg-icons'
import { productsType } from '../defaults/products'
import SearchBar from './def/Search'
import OrderListPop from './pops/OrderListPop'
import ConfirmPop from './def/ConfirmPop'
import checkSearch from '../logic/checkSearch'
import { Configuration } from '../App'
import { sortBy } from '../logic/sortListBy'

type Props = {
    result: Item[][]
    cancelPicker: Function
    confirmPicker: Function
    setPicker: Function
    prods: productsType
    selectedTable: string | undefined
}


export default function Picker({ cancelPicker, confirmPicker, prods, selectedTable, result, setPicker }: Props) {
    const [phase, setPhase] = React.useState<number>(0)
    const [search, setSearch] = React.useState<string>("")
    const UlRef = React.useRef<HTMLUListElement | null>(null);
    const c = React.useContext(Configuration)

    const [page, setPage] = React.useState<string>("")
    const [pop, setPop] = React.useState<"order" | "close" | "confirm" | "command" | undefined>(undefined)

    const [selectedItem, setSelectedItem] = React.useState<Item | undefined>(undefined)

    const amountsByType: router = {}
    const amounts: router = {}
    if (result[phase]) for (let i = 0; i < result[phase].length; i++) {
        let item = result[phase][i]
        amounts[item._id] = { amount: item.amount, comment: item.comment }
        amountsByType[item.type] = amountsByType[item.type] !== undefined ? (amountsByType[item.type] + (1 * item.amount!)) : (1 * item.amount!)
    }

    const addPhase = () => {
        setPicker([...result, []])
        setPhase(result.length)
    }

    const movePhase = ( index: number, toIndex: number) => {
        if(index === undefined || toIndex === undefined) return 
        let value: Item[] | undefined = undefined
        let newResult = result.map((el, i) => {
            if (i === index) {
                value = el
                return "PH"
            }
            else return el
        })
        if (value === undefined) return
        newResult.splice(toIndex + 1, 0, value)
        let preFilter = newResult
        let settedValue = []
        for (let i = 0; i < preFilter.length; i++) {
            if (typeof preFilter[i] !== "string") settedValue.push(preFilter[i])
        }
        setPicker(settedValue as Item[][])
    }

    const editPhase = (item: Item) => {
        let local = result[phase]
        setSelectedItem(item)
        setPicker(Object.values({
            ...result, [phase]: local.map(el => {
                if (el._id === item._id) return item
                else return el
            })
        }) as Item[][])
    }

    const addItemToPhase = (item: Item) => {
        let local = result[phase]
        setSelectedItem(item)
        setPicker(Object.values({
            ...result, [phase]: [...local, item]
        }) as Item[][])
    }
    const removeItemToPhase = (item: Item) => {
        let local = result[phase]
        setSelectedItem(undefined)
        setPicker(Object.values({
            ...result, [phase]: local.filter(el => {
                if (el._id !== item._id) return el
            })
        }) as Item[][])
    }

    const ShowCommand = () => {
        return <section className='back-blur' onClick={(e) => {
            let target = e.target as HTMLDivElement
            if (target.className === "back-blur") setPop(undefined)
        }}>
            <section className='pop command-pop'>
                <div>Comanda</div>
                <hr />
                {result.length !== 0 && result.map((pha, i) => {
                    return <section key={Math.random()}>
                        <label>Tiempo {i + 1}</label>
                        <ul>
                            {pha.length !== 0 && pha.map(item => {
                                return <li key={Math.random()}>
                                    {item.amount} X {item.name} {(item.comment && item.comment !== "") && ` (${item.comment})`}
                                </li>
                            })}
                        </ul>
                    </section>
                })}
            </section>
        </section>
    }

    const Header = () => {
        return <header className='main-header picker'>
            <button className='default-button' onClick={() => { setPop("close") }}>Cancelar</button>
            <p>{selectedTable && ("Mesa " + selectedTable)}</p>
            <button className={(result.length !== 1 || result[0].length !== 0) ? 'default-button' : "default-button disabled"} onClick={() => { if (result.length !== 1 || result[0].length !== 0) setPop("confirm") }}>Confirmar</button>
        </header>
    }
    let pressTimer: null | number = null;
    let draggingPhase: boolean = false

    const DragPhase = (e: React.TouchEvent) => {
        pressTimer = setTimeout(() => {
            draggingPhase = true
            let target = e.target as HTMLButtonElement
            if (!target) return
            target.classList.add("float")
            let origin_x = e.touches[0].pageX
            target.style.left = 0 + "px"
            let theOtherI = -1
            let width = target.clientWidth *2
            const move = (e2: TouchEvent) => {
                let changeX = e2.touches[0].pageX - origin_x
                if(changeX < width/3 || changeX > (width/3)*-1) theOtherI = -1
                let index = parseInt(target.id.split("_")[1])
                if(
                    (index === 0 && changeX<0) ||
                    (index === result.length-1 && changeX>0)
                ) return 
                let theOtherIndex = changeX < 0 ? (index -1) : (index+1)
                let theOtherOne = document.getElementById('phase_'+theOtherIndex)
                if(!theOtherOne) return
                changeX = Math.abs(changeX) > (width/2) ? changeX>0?(width/2):((width/2)*-1) : changeX
                target.style.left =changeX + "px"
                theOtherOne.style.left = -changeX + "px"
                if(changeX > (width/3) || changeX < (width/3)*-1) theOtherI = theOtherIndex
                console.log(theOtherI)
            }
            const drop = ()=>{
                let float = document.querySelector(".float") as HTMLButtonElement
                if(!float) return
                let other = document.getElementById("phase_"+theOtherI) as HTMLButtonElement
                float.classList.remove("float")
                float.style.left= ""
                if(!other) return
                other.style.left =""
                if(theOtherI !== -1)movePhase(parseInt(float.id.split("_")[1]), theOtherI) /// issue, result in old state ///IMPORTANT

                document.removeEventListener("touchmove", move)
                document.removeEventListener("touchend", drop)
                document.removeEventListener("touchcancel", drop)
            }
            
            document.addEventListener("touchmove", move)
            document.addEventListener("touchend", drop)
            document.addEventListener("touchcancel", drop)

        }, 200)
    };
    const DragPhaseCancel = () => {
        if (pressTimer !== null) {
            clearTimeout(pressTimer); // Cancela el temporizador si se suelta antes de tiempo
            pressTimer = null;
            draggingPhase = false
        }
    };
    const TypeSelector = () => {
        let phases = []
        for (let i = 0; i < result.length; i++) {
            let phaseLength = 0
            for (let j = 0; j < result[i].length; j++) {
                phaseLength += result[i][j].amount!
            }
            phases.push(<React.Fragment key={Math.random()}>    
                {/* <div className='phase-placeholder' id={'ph_'+i}>{i}</div> */}
                <button
                id={'phase_'+i}
                onTouchStart={(e) => {
                    DragPhase(e)
                }}
                onTouchEnd={() => {
                    if (!draggingPhase) setPhase(i)
                    DragPhaseCancel()
                }}
                className={phase === i ? "active" : ""}
            >
                {i + 1}
                {phaseLength !== 0 && <p>{phaseLength}</p>}
            </button>
            </React.Fragment>
            )
        }
        phases.push(<button
            key={Math.random()}
            onClick={() => { addPhase() }}
        >
            <FontAwesomeIcon icon={faPlus} />
        </button>)

        return <section id="picker-page" className='page type-selector'>
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
                        {(amountsByType[type] !== undefined && amountsByType[type] !== 0) && <p>{amountsByType[type]}</p>}
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
    let sortValue = c.config.prodListOrder

    const confirmOrderList = (value: "abc" | "abc-r" | "def" | "def-r") => {
        c.setConfig({ ...c.config, prodListOrder: value })
        setPop(undefined)
    }
    let scrollHeight = UlRef.current?.scrollTop;
    React.useLayoutEffect(() => {
        if (UlRef.current && scrollHeight) UlRef.current.scrollTop = scrollHeight
    });

    const ItemSelector = () => {
        if (page === "") return

        const Inspector = () => {
            return <div className='inspector'>
                {selectedItem ? <>
                    <p>{selectedItem.name}</p>
                    <p className='item-price'>${selectedItem.price}</p>
                    <textarea
                        defaultValue={selectedItem.comment}
                        onBlur={(e) => { editPhase({ ...selectedItem, comment: e.currentTarget.value }) }}
                        onKeyDown={(e) => {
                            if (e.key !== "Enter") return
                            e.preventDefault()
                            editPhase({ ...selectedItem, comment: e.currentTarget.value })
                        }}
                        placeholder='Añadir comentario...'></textarea>
                    <div className='presets'>{selectedItem.presets && selectedItem.presets.map(tag => {
                        return <button
                            key={Math.random()}
                            onClick={() => {
                                let val = selectedItem.comment && selectedItem.comment !== "" ? selectedItem.comment + ", " + tag : tag
                                editPhase({ ...selectedItem, comment: val })
                            }}
                        >
                            {tag}
                        </button>
                    })}</div>
                    <div className='amount-zone'>
                        <p>{selectedItem.amount}</p>
                        <div className='buttons'>
                            <button key={Math.random()}
                                onClick={() => {
                                    if (selectedItem.amount === 0) addItemToPhase({ ...selectedItem, amount: selectedItem.amount! + 1 })
                                    else editPhase({ ...selectedItem, amount: selectedItem.amount! + 1 })
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                            <button key={Math.random()}
                                onClick={() => {
                                    if (selectedItem.amount && selectedItem.amount > 1) editPhase({ ...selectedItem, amount: selectedItem.amount! - 1 })
                                    else removeItemToPhase({ ...selectedItem, amount: selectedItem.amount! - 1 })
                                }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                        </div>
                    </div>
                </> : <p>Selecciona un producto.</p>}
            </div>
        }

        let sortedList: Item[] = sortBy[sortValue](prods[page])

        return <section id="picker-page" className='page item-selector'>
            <div className='item-selector-cont'>

                <header className='table-list-header'>
                    <SearchBar
                        searchButton={setSearch}
                        defaultValue={search}
                        placeholder='Buscar...'
                        onChange
                        focus={search !== ""}
                    />
                    <button className='default-button' onClick={() => {
                        setPop("order")
                    }}>
                        <FontAwesomeIcon icon={sortIcons[sortValue]} />
                    </button>
                </header>
                <ul
                    ref={UlRef}>
                    {sortedList.map(item => {
                        let check = checkSearch(item.name, search)
                        let isSel = amounts[item._id] !== undefined ? amounts[item._id] : { amount: 0, comment: undefined }
                        return (search === "" || check !== item.name) && <button
                            key={Math.random()}
                            className={selectedItem?._id === item._id ? "active" : ""}
                            onClick={() => {
                                setSelectedItem({ ...item, amount: isSel.amount, comment: isSel.comment })
                                if (isSel?.amount === 0) addItemToPhase({ ...item, amount: isSel.amount + 1, comment: isSel.comment })
                                if (selectedItem?._id === item._id
                                    && selectedItem.amount !== undefined) editPhase({ ...selectedItem, amount: selectedItem.amount + 1, comment: selectedItem.comment })
                            }}
                        >
                            {isSel.amount !== 0 && <p className='amount-count'>{isSel.amount}</p>}
                            <p
                                dangerouslySetInnerHTML={{ __html: check }}
                            ></p>
                            {isSel.comment && <div><FontAwesomeIcon icon={faAsterisk} /></div>}
                        </button>
                    })}
                </ul>
            </div>
            <Inspector />
        </section>
    }

    const pages: router = {
        "types": <TypeSelector />,
        "items": <ItemSelector />,
    }

    const pops = {
        "close": <ConfirmPop
            title='¿Cancelar comanda?'
            close={() => { setPop(undefined) }}
            confirm={() => { cancelPicker() }}
        />,
        "confirm": <ConfirmPop
            time
            title={'¿' + (selectedTable ? "Enviar" : "Confirmar") + ' comanda?'}
            subTitle={
                selectedTable ? ('Se enviarán los datos de la comanda a la mesa ' + selectedTable + '.') :
                    'Se pasará a seleccionar una mesa.'}
            close={() => { setPop(undefined) }}
            confirm={() => { confirmPicker() }}
        />,
        "order": <OrderListPop
            options={orderOptions}
            actual={sortValue}
            confirm={confirmOrderList}
            close={() => { setPop(undefined) }}
        />,
        "command": <ShowCommand />
    }

    React.useEffect(() => {
        history.pushState(null, "", location.href);

        const handlePopState = (event: PopStateEvent) => {
            event.preventDefault();
            setPop("close")
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    })

    return <>
        {pop && pops[pop]}
        <Header />
        {pages[page !== "" ? "items" : "types"]}
        <nav className='picker-nav'>
            <button className="return-to-type-selector " style={{ opacity: page !== "" ? 1 : 0 }} onClick={() => {
                setPage("")
                setSelectedItem(undefined)
            }}>
                <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button className='view-command-button' onClick={() => { setPop("command") }}>
                <FontAwesomeIcon icon={faCaretUp} /> Ver comanda
            </button>
        </nav>
    </>
}