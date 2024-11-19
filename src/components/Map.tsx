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


export default function Map({ setCurrent, tablesOpenMin, tablePlaces, setPage, pickerOn }: Props) {
  const c = React.useContext(Configuration)
  const localMap: TablePlaceType[] = tablePlaces

  React.useEffect(() => {

    const zoomContainer = document.querySelector<HTMLDivElement>('.background');
    const zoomContent = document.querySelector<HTMLDivElement>('.draggable');

    if (!zoomContainer || !zoomContent) {
      throw new Error("Zoom container or content not found.");
    }

    // Estados iniciales
    let scale: number = c.config.map.zoom; // Nivel inicial de zoom
    let lastScale: number = c.config.map.zoom; // Escala anterior para cálculos
    let panX: number = c.config.map.x; // Desplazamiento horizontal
    let panY: number = c.config.map.y; // Desplazamiento vertical
    let lastPanX: number = c.config.map.x;
    let lastPanY: number = c.config.map.y;

    let startTouches: Touch[] = []; // Toques iniciales

    // Eventos
    zoomContainer.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 2) {
        startTouches = Array.from(e.touches);
        lastScale = scale;
      }

      if (e.touches.length === 1) {
        startTouches = Array.from(e.touches);
        lastPanX = panX;
        lastPanY = panY;
      }
    });

    zoomContainer.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2) {
        // Zoom
        const [touch1, touch2] = e.touches;
        const distStart = calculateDistance(startTouches[0], startTouches[1]);
        const distCurrent = calculateDistance(touch1, touch2);

        scale = lastScale * (distCurrent / distStart);
        scale = Math.min(Math.max(scale, 0.5), 1.8); // Limitar zoom entre 1x y 3x
        let drag = document.querySelector(".drag-slider") as HTMLDivElement
        if (!drag) return
        drag.style.top = `${Math.round(scale - 0.5 / 1.5)}%`
      }

      if (e.touches.length === 1) {
        // Movimiento
        const touch = e.touches[0];
        panX = lastPanX + (touch.pageX - (startTouches[0]?.pageX || touch.pageX));
        panY = lastPanY + (touch.pageY - (startTouches[0]?.pageY || touch.pageY));
      }

      updateTransform();
    });

    zoomContainer.addEventListener('touchend', (e: TouchEvent) => {
      // Reiniciamos los toques si todos los dedos se levantaron
      if (e.touches.length === 0) {
        startTouches = [];
      }
      let target = document.querySelector(".draggable") as HTMLDivElement
      if (!target) return
      let data = target.style.transform
      const regex = /scale\(([\d.]+)\)\s+translate\(([\d.-]+)px,\s*([\d.-]+)px\)/;

      const matches = data.match(regex);

      if (matches) {
        const scale = parseFloat(matches[1]);
        const translateX = parseFloat(matches[2]);
        const translateY = parseFloat(matches[3]);

        if (translateX !== c.config.map.x || translateY !== c.config.map.y) c.setConfig(
          { ...c.config, map: { ...c.config.map, zoom: scale, x: translateX, y: translateY } })
      }
    });

    // Función para actualizar transformaciones
    function updateTransform() {
      if (!zoomContent) return
      zoomContent.style.transform = `scale(${scale}) translate(${panX}px,${panY}px)`;
    }

    // Función para calcular la distancia entre dos puntos
    function calculateDistance(touch1: Touch, touch2: Touch): number {
      const dx = touch1.pageX - touch2.pageX;
      const dy = touch1.pageY - touch2.pageY;
      return Math.sqrt(dx * dx + dy * dy);
    }

  })

  const MapDisplay = () => {


    ///components 

    const Buttons = () => {
      return <>
        <div className='zoom-container'>
          <button title='Centrar mapa' className='center-map' onClick={() => { c.setConfig({ ...c.config, map: { ...c.config.map, x: 0, y: 0 } }) }
          }><FontAwesomeIcon icon={faExpand} /></button>
          <Slider value={((c.config.map.zoom - 0.5)/ 1.5)*100} setValue={(val: number) => { c.setConfig({ ...c.config, map: { ...c.config.map, zoom: val } }) }} />
        </div>
      </>
    }

    const TableDraggable = ({ tbl }: { tbl: TablePlaceType }) => {
      let color = "var(--clightgray)"
      let check = checkTable(tbl._id, tablesOpenMin)
      if (check.result) color = colorSelector[check.state]

      return <button
        id={tbl._id}
        onClick={() => {
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
      <section className='background'
      // onMouseDown={drag} onTouchStart={drag_Touch} onWheel={(e) => { changeZoom(e.deltaY < 0) }}
      >
        {localMap && localMap.length !== 0 ?
          <div className='draggable'
            style={{
              transform: `scale(${c.config.map.zoom}) translate(${c.config.map.x}px,${c.config.map.y}px)`
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