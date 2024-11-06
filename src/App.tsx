import React from 'react'
import TopBar from './components/TopBar'
import TableList from './components/TableList'
import NavBar from './components/NavBar'
import Map from './components/Map'
import TableView from './components/TableView'
import { HistorialTableType, histStructure, router, SingleEvent, TableEvents, TablePlaceType } from './vite-env'
import { historialDef } from './defaults/historialDef'
import { tablePlaces } from './defaults/tablePlaces'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import getTableData from './logic/getTableData'
import fixNum from './logic/fixDateNumber'
import { back_addTable } from './logic/API'
import ConfirmPop from './components/def/ConfirmPop'

type Props = {}


let defaultHistorialParsed = {}
for(const id in historialDef) {
  defaultHistorialParsed = {...defaultHistorialParsed, [id]: JSON.parse(historialDef[id])}
}

export default function App({}: Props) {
  const [page, setPage] = React.useState<"main" | "picker">("main")
  const [displayMode, setDisplay] = React.useState<"list" | "map" | "view">("list")
  const [localHistorial, setLocalHistorial] = React.useState<histStructure>(defaultHistorialParsed)
  const [localTablePlaces, setTablePlaces] = React.useState<TablePlaceType[]>(tablePlaces)

  const [pop, setPop] = React.useState<{name: string, function: Function} | undefined>(undefined)

  const [currentTable, setCurrentState] = React.useState<string | undefined>(undefined)

  const setCurrent = (id: string, creating: boolean)=>{
    if(!creating) setCurrentState(id)
    else {
      setPop({
        name: "openTable",
        function: ()=>{
          let result = createTable(id) 
          if(result) setCurrentState(id)
        }
      })
    }
  }

  const getLastTable = (): TableEvents | undefined=>{
    if(!currentTable || localHistorial[currentTable].historial.length === 0) return
    return localHistorial[currentTable].historial[localHistorial[currentTable].historial.length-1]
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
        total:"$0",
        events: initialEvents
    }
    let result = back_addTable(newTable)
    if(result) setLocalHistorial({...localHistorial, [id] : {
      _id: newTable._id, name: newTable.name, historial: [
        newTable
      ] 
    } as HistorialTableType})
    return true
}

  const displays: {[key:string]: any} = {
    "list":<TableList 
      setCurrent={setCurrent} 
      historial={localHistorial}
      tablePlaces={localTablePlaces} 
    />, 
    "map": <Map setCurrent={setCurrent}/>,
    "view": currentTable && <TableView current={getLastTable()} setDisplay={setDisplay}/>,
    // "historial": <TableHistorial current_id={currentTable._id}/>,
  } 

  const pages: {[key:string]: any} = {
    "main": <>
      <TopBar/>
      {displays[displayMode]}
      <button onClick={()=>{setPage("picker")}}>
        <FontAwesomeIcon icon={faPlus}/>
      </button>
      <NavBar setNav={setDisplay}/>
    </>,
    "picker": <>a</>
  }

  React.useEffect(()=>{
    if(currentTable === undefined)return 
    setDisplay("view")
  }, [currentTable])

  const pops: router = {
    "openTable" : <ConfirmPop 
      title={"Realizar apertura de mesa?"}
      subTitle={"Se guardará en el historial."}
     confirm={()=>{
      if(pop?.function) pop.function()
      setPop(undefined)
    }} close={()=>{setPop(undefined)}}/>
  }

  return <main>
    {pop && pop.name && pops[pop.name]}
    {pages[page]}
  </main>
}