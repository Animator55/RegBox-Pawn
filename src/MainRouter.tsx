import React from 'react'
import App from './App'
import {  userDataStructure } from './vite-env'
import Auth from './components/Auth'

type Props = {}

// const stor: router = {
//     "pawn-1": {
//         _id: "pawn-1",
//         name: "Pawn1",
//         core: "main-1"
//     },
//     "pawn-2": {
//         _id: "pawn-2",
//         name: "Pawn2",
//         core: "main-1"
//     },
//     "pawn-3": {
//         _id: "pawn-3",
//         name: "Pawn3",
//         core: "main-1"
//     },
// }

export default function MainRouter({ }: Props) {
    const [userDataState, setUserData] = React.useState<undefined | { _id: string, name: string, core: string }>(undefined)
    const login = (data: userDataStructure) => {
        let session = {_id: data._id, name:data.name, core: data.domain}
        setUserData(session)
    }

    return userDataState ? <App userData={userDataState} /> : <Auth login={login} />
}