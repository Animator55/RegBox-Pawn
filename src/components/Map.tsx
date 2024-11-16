import { faExpand, faMinus, faPen, faPlus, faWarning } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { TablePlaceType } from '../vite-env'
import { checkTable } from '../logic/checkTableState'
import { colorSelector } from '../logic/colorSelector'
import { Configuration } from '../App'
import Slider from './def/Slider'

type Props = {
  setCurrent: Function
  tablesOpenMin: { _id: string, name: string, state: "open" | "paying" | "closed" | "unnactive" }[]
  tablePlaces: TablePlaceType[]
  setPage: Function
  pickerOn: boolean
}


export default function Map({ setCurrent, tablesOpenMin, tablePlaces, setPage,pickerOn }: Props) {
  const c = React.useContext(Configuration)
  // const [localMap, setMap] = React.useState<TablePlaceType[]>(tablePlaces)
  const localMap:TablePlaceType[] = tablePlaces

  const MapDisplay = () => {
    const drag = (e: React.MouseEvent) => {
      let back = e.target as HTMLDivElement
      if (back.className !== "background" && back.className !== "draggable") return
      let target = back.className !== "draggable" ? back.firstChild as HTMLDivElement : back
      const move = (e2: MouseEvent) => {
        let left = parseInt(target.style.left)
        let top = parseInt(target.style.top)

        target.style.left = left + e2.movementX + "px"
        target.style.top = top + e2.movementY + "px"
      }
      const drop = () => {
        let target = document.querySelector(".draggable") as HTMLDivElement
        if(!target) return
        let x = parseInt(target.style.left)
        let y = parseInt(target.style.top)

        if (x !== c.config.map.x || y !== c.config.map.y) c.setConfig(
          { ...c.config, map: { ...c.config.map, x: x, y: y } })

        document.removeEventListener("mousemove", move)
        document.removeEventListener("mouseup", drop)
        document.removeEventListener("mouseleave", drop)
      }

      document.addEventListener("mousemove", move)
      document.addEventListener("mouseup", drop)
      document.addEventListener("mouseleave", drop)
    }
    const drag_Touch = (e: React.TouchEvent) => {
      let back = e.target as HTMLDivElement
      if (back.className !== "background" && back.className !== "draggable") return
      let target = back.className !== "draggable" ? back.firstChild as HTMLDivElement : back

      let left = parseInt(target.style.left)
      let top = parseInt(target.style.top)
      let origin_x = e.touches[0].pageX - left
      let origin_y = e.touches[0].pageY - top
      const move = (e2: TouchEvent) => {
        let changeX = e2.touches[0].pageX - origin_x
        let changeY = e2.touches[0].pageY - origin_y
        target.style.left = changeX + "px"
        target.style.top = changeY + "px"
      }
      const drop = () => {
        let target = document.querySelector(".draggable") as HTMLDivElement
        if(!target) return

        let x = parseInt(target.style.left)
        let y = parseInt(target.style.top)

        if (x !== c.config.map.x || y !== c.config.map.y) c.setConfig(
          { ...c.config, map: { ...c.config.map, x: x, y: y } })

        document.removeEventListener("touchmove", move)
        document.removeEventListener("touchend", drop)
        document.removeEventListener("touchcancel", drop)
      }

      document.addEventListener("touchmove", move)
      document.addEventListener("touchend", drop)
      document.addEventListener("touchcancel", drop)
    }
    /// touchresize

    const changeZoom = (zoomin: boolean) => {
      let zone = document.querySelector(".draggable") as HTMLDivElement
      if (!zone) return
      let scale = parseFloat(zone.style.scale)
      let newScale = !zoomin ? scale - 0.02 : scale + 0.02
      if (newScale < 0.05) return
      zone.style.scale = `${newScale}`
      if (!zone.parentElement) return
      zone.parentElement.addEventListener("mousemove", () => {
        c.setConfig({ ...c.config, map: { ...c.config.map, zoom: newScale } })
      })
      let numberDiv = document.querySelector(".zoom-number") as HTMLDivElement
      if (!numberDiv) return
      numberDiv.textContent = `${Math.round(newScale * 100)}%`
    }


    ///components 

    const Buttons = () => {
      return <>
        <div className='zoom-container'>
          <button title='Centrar mapa' className='center-map' onClick={() => { c.setConfig({ ...c.config, map: { ...c.config.map, x: 0, y: 0 } }) }
          }><FontAwesomeIcon icon={faExpand} /></button>
          <button title='Alejar' onClick={() => { changeZoom(false) }}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <Slider value={c.config.map.zoom*100} setValue={(val:number)=>{c.setConfig({...c.config, map:{...c.config.map, zoom: val}})}}/>
          <button title='Acercar' onClick={() => { changeZoom(true) }}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </>
    }

    const TableDraggable = ({ tbl }: { tbl: TablePlaceType }) => {
      let color = "var(--clightgray)"
      let check = checkTable(tbl._id, tablesOpenMin)
      if (check.result) color = colorSelector[check.state]

      return <button
        id={tbl._id}
        // onMouseDown={(e) => { if (editMode && e.currentTarget.contentEditable !== "true") dragItem(e) }}
        // onTouchStart={(e) => { if (editMode && e.currentTarget.contentEditable !== "true") dragItem_Touch(e) }}
        onClick={() => { 
          // if (!editMode) 
            setCurrent(tbl._id, check.state === "unnactive") 
          }}
        className={"table"}
        style={{
          width: tbl.size.x,
          height: tbl.size.y,
          top: tbl.coords.y,
          left: tbl.coords.x,
          backgroundColor: color
        }}
      >
        <p>{tbl.name}</p>
      </button>
    }

    const Alert = () => {
      return <section className='alert'>
        <FontAwesomeIcon icon={faWarning} />
        <h2>No hay mesas añadidas a el mapa.</h2>
      </section>
    }

    return <section className='map-display'>
      <Buttons />
      <section className='background' onMouseDown={drag} onTouchStart={drag_Touch} onWheel={(e) => { changeZoom(e.deltaY < 0) }}>
        {localMap && localMap.length !== 0 ?
          <div className='draggable' style={{
            top: c.config.map.y, left: c.config.map.x, scale: `${c.config.map.zoom}`
          }} >
            {localMap.map((tbl) => <TableDraggable key={Math.random()} tbl={tbl} />)}
          </div> : <Alert />
        }
      </section>
    </section>
  }

  return <section className='map page'>
    <MapDisplay />
    <button className='picker-mode-button'
      style={pickerOn ? { backgroundColor: "var(--cgreen)" } : {}}
      onClick={() => { setPage("picker") }}>
      <FontAwesomeIcon icon={pickerOn ? faPen : faPlus} />
    </button>
  </section>

}