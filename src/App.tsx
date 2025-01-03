import React from 'react'
import TopBar from './components/TopBar'
import Map from './components/Map'
import TableView from './components/TableView'
import { configType, HistorialTableType, histStructure, Item, router, sessionType, SingleEvent, TableEvents, TablePlaceType } from './vite-env'
import getTableData from './logic/getTableData'
import fixNum from './logic/fixDateNumber'
import { back_addTable, back_editTable } from './logic/API'
import ConfirmPop from './components/def/ConfirmPop'
import { defaultConfig } from './defaults/config'
import Peer, { DataConnection } from 'peerjs'

import "./assets/App.css"
import Picker from './components/Picker'
import { productsType } from './defaults/products'
import SideBar from './components/SideBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faRotate, faWarning, faXmark } from '@fortawesome/free-solid-svg-icons'
import TableHistorial from './components/pops/TableHistorial'

type Props = { userData: { _id: string, name: string, core: string } }

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

// let defaultHistorialParsed = {}
// for (const id in historialDef) {
//   let parsed = JSON.parse(historialDef[id]) as HistorialTableType
//   defaultHistorialParsed = { ...defaultHistorialParsed, [id]: parsed }
// }

let lastCreated: string | undefined = undefined


let peer: Peer | undefined = undefined
let conn: DataConnection | undefined = undefined


const generateSession = (id: string, name: string, core: string) => {
  return {
    _id: id,
    name: name,
    role: "pawn",
    opened: "0",
    domain: core,
    url: ""
  } as sessionType
}

let timestamp: number | undefined = undefined
let tableScroll = 0

const addMessageToRequestHistorial = (message: SingleEvent | undefined, noti_id?: string,state?: boolean)=>{
  let stor = window.localStorage.getItem("RegBoxPawn_requestHistorial")
  let newData: {[key:string]: SingleEvent} = {}
  if(stor !== null) newData = JSON.parse(stor)
  if(!newData) return
  let messageChecked = message === undefined && noti_id ? newData[noti_id] : message

  if(!messageChecked || !messageChecked.notification_id) return
  let newMessage = state ? {...messageChecked, recieved: state} : messageChecked
  window.localStorage.setItem("RegBoxPawn_requestHistorial", JSON.stringify({...newData, [messageChecked.notification_id]: newMessage}))
}

const setStoragedData = (entry: "products"|"tables",data: any)=>{
  window.localStorage.setItem("RegBoxPawn_"+entry, JSON.stringify(data))
}


const getStoragedData = (entry: "products"|"tables")=>{
  let stor = window.localStorage.getItem("RegBoxPawn_"+entry)
  if(stor === null || stor === undefined) return entry === "products" ? {} : []
  return JSON.parse(stor)
}

let noti_id_var = ""

