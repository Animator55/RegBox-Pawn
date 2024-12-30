import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "../assets/auth.css"
import { faCircleExclamation, faEye, faEyeSlash, faQrcode, faXmark } from "@fortawesome/free-solid-svg-icons"
import { router, userDataStructure } from "../vite-env"
import React, { useRef, useState } from "react";
import { BrowserMultiFormatReader } from '@zxing/library';


type Props = {
  login: Function
}

const getSessions = () => {
  let storage = window.localStorage.getItem("RegBoxSessions")
  let sessions: { [key: string]: { _id: string, name: string, password: string, domain: string } } = {}
  if (storage !== "" && storage !== null) sessions = JSON.parse(storage)
  return sessions
}

const getDomains = () => {
  let sessions = getSessions()
  let domains = []
  for (const key in sessions) {
    domains.push(sessions[key].domain)
  }
  return domains
}

const createCurrentSession = (data: { _id: string, name: string,password:string, domain: string })=>{
  let prev = window.localStorage.getItem("RegBox_Current_Session")
  if(prev !== null && prev !== undefined) return
  window.localStorage.setItem("RegBox_Current_Session", JSON.stringify(data))
}

const generateSession = (name: string, password: string, domain: string) => {
  let sessions = getSessions()

  let id = ""

  for (const key in sessions) {
    if (sessions[key].name === name &&
      sessions[key].password === password &&
      sessions[key].domain === domain
    ) {
      id = sessions[key]._id
      break
    }
  }
  if (id === "") return { type: "error", data: "Usuario, contraseña o dominio incorrecto/s." }

  let userData = { _id: id, name, password, domain }
  createCurrentSession(userData)
  return { type: "success", data: userData }
}

const createSession = (name: string, password: string, domain: string) => {
  let sessions = getSessions()

  let boolean = false ///  checks if already exists
  for (const key in sessions) {
    if (sessions[key].name === name &&
      sessions[key].domain === domain
    ) {
      boolean = true
      break
    }
  }
  if (boolean) return { type: "error", data: "Usuario ya existente en el dominio." }

  let id = `${name}&%_/${Math.round((Math.random() * Math.random()) * 100000)}`
  let userData = {
    _id: id,
    name,
    password,
    domain
  }

  window.localStorage.setItem("RegBoxSessions", JSON.stringify({ ...sessions, [id]: userData }))
  createCurrentSession(userData)

  return { type: "success", data: userData }
}

export default function Auth({ login }: Props) {
  let domains = getDomains()

  const [page, setPage] = React.useState(domains.length === 0 ? "create" : "login")
  const [error, setError] = React.useState("")

  const videoRef = useRef<HTMLVideoElement>(null);
  const qrReaderRef = useRef<BrowserMultiFormatReader | null>(null); // Referencia al lector de QR
  const [scanResult, setScanResult] = useState<string>("");

  let currentSession = window.localStorage.getItem("RegBox_Current_Session")
  let parsedSession= null
  if(currentSession) parsedSession = JSON.parse(currentSession)

  const startScanner = () => {
    if (!videoRef.current) return
    videoRef.current.parentElement!.style.opacity = "1"
    videoRef.current.parentElement!.style.pointerEvents = "all"
    const codeReader = new BrowserMultiFormatReader();
    qrReaderRef.current = codeReader; // Almacena la instancia para controlarla luego

    codeReader
      .decodeFromVideoDevice(null, videoRef.current, result => {
        if (result) {
          stopScanner(); // Detiene la cámara después de escanear
          setScanResult(result.getText());
        }
      })
      .catch((err) => console.error("Error al iniciar el escáner:", err));
  };

  const stopScanner = () => {
    if (qrReaderRef.current) {
      qrReaderRef.current.reset(); // Detiene el lector de QR
    }
    if (videoRef.current) {
      videoRef.current.parentElement!.style.pointerEvents = ""
      videoRef.current.parentElement!.style.opacity = ""

      if (videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        const tracks = mediaStream.getTracks();
        tracks.forEach((track) => track.stop()); // Detiene todos los tracks activos
      }
    }
    setScanResult("")
  };

  React.useEffect(() => {
    return () => {
      stopScanner(); // Asegura que los recursos se liberan al desmontar
    };
  }, []);


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

    let result: { type: string, data: userDataStructure | string } = createSession(name, password, domain)

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
      <h2 className="title fade-up">Iniciar sesión</h2>
      <hr />

      <section className='error-box'>
        {error !== "" && <FontAwesomeIcon icon={faCircleExclamation} />}
        {error}
      </section>

      <form onSubmit={submit} className='form fade-up' style={{ animationDelay: ".2s" }}>
        <div className='labeled-input'>
          <label>Usuario</label>
          <input name='user' defaultValue={parsedSession ? parsedSession.name : ""} />
        </div>
        <div className='labeled-input'>
          <label>Contraseña</label>
          <div className='input-container'>
            <input name="password" type='password' defaultValue={parsedSession ? parsedSession.password : ""} />
            <button type='button' onClick={togglePassword}>
              <FontAwesomeIcon icon={faEyeSlash} />
              <FontAwesomeIcon icon={faEye} />
            </button>
          </div>
        </div>
        <div className='labeled-input'>
          <label>Dominio</label>
          <select name="domain" defaultValue={parsedSession ? parsedSession.domain : ""}>
            {domains.length !== 0 && domains.map(dom => {
              return <option
                key={Math.random()}
              >
                {dom}
              </option>
            })}
          </select>
        </div>

        <button name='login' id="login-button" type='submit' data-text="Confirmar"></button>
        <a onClick={() => { setPage("create") }}>Crear una nueva cuenta</a>
      </form>
    </>
  }

  const CreateComp = () => {
    return <>
      <h2 className="title fade-up">Crear sesión</h2>
      <hr />

      <section className='error-box'>
        {error !== "" && <FontAwesomeIcon icon={faCircleExclamation} />}
        {error}
      </section>

      <form onSubmit={create} className='form fade-up' style={{ animationDelay: ".2s" }}>
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
          {scanResult !== ""?
            <div className='input-container'>
              <input name="domain" defaultValue={scanResult} />
              <button className="xmark" type='button' onClick={() => { setScanResult("") }}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            :
            <>
              <button className="qr-button" type="button" onClick={startScanner}>
                <FontAwesomeIcon icon={faQrcode} />
                Escanear QR
              </button>
              <section className="QR-recorder">
                <button type="button" className="cancel-qr" onClick={() => {
                  stopScanner()
                }}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
                <video ref={videoRef} width="100%" height="auto" />
              </section>
            </>
          }
        </div>

        <button name='login' type='submit' data-text="Confirmar"></button>
        {domains.length !== 0 && <a onClick={() => { setPage("login") }}>Ya tienes una cuenta? Inicia sesión</a>}
      </form>
    </>
  }

  React.useEffect(()=>{
    if(!parsedSession) return
    let submitButton = document.getElementById("login-button")
    if(submitButton) submitButton.click()
  })

  const pages: router = {
    "login": <LoginComp />,
    "create": <CreateComp />,

  }

  return <section className="auth-section">
    {pages[page]}
  </section>
}