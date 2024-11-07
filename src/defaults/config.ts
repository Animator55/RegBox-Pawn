import { configType } from "../vite-env";

export const defaultConfig: configType = {
    animations: true,
    prodsAsList: false,
    prodsInEditorAsList: false,
    map: {
        zoom: 1,
        x: 0,
        y: 0,
    },
    miniMapOrder: "def",
    prodListOrder: "def",
    prodEditorOrder: "def",
}