import { router } from "../vite-env"

export const stateTraductions: router = {
    "unnactive": "Inactiva", "closed": "Cerrada", "open": "Abierta", "paying": "Pagando"
}

export const orderNameTranslations:{[key:string]: string}={
    abc: "Alfabético",
    "abc-r": "Alfabético Inverso",
    def: "Creación",
    "def-r": "Creación Inverso",
}
