import axios from "axios"
import { useState } from "react"


const Signup = () => {
    const [first_name, setFirst_name] = useState("")
    const [last_name, setLast_name] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")


    const sendData = async (event) => {
        event.preventDefault()
        await axios.post("http://localhost:8000/auth/signup",
            { first_name: first_name, last_name: last_name, email: email, password: password }
        )
    }

    return (
        <div>
            <form>
                <input className="input" value={first_name} onChange={(event) => setFirst_name(event.target.value)} type="text" placeholder="first name" />
                <input className="input" value={last_name} onChange={(event) => setLast_name(event.target.value)} type="text" placeholder="last name" />
                <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} type="text" placeholder="email" />
                <input className="input" value={password} onChange={(event) => setPassword(event.target.value)} type="text" placeholder="password" />
                <button className="btn" type="submit"> Submit </button>
            </form>
        </div>
    )
}


export default Signup
