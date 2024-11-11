import React from 'react'
import TopBar from './components/TopBar'
import TableList from './components/TableList'
import NavBar from './components/NavBar'
import Map from './components/Map'
import TableView from './components/TableView'
import { configType, HistorialTableType, histStructure, router, SingleEvent, TableEvents, TablePlaceType } from './vite-env'
import { historialDef } from './defaults/historialDef'
import { tablePlaces } from './defaults/tablePlaces'
import getTableData from './logic/getTableData'
import fixNum from './logic/fixDateNumber'
import { back_addTable } from './logic/API'
import ConfirmPop from './components/def/ConfirmPop'
import { defaultConfig } from './defaults/config'

import "./assets/App.css"
import Picker from './components/Picker'
import { products1, productsType } from './defaults/products'

type Props = {}

export const Configuration = React.createContext({
  config: {
    animations: true,
    prodsAsList: true,
    prodsInEditorAsList: true,
    map: {
      zoom: 1,
      x: 0,
      y: 0,
    },
    miniMapOrder: "def",
    prodListOrder: "def",
    prodEditorOrder: "def",
  } as configType, setConfig: (val: configType) => { console.log(val) }
})

let defaultHistorialParsed = {}
for (const id in historialDef) {
  let parsed = JSON.parse(historialDef[id]) as HistorialTableType
  defaultHistorialParsed = { ...defaultHistorialParsed, [id]: parsed}
}

export default function App({ }: Props) {
  const [config, setConfig] = React.useState(defaultConfig)
  const [page, setPage] = React.useState<"main" | "picker">("main")
  const [displayMode, setDisplay] = React.useState<"list" | "map" | "view">("list")
  const [localHistorial, setLocalHistorial] = React.useState<histStructure>(defaultHistorialParsed)
  // const [localTablePlaces, setTablePlaces] = React.useState<TablePlaceType[]>(tablePlaces)
  // const [prods, setProds] = React.useState<productsType>(products)
  const localTablePlaces: TablePlaceType[] = tablePlaces
  const prods: productsType = products1
  
  const [pop, setPop] = React.useState<{ name: string, data: any, function: Function } | undefined>(undefined)

  const [currentTable, setCurrentState] = React.useState<string | undefined>(undefined)

  const setCurrent = (id: string, creating: boolean) => {
    if (!creating) {setCurrentState(id); setDisplay("view")}
    else {
      setPop({
        name: "openTable",
        data: id,
        function: () => {
          let result = createTable(id)
          if (result) {
            setCurrentState(id)
            setDisplay("view")
          }
        }
      })
    }
  }

  const getLastTable = (): TableEvents | undefined => {
    if (!currentTable || localHistorial[currentTable].historial.length === 0) return
    return {
      ...localHistorial[currentTable].historial[localHistorial[currentTable].historial.length - 1], 
      _id: currentTable,
      name: localHistorial[currentTable].name
    }
  }

  const getTableName = (id: string)=>{
    let result = ""
    for(let i=0;i<localTablePlaces.length; i++){
      if(localTablePlaces[i]._id === id) {
        result = localTablePlaces[i].name
        break
      }
    }
    return result
  }

  const createTable = (id: string) => {
    let date = new Date()
    let data = getTableData(id, localTablePlaces)
    if (!data) return false
    let hour = fixNum(date.getHours()) + ":" + fixNum(date.getMinutes())
    let day = fixNum(date.getDate()) + "/" + fixNum(date.getMonth() + 1) + "/" + date.getFullYear()

    let opened = [`${hour}`, ` ${day}`]
    let initialEvents: SingleEvent[] = [{
      important: true,
      type: "state",
      comment: ("Se crea la mesa " + data.name),
      timestamp: opened[0] + ":" + fixNum(date.getSeconds()),
      owner: "main"
    }]
    let newTable: TableEvents = {
      _id: data._id,
      name: data.name,
      discount: 0,
      discountType: "percent",
      products: [],
      opened: opened,
      payMethod: undefined,
      state: "open",
      total: "$0",
      events: initialEvents
    }
    let result = back_addTable(newTable)
    if (result) setLocalHistorial({
      ...localHistorial, [id]: {
        _id: newTable._id, name: newTable.name, historial: [
          newTable
        ]
      } as HistorialTableType
    })
    return true
  }


  let tablesOpenMin = []
  for (const id in localHistorial) {
    if (localHistorial[id].historial.length === 0) continue
    let last = localHistorial[id].historial[localHistorial[id].historial.length - 1]
    if (localHistorial[id]._id && localHistorial[id].name) tablesOpenMin.push(
      { _id: localHistorial[id]._id, name: localHistorial[id].name, state: last.state }
    )
  }

  const displays: { [key: string]: any } = {
    "list": <TableList
      setCurrent={setCurrent}
      historial={localHistorial}
      setPage={setPage}
      tablePlaces={localTablePlaces}
    />,
    "map": <Map
    setPage={setPage}
      setCurrent={setCurrent}
      tablesOpenMin={tablesOpenMin}
      tablePlaces={localTablePlaces}
    />,
    "view": currentTable && <TableView setPage={setPage} current={getLastTable()} setDisplay={setDisplay} />,
    // "historial": <TableHistorial current_id={currentTable._id}/>,
  }

  const pages: { [key: string]: any } = {
    "main": <>
      <TopBar />
      {displays[displayMode]}
      <NavBar currentNav={displayMode} setNav={setDisplay} />
    </>,
    "picker": <Picker prods={prods} setPageMain={setPage}/>
  }


  const pops: router = {
    "openTable": <ConfirmPop
      title={"Realizar apertura de mesa "+getTableName(pop?.data)+"?"}
      subTitle={"Se guardará en el historial."}
      confirm={() => {
        if (pop?.function) pop.function()
        setPop(undefined)
      }} close={() => { setPop(undefined) }} />
  }

  return <main>
    <Configuration.Provider value={{ config: config, setConfig: setConfig }}>
      {pop && pop.name && pops[pop.name]}
      {pages[page]}
    </Configuration.Provider>
  </main>
}