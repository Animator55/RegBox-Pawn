import React from 'react'
import TopBar from './components/TopBar'
import TableList from './components/TableList'
import NavBar from './components/NavBar'
import Map from './components/Map'
import TableView from './components/TableView'
import { TableType } from './vite-env'

type Props = {}


export default function App({}: Props) {
  const [page, setPage] = React.useState<"main" | "picker">("main")
  const [displayMode, setDisplay] = React.useState<"list" | "map" | "view">("list")

  const [currentTable, setCurrent] = React.useState<TableType | undefined>(undefined)

  const displays: {[key:string]: any} = {
    "list":<TableList setCurrent={setCurrent}/>, 
    "map": <Map setCurrent={setCurrent}/>,
    "view": <TableView current={currentTable}/>
  } 

  const pages: {[key:string]: any} = {
    "main": <>
      <TopBar/>
      {displays[displayMode]}
      <NavBar setNav={setDisplay}/>
    </>,
    "picker": <>a</>
  }

  return <main>
    {pages[page]}
  </main>
}