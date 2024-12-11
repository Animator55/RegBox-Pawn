import "../assets/auth.css"


type Props = {
    login: Function
}

export default function Auth({login}: Props) {
  return <section className="auth-section">
    <h3 className="title">Login</h3>
    <hr/>
        <button onClick={()=>{login("pawn-1")}}>pawn-1</button>
        <button onClick={()=>{login("pawn-2")}}>pawn-2</button>
        <button onClick={()=>{login("pawn-3")}}>pawn-3</button>
  </section>
}