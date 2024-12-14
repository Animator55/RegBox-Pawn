import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "../assets/auth.css"
import { faCircleExclamation, faEye, faEyeSlash, faQrcode } from "@fortawesome/free-solid-svg-icons"
import React from "react"
import { router, userDataStructure } from "../vite-env"


type Props = {
  login: Function
}

const getSessions = ()=>{
  let storage = window.localStorage.getItem("RegBoxSessions")
  let sessions: { [key: string]: { _id: string, name: string, password: string, domain: string } } = {}
  if (storage !== "" && storage !== null) sessions = JSON.parse(storage)
  return sessions
}

const getDomains = ()=>{
  let sessions = getSessions()
  let domains = []
  for (const key in sessions) {
    domains.push(sessions[key].domain)
  }
  return domains
}

const generateSession = (name: string, password: string, domain: string) => {
  let sessions = getSessions()

  let id= ""

  for(const key in sessions){
    if(sessions[key].name === name &&
      sessions[key].password === password &&
      sessions[key].domain === domain
    ) {
      id = sessions[key]._id
      break
    }
  }
  if(id === "") return {type: "error", data:"Usuario, contraseña o dominio incorrecto/s."}

  return {type: "success", data:{_id: id,name, password, domain}}
}

const createSession = (name: string, password: string, domain: string) => {
  let sessions = getSessions()

  let boolean = false ///  checks if already exists
  for(const key in sessions){
    if(sessions[key].name === name &&
      sessions[key].domain === domain
    ) {
      boolean = true
      break
    }
  }
  if(boolean) return {type: "error", data:"Usuario ya existente en el dominio."}
  
  let id = `${name}${Math.round((Math.random()*Math.random())*100000)}`
  let userData = {
    _id: id,
    name,
    password,
    domain
  }

  window.localStorage.setItem("RegBoxSessions", JSON.stringify({...sessions, [id]: userData}))

  return {type: "success", data: userData}
}

export default function Auth({ login }: Props) {
  let domains = getDomains()

  const [page, setPage] = React.useState(domains.length === 0 ? "create" : "login")
  const [error, setError] = React.useState("")


  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let form = e.currentTarget as HTMLFormElement

    let [name, password, domain]: string[] = [form["user"].value, form["password"].value, form["domain"].value]
    if (name === "" || domain === "" || password === "") return setError("Completa todos los campos")

    let submit = form["login"]

    submit.classList.add('loading-button')


    // send request ---- then =>

    let result = generateSession(name, password, domain)

    setTimeout(() => {
      submit.classList.remove('loading-button')
      if (result.type === "error") return setError(result.data as string)
      else login(result.data)
    }, 500)
  }
  const create = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let form = e.currentTarget as HTMLFormElement

    let [name, password, domain] = [form["user"].value, form["password"].value, form["domain"].value]
    if (name === "" || domain === "" || password === "") return setError("Complete all inputs")

    let submit = form["login"]

    submit.classList.add('loading-button')


    // send request ---- then =>

    let result: {type: string, data: userDataStructure | string} = createSession(name, password, domain)

    setTimeout(() => {
      submit.classList.remove('loading-button')
      if (result.type === "error") return setError(result.data as string)
      else login(result.data)
    }, 500)
  }

  const togglePassword = (e: React.MouseEvent) => {
    let button = e.currentTarget as HTMLButtonElement
    button.classList.toggle('check')

    let input = button.previousElementSibling as HTMLInputElement
    input.type = input.type === "text" ? "password" : "text"
  }

  const LoginComp = () => {
    return <>
      <h2>Iniciar sesión</h2>
      <hr />

      <section className='error-box'>
        {error !== "" && <FontAwesomeIcon icon={faCircleExclamation} />}
        {error}
      </section>

      <form onSubmit={submit} className='form'>
        <select name="domain">
          {domains.length !== 0 && domains.map(dom => {
            return <option
              key={Math.random()}
            >
              {dom}
            </option>
          })}
        </select>
        <div className='labeled-input'>
          <label>Usuario</label>
          <input name='user' defaultValue={"PawnTest"} />
        </div>
        <div className='labeled-input'>
          <label>Contraseña</label>
          <div className='input-container'>
            <input name="password" type='password' defaultValue={"1"} />
            <button type='button' onClick={togglePassword}>
              <FontAwesomeIcon icon={faEyeSlash} />
              <FontAwesomeIcon icon={faEye} />
            </button>
          </div>
        </div>

        <button name='login' type='submit' data-text="Confirmar"></button>
        <a onClick={() => { setPage("create") }}>Crear una nueva cuenta</a>
      </form>
    </>
  }

  const CreateComp = () => {
    return <>
      <h2>Crear sesión</h2>
      <hr />

      <div className='divisor' data-text=""></div>
      <section className='error-box'>
        {error !== "" && <FontAwesomeIcon icon={faCircleExclamation} />}
        {error}
      </section>

      <form onSubmit={create} className='form'>
        <div className='labeled-input'>
          <label>Usuario</label>
          <input name='user' />
        </div>
        <div className='labeled-input'>
          <label>Contraseña</label>
          <div className='input-container'>
            <input name="password" type='password' />
            <button type='button' onClick={togglePassword}>
              <FontAwesomeIcon icon={faEyeSlash} />
              <FontAwesomeIcon icon={faEye} />
            </button>
          </div>
        </div>
        <div className='labeled-input'>
          <label>Dominio</label>
          <input name="domain" className="d-none" defaultValue={"main-1"}/>
          <button type="button" onClick={() => {
            console.log("qr")
          }}>
            <FontAwesomeIcon icon={faQrcode} />
            Escanear QR
          </button>
        </div>

        <button name='login' type='submit' data-text="Confirmar"></button>
        {domains.length !== 0 && <a onClick={() => { setPage("login") }}>Ya tienes una cuenta? Inicia sesión</a>}
      </form>
    </>
  }

  const pages: router = {
    "login": <LoginComp />,
    "create": <CreateComp />,

  }

  return <section className="auth-section">
    {pages[page]}
  </section>
}