import React from 'react'
import TopBar from './components/TopBar'
import Map from './components/Map'
import TableView from './components/TableView'
import { configType, HistorialTableType, histStructure, Item, router, sessionType, SingleEvent, TableEvents, TablePlaceType } from './vite-env'
import { historialDef } from './defaults/historialDef'
import { tablePlaces } from './defaults/tablePlaces'
import getTableData from './logic/getTableData'
import fixNum from './logic/fixDateNumber'
import { back_addTable, back_editTable } from './logic/API'
import ConfirmPop from './components/def/ConfirmPop'
import { defaultConfig } from './defaults/config'
import Peer, { DataConnection } from 'peerjs'

import "./assets/App.css"
import Picker from './components/Picker'
import { products1, productsType } from './defaults/products'
import SideBar from './components/SideBar'

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
  defaultHistorialParsed = { ...defaultHistorialParsed, [id]: parsed }
}

let lastCreated: string | undefined = undefined


const userData = { /// localStorage
  _id: "pawn-1",
  core: "main-1"
}
let peer: Peer | undefined = undefined
let conn: DataConnection | undefined = undefined


const generateSession = (id: string, core: string) => {
  return {
    _id: id,
    name: id,
    role: "pawn",
    opened: "0",
    domain: core,
    url: ""
  } as sessionType
}

export default function App({ }: Props) {
  const [session, setSession] = React.useState<sessionType | undefined>(undefined)
  const [config, setConfig] = React.useState(defaultConfig)
  const [page, setPage] = React.useState<"main" | "picker">("main")
  const [displayMode, setDisplayState] = React.useState<"map" | "view">("map")
  const [localHistorial, setLocalHistorial] = React.useState<histStructure | undefined>(undefined)
  // const [localTablePlaces, setTablePlaces] = React.useState<TablePlaceType[]>(tablePlaces)
  // const [prods, setProds] = React.useState<productsType>(products)
  const localTablePlaces: TablePlaceType[] = tablePlaces
  const prods: productsType = products1

  const setDisplay = (val: "map" | "view") => {
    setDisplayState(val)
  }

  const [pop, setPop] = React.useState<{ name: string, data: any, function: Function } | undefined>(undefined)

  const [currentTable, setCurrentState] = React.useState<string | undefined>(undefined)
  const [picker, setPicker] = React.useState<Item[][]>([[]])
  let pickerOn = (picker.length !== 1 || picker[0].length !== 0)

  const setCurrent = (id: string, creating: boolean) => {
    if (!creating) {
      let lastTable = getLastTable(id)
      if (pickerOn) { /// checks if picker as data
        if (lastTable && lastTable.state === "open") setPop({ // checks tableState and activates pop up
          name: "selectTable",
          data: id,
          function: () => {
            let result = back_editTable(id, picker)
            if (result && localHistorial) {
              if (localHistorial[id] && localHistorial[id].historial.length !== 0 && session) {
                let date = new Date
                let message = {
                  important: false,
                  type: "products",
                  comment: "Añadidos productos",
                  timestamp: fixNum(date.getHours()) + ":" + fixNum(date.getMinutes()),
                  notification_id: `${Math.random()*Math.random()}`,
                  _id: id,
                  name:localHistorial[id].name ,
                  accepted: undefined, /// only for notification events
                  products: picker, /// only for notification events
                  owner: session._id,
                  owner_name: session.name, /// only for notification events
                }
                if(conn) conn.send(message)
              }
              setCurrentState(id)
              setDisplay("view")
              setPicker([[]])
            }
          }
        })
      }
      else {
        setCurrentState(id); setDisplay("view")
      }
    }
    else {
      setPop({
        name: "openTable",
        data: id,
        function: () => {
          let result = createTable(id)
          if (result) {
            if (pickerOn) lastCreated = id
            else {
              setCurrentState(id)
              setDisplay("view")
            }
          }
        }
      })
    }
  }

  const getLastTable = (id?: string): TableEvents | undefined => {
    let local_id = id === undefined ? currentTable : id
    if (!local_id || !localHistorial || localHistorial[local_id].historial.length === 0) return
    return {
      ...localHistorial[local_id].historial[localHistorial[local_id].historial.length - 1],
      _id: currentTable,
      name: localHistorial[local_id].name
    }
  }

  const getTableName = (id: string | undefined) => {
    let result = ""
    if (id) for (let i = 0; i < localTablePlaces.length; i++) {
      if (localTablePlaces[i]._id === id) {
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
    "map": <Map
      setPage={setPage}
      setCurrent={setCurrent}
      tablesOpenMin={tablesOpenMin}
      tablePlaces={localTablePlaces}
      pickerOn={pickerOn}
    />,
    "view": currentTable && <TableView
      setPicker={setPicker}
      pickerOn={pickerOn}
      setPage={setPage}
      current={getLastTable()}
      setMap={() => { setDisplay("map") }}
    />,
  }

  React.useEffect(() => {
    if (currentTable !== undefined && displayMode !== "view") setCurrentState(undefined)
  }, [displayMode])


  const connectToCore = (core: string) => { // trys to connect to peers, if chat is undefined, func will loop
    if (conn !== undefined) return

    function closeConn() {
      console.log('you changed the chat')
      conn = undefined
    }

    if (!peer) return
    conn = peer.connect(core)
    conn.on('close', closeConn)
  }

  function connection(id: string): undefined | string { //crea tu session
    peer = new Peer(id);
    if (peer === undefined) return

    peer.on('error', function (err) {
      switch (err.type) {
        case 'unavailable-id':
          console.log(id + ' is taken')
          peer = undefined
          break
        case 'peer-unavailable':
          console.log('user offline')
          break
        default:
          conn = undefined
          console.log('an error happened')
      }
      return false;
    })
    peer.on('open', function (id: string) {
      if (peer === undefined || peer.id === undefined) return
      setSession(generateSession(id, userData.core))
      connectToCore(userData.core)
    })
    if (conn !== undefined) return
    peer.on("connection", function (conn) {
      console.log("connected with "+ conn.peer)
      conn.on("data", function (data:{type: string, data: histStructure} | any) { //RECIEVED DATA
        console.log(data)
        if(data.type === "historial") {
          console.log(data)
          setLocalHistorial(data.data)
        }
      })

      conn.on('close', function () {
        console.log('connection was closed by ' + conn.peer)
        conn.close()
      })
    });
  }

  React.useEffect(() => {
    if (!userData) return
    if (!peer) connection(userData._id)
    if (lastCreated) {
      setCurrent(lastCreated, false)
      lastCreated = undefined
    }
  })

  const RequestHistorial = ()=>{
    if(conn )conn.send({type:"request-historial"})
  }

  const pages: { [key: string]: any } = {
    "main": <>
      <TopBar pickerOn={pickerOn} session={session} RequestHistorial={RequestHistorial}/>
      {displays[displayMode]}
      <SideBar
        isCurrent={currentTable}
        setMap={() => { setDisplay("map") }}
        setCurrent={setCurrent}
        tablePlaces={tablePlaces}
        historial={localHistorial}
      />
    </>,
    "picker": <Picker
      result={picker}
      setPicker={setPicker}
      selectedTable={getTableName(currentTable)}
      prods={prods}
      cancelPicker={() => {
        setPage("main")
        setPicker([[]])
      }}
      confirmPicker={() => {
        if (currentTable && localHistorial) {
          if (localHistorial[currentTable] && localHistorial[currentTable].historial.length !== 0 && session) {
            let date = new Date
            let message = {
              important: false,
              type: "products",
              comment: "Añadidos productos",
              timestamp: fixNum(date.getHours()) + ":" + fixNum(date.getMinutes()),
              _id: currentTable,
              name:localHistorial[currentTable].name ,
              accepted: undefined, /// only for notification events
              products: picker, /// only for notification events
              owner: session._id,
              owner_name: session.name, /// only for notification events
            }
            if(conn) conn.send(message)
          }
          setPicker([[]])
        }
        setPage("main")
      }}
    />,
    "picker-with-data": <Picker
      result={picker}
      setPicker={setPicker}
      selectedTable={getTableName(currentTable)}
      prods={prods}
      cancelPicker={() => {
        setPage("main")
        setPicker([[]])
      }}
      confirmPicker={() => {
        if (currentTable && localHistorial) {
          if (localHistorial[currentTable] && localHistorial[currentTable].historial.length !== 0) {
            setLocalHistorial({
              ...localHistorial, [currentTable]: {
                ...localHistorial[currentTable], historial: localHistorial[currentTable].historial.map((table, i) => {
                  if (i !== localHistorial[currentTable].historial.length - 1) return table
                  else return { ...table, products: picker }
                })
              }
            })
          }
          setPicker([[]])
        }
        setPage("main")
      }}
    />
  }


  const pops: router = {
    "openTable": <ConfirmPop
      title={"Realizar apertura de mesa " + getTableName(pop?.data) + "?"}
      subTitle={"Se guardará en el historial."}
      confirm={() => {
        let func = pop?.function
        setPop(undefined)
        if (func !== undefined) func()
      }} close={() => { setPop(undefined) }} />,
    "selectTable": <ConfirmPop
      title={"Confirmar comanda a mesa " + getTableName(pop?.data) + "?"}
      subTitle={"Modificará la mesa y se guardará en el historial."}
      confirm={() => {
        let func = pop?.function
        setPop(undefined)
        if (func !== undefined) func()
      }} close={() => { setPop(undefined) }} />
  }

  return <main>
    <button onClick={()=>{console.log(conn); }}>Request Historial</button>
    <Configuration.Provider value={{ config: config, setConfig: setConfig }}>
      {pop && pop.name && pops[pop.name]}
      {pages[page]}
    </Configuration.Provider>
  </main>
}