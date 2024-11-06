import { TableEvents } from "../vite-env"

export const back_addTable = (Table: TableEvents)=>{
    Table
    // return null
    const responses = {
        "success": {
            title: "Apertura de mesa exitosa",
            content: "La mesa fue abierta.",
            icon: "check",
            _id: `${Math.random()}`
        }, 
        "error": {
            title: "Apertura de mesa fallida",
            content: "La conexión falló y la mesa no fue abierta, la misma se mostrará con su estado anterior para evitar errores de sincronización.",
            icon: "xmark",
            _id: `${Math.random()}`
        },
        "denied": {
            title: "Apertura denegada",
            content: "No tienes permitido abrir mesas en esta sesión y la misma no fue abierta.",
            icon: "xmark",
            _id: `${Math.random()}`
        }
    } 
    // let stor = window.localStorage.getItem("RegBoxSession")
    // if (!stor || stor === "") return responses["error"]
    // let session = JSON.parse(stor) as sessionType
    // let result = checkUser(session.name, undefined, session.domain)
    
    // let alert = responses[result.type]
    return true
}