export default function App({ userData }: Props) {
  const [error, setError] = React.useState<{ type: "error" | "info"| "warn", text: string, cancel?: boolean } | undefined>(undefined)
  const [session, setSession] = React.useState<sessionType | undefined>(undefined)
  const [config, setConfig] = React.useState(defaultConfig)
  const [page, setPageState] = React.useState<"main" | "picker">("main")
  const [displayMode, setDisplayState] = React.useState<"map" | "view">("map")
  const [localHistorial, setLocalHistorial] = React.useState<histStructure | undefined>(undefined)
  const [loading, setLoading] = React.useState<string | undefined>(undefined)
  const [localTablePlaces, setTablePlaces] = React.useState<TablePlaceType[]>(getStoragedData("tables"))
  const [prods, setProds] = React.useState<productsType>(getStoragedData("products"))

  const setDisplay = (val: "map" | "view") => {
    setDisplayState(val)
  }

  const [pop, setPop] = React.useState<{ name: string, data: any, function: Function } | undefined>(undefined)

  const [currentTable, setCurrentState] = React.useState<string | undefined>(undefined)
  const [picker, setPicker] = React.useState<Item[][]>([[]])
  let pickerOn = (picker.length !== 1 || (picker[0] && picker[0].length !== 0))

  const setPage = (val: "main" | "picker")=>{
    setError({type: "info", text: "Cargando..."})
    setTimeout(()=>{
      setError(undefined)
      setPageState(val)
    },150)
  }

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
                  comment: "Añadidos productos" + "(por: " + session.name + ")",
                  timestamp: fixNum(date.getHours()) + ":" + fixNum(date.getMinutes()),
                  notification_id: session._id + `.${Math.round(date.getTime()/100)}`,
                  _id: id,
                  name: localHistorial[id].name,
                  accepted: undefined, /// only for notification events
                  products: picker, /// only for notification events
                  owner: session._id,
                  owner_name: session.name, /// only for notification events
                }
                addMessageToRequestHistorial(message)
                if (conn) {
                  conn.send(message)
                  noti_id_var = message.notification_id
                  setLoading("request")
                }
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
              let name = getTableName(id)
              if (localTablePlaces && name !== "" && session) {
                let date = new Date
                let message = {
                  important: false,
                  type: "products",
                  comment: "Mesa creada " + "(por: " + session.name + ")",
                  timestamp: fixNum(date.getHours()) + ":" + fixNum(date.getMinutes()),
                  notification_id: session._id + `.${Math.round(date.getTime()/100)}`,
                  _id: id,
                  name: name,
                  accepted: undefined, /// only for notification events
                  products: [], /// only for notification events
                  owner: session._id,
                  owner_name: session.name, /// only for notification events
                }
                addMessageToRequestHistorial(message)
                if (conn) {
                  conn.send(message)
                  noti_id_var = message.notification_id
                  setLoading("request")
                }
              }
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
    if (!local_id || !localHistorial || !localHistorial[local_id] || localHistorial[local_id].historial.length === 0) return
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

  const addItem = (item: Item, value: 1 | -1, phasedef: number) => {
    if (!localHistorial || !currentTable) return
    let phase = phasedef
    let table = pickerOn ? picker : getLastTable(currentTable)?.products
    if (!table) return
    let prods = table[phase]

    let amount = value
    tableScroll = value !== undefined ? document.querySelector(".table-list")?.scrollTop! : 0
    let result = undefined

    if (!item.amount) return

    let newAmount = item.amount + amount
    if (newAmount <= 0) {
      result = Object.values({
        ...table, [phase]: prods.filter(el => {
          if (el._id !== item._id) return el
        })
      }) as Item[][]
    }
    else {
      result = Object.values({
        ...table, [phase]: prods.map(el => {
          if (el._id === item._id) return { ...item, amount: item.amount! + amount }
          else return el
        })
      }) as Item[][]
    }
    setPicker(result)
  }

  let tablesOpenMin = []
  for (const id in localHistorial) {
    if (localHistorial[id].historial.length === 0) continue
    let last = localHistorial[id].historial[localHistorial[id].historial.length - 1]
    if (localHistorial[id]._id && localHistorial[id].name) tablesOpenMin.push(
      { _id: localHistorial[id]._id, name: localHistorial[id].name, state: last.state }
    )
  }

  const confirmPickerWithData = () => {
    if (currentTable && localHistorial) {
      if (localHistorial[currentTable] && localHistorial[currentTable].historial.length !== 0 && session) {
        let date = new Date
        let message = {
          important: false,
          type: "replace",
          comment: "Modificados productos" + "(por: " + session.name + ")",
          notification_id: session._id + `.${Math.round(date.getTime()/100)}`,
          timestamp: fixNum(date.getHours()) + ":" + fixNum(date.getMinutes()),
          _id: currentTable,
          name: localHistorial[currentTable].name,
          accepted: undefined, /// only for notification events
          products: picker, /// only for notification events
          owner: session._id,
          owner_name: session.name, /// only for notification events
        }
        addMessageToRequestHistorial(message)
        if (conn) {
          conn.send(message)
          noti_id_var = message.notification_id
          setLoading("request")
        }
      }
      setPicker([[]])
    }
    setPage("main")
  }

  const RequestHistorial = () => {
    if (conn) {
      let type = "request-historial"
      if(Object.keys(prods).length === 0 && localTablePlaces.length === 0) type+="_products_tables"
      conn.send({ type: type })
      setLoading(type)
      if(type === "request-historial_products_tables") setError({type: "info", text: "Obteniendo datos...", cancel: true})
    }
  }

  const RequestTables = () => {
    if (conn) {
      conn.send({ type: "request-tables" })
      setLoading("request-tables")
    }
  }

  const RequestProds = () => {
    if (conn) {
      conn.send({ type: "request-products" })
      setLoading("request-products")
    }
  }
  const RequestNotificationState = (_id:string) => {
    if (conn) {
      conn.send({ type: "request-notification_state", data: _id})
      setLoading("request-notification_state")
    }
  }


  const displays: { [key: string]: any } = {
    "map": <Map
      setPage={setPage}
      setCurrent={setCurrent}
      tablesOpenMin={tablesOpenMin}
      tablePlaces={localTablePlaces}
      pickerOn={pickerOn}
      RequestTables={RequestTables}
      loading={loading}
    />,
    "view": currentTable && <TableView
      setPicker={setPicker}
      pickerOn={pickerOn}
      picker={picker}
      viewHistorial={()=>{setPop({name:"historialTable", data:"", function: ()=>{}})}}
      setPage={setPage}
      addItem={addItem}
      current={getLastTable()}
      setMap={() => { setDisplay("map") }}
      confirmPicker={confirmPickerWithData}
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

    setError({ type: "info", text: ("Estableciendo sesión como " + userData.name) })
    peer.on('error', function (err) {
      switch (err.type) {
        case 'unavailable-id':
          setError({ type: "error", text: "La sesión de (" + id + ') ya fue abierta.' })
          break
        case 'peer-unavailable':
          console.log("userOffline")
          setError({ type: "warn", text: "No se pudo conectar. Revise el estado de 'RegBox Main'." })
          break
        default:
          conn = undefined
          console.log(err)
          console.log('an error happened')
      }
      return false;
    })
    peer.on('open', function (id: string) {
      if (peer === undefined || peer.id === undefined) return
      setSession(generateSession(id, userData.name, userData.core))
      setError(undefined)
      connectToCore(userData.core)
    })
    if (conn !== undefined) return
    peer.on("connection", function (conn) {
      console.log("connected with core " + conn.peer)
      conn.on("data", function (data: { type: string, data: histStructure } | any) { //RECIEVED DATA
        console.log("a")
        if (data.type === "historial_products_tables") {
          setError(undefined)
          setLocalHistorial(data.data.historial)
          setProds(data.data.prods)
          setTablePlaces(data.data.tables)
          setStoragedData("products", data.data.prods)
          setStoragedData("tables", data.data.tables)
          setLoading(undefined)
        }
        else if (data.type === "historial") {
          setLocalHistorial(data.data)
          setLoading(undefined)
        }
        else if (data.type === "tables") {
          setTablePlaces(data.data)
          setStoragedData("tables", data.data)
          setLoading(undefined)
        }
        else if (data.type === "prods") {
          setProds(data.data)
          setStoragedData("products", data.data)
          setLoading(undefined)
        }
        else if (data.type === "notification_state") {
          addMessageToRequestHistorial(undefined, data.data._id, data.data.state)
          setLoading(undefined)
        }
        else if (data.type === "notification") {
          console.log("notification recieved", data)
          addMessageToRequestHistorial(undefined, data._id, data.state)
          let button = document.querySelector(".refresh") as HTMLButtonElement
          if (button) button.click() /// not working
        }
        else if (data.type === "error") {
          alert("Ocurrió un error, actualize la conexión.")
          setLoading(undefined)
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
    if (tableScroll !== 0) {
      let ul = document.querySelector(".table-list")
      if (ul) ul.scrollTo({ top: tableScroll, })
      tableScroll = 0
    }
  })


  React.useEffect(() => {
    if (loading === "request") {
      if(conn) {
        conn.send({type: "request-notification", data: noti_id_var})
        timestamp = setTimeout(() => {
          setLoading(undefined)
        }, 10000)
      }
    }
    else if (loading === undefined && timestamp !== undefined) {
      clearInterval(timestamp)
    }
  }, [loading])

  const pages: { [key: string]: any } = {
    "main": <>
      <TopBar
        currentTable={currentTable}
        loading={loading}
        setLoading={setLoading}
        pickerOn={pickerOn} session={session}
        RequestHistorial={RequestHistorial}
        RequestTables={RequestTables}
        RequestProds={RequestProds}
        RequestNotificationState={RequestNotificationState}
        prods={prods}
        setPicker={(val: Item[][])=>{
          setPicker(val)
          setPage("picker")
        }}
      />
      {displays[displayMode]}
      <SideBar
        isCurrent={currentTable}
        setMap={() => { setDisplay("map") }}
        setCurrent={setCurrent}
        tablePlaces={localTablePlaces}
        historial={localHistorial}
        cancelPicker={setPicker}
      />
    </>,
    "picker": <Picker
      loading={loading}
      result={picker}
      setPicker={setPicker}
      RequestProds={RequestProds}
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
              comment: "Añadidos productos" + "(por: " + session.name + ")",
              notification_id: session._id + `.${Math.round(date.getTime()/100)}`,
              timestamp: fixNum(date.getHours()) + ":" + fixNum(date.getMinutes()),
              _id: currentTable,
              name: localHistorial[currentTable].name,
              accepted: undefined, /// only for notification events
              products: picker, /// only for notification events
              owner: session._id,
              owner_name: session.name, /// only for notification events
            }
            addMessageToRequestHistorial(message)
            if (conn) {
              conn.send(message)
              noti_id_var = message.notification_id
              setLoading("request")
            }
          }
          setPicker([[]])
        }
        setPage("main")
      }}
    />,
    "picker-with-data": <Picker
      loading={loading}
      result={picker}
      setPicker={setPicker}
      RequestProds={RequestProds}
      selectedTable={getTableName(currentTable)}
      prods={prods}
      cancelPicker={() => {
        setPage("main")
        setPicker([[]])
      }}
      confirmPicker={confirmPickerWithData}
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
      }} close={() => { setPop(undefined) }} />,
    "historialTable": <TableHistorial
      selectedTable={localHistorial ? currentTable ? localHistorial[currentTable] : undefined : undefined}
      close={() => { setPop(undefined) }} />
  }

  return <main>
    {peer && (!error && loading !== "request-historial_products_tables") ? <>
      <section style={{ position: "fixed", pointerEvents: "none", textAlign: "center", bottom: "1.5rem", zIndex: 1, width: "100%", color: "white" }}>{loading}</section>
      <Configuration.Provider value={{ config: config, setConfig: setConfig }}>
        {pop && pop.name && pops[pop.name]}
        {pages[page]}
      </Configuration.Provider>
    </> :
      <section className='warning fixed'>
        <FontAwesomeIcon icon={error?.type === "info" ? faRotate: faWarning} spin={error?.type === "info"} />
        <h2>{error?.text}</h2>
        {(error?.type !== "info" || error?.cancel === true) && <button className='default-button' onClick={() => { 
            if(error?.cancel === true) setLoading(undefined)
            if(error?.type === "error") location.reload() 
            else setError(undefined)
          }}>
          <FontAwesomeIcon icon={error?.type === "error" ? faRotate : error?.cancel ? faXmark: faCheck} />
          {error?.type === "error" ? "Reiniciar" :error?.cancel ? "Cancelar": "Aceptar"}
        </button>}
      </section>
    }
  </main>
}