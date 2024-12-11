import { faRotate, faRotateBack, faSortAlphaDownAlt, faSortAlphaUpAlt, faSortAmountAsc, faSortAmountDesc, faWarning, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { productsType } from "../../defaults/products"
import { Item, router } from "../../vite-env"
import SearchBar from "../def/Search"
import checkSearch from "../../logic/checkSearch"
import OrderListPop from "./OrderListPop"
import React from "react"
import { Configuration } from "../../App"
import { sortBy } from "../../logic/sortListBy"

type Props = {
  close: Function
  prods: productsType
  RequestProds: Function
  setLoading: Function
  loading: string | undefined
}

export default function ProdPop({ close, setLoading, prods, loading, RequestProds }: Props) {
  const [search, setSearch] = React.useState<string>("")
  const UlRef = React.useRef<HTMLUListElement | null>(null);
  const c = React.useContext(Configuration)

  const [page, setPage] = React.useState<string>("")
  const [pop, setPop] = React.useState<"order" | undefined>(undefined)

  const Alert = () => {
    return <section className='warning black'>
      <FontAwesomeIcon icon={faWarning} />
      <h2>No hay productos que enlistar.</h2>
    </section>
  }
  const Loading = () => {
    return <section className='warning black'>
      <FontAwesomeIcon icon={faRotate} spin />
      <h2>Obteniendo productos...</h2>
    </section>
  }
  const TypeSelector = () => {
    return <section id="picker-page" className='page type-selector'>
      {loading === "request-products" ? <Loading /> :
        prods && Object.keys(prods).length !== 0 ? <ul>
          {Object.keys(prods).map(type => {
            return <button
              key={Math.random()}
              onClick={() => { setPage(type) }}
            >
              {type}
            </button>
          })}
        </ul>
          : <Alert />
      }
    </section>
  }
  const ItemSelector = () => {
    if (page === "" || !prods) return

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
            return (search === "" || check !== item.name) && <button
              key={Math.random()}
              className="prod-pop-item"
            >
              <p
                dangerouslySetInnerHTML={{ __html: check }}
              ></p>
              <p>{item.price}</p>
              {item.presets && <div>
                {item.presets.map(el => {
                  return <div
                    key={Math.random()}
                  >
                    <p>{el}</p>
                  </div>
                })}
              </div>}
            </button>
          })}
        </ul>
      </div>
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

  const pages: router = {
    "types": <TypeSelector />,
    "items": <ItemSelector />,
  }

  const pops = {
    "order": <OrderListPop
      options={orderOptions}
      actual={sortValue}
      confirm={confirmOrderList}
      close={() => { setPop(undefined) }}
    />,
  }

  let hist = loading === "request-products"

  return <section className='back-blur confirm-spefic' onClick={(e) => {
    let target = e.target as HTMLDivElement
    if (target.className === "back-blur confirm-spefic") close()
  }}>
    {pop && pops[pop]}
    <section className='pop products-pop'>
      <header>
        <button onClick={() => {
          if (!hist) RequestProds()
          else setLoading(undefined)
        }}>
          <FontAwesomeIcon icon={faRotate} spin={hist} />
          <p>{hist ? "Actualizando" : "Actualizar"}</p>
        </button>
        <button onClick={() => {
          close()
        }}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </header>

      {pages[page !== "" ? "items" : "types"]}
      <nav className='picker-nav'></nav>
      <button className="return-to-type-selector " style={{ opacity: page !== "" ? 1 : 0 }} onClick={() => {
        setPage("")
      }}>
        <FontAwesomeIcon icon={faRotateBack} />
      </button>
    </section>
  </section>
}