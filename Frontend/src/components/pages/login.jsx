import axios from "axios"
import { useState } from "react"


const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")


    const sendData = async (event) => {
        event.preventDefault()
        await axios.post("http://localhost:8000/auth/login",
            {email: email, password: password }
        )
    }

    return (
        <div>
            <form>
                <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} type="text" placeholder="email" />
                <input className="input" value={password} onChange={(event) => setPassword(event.target.value)} type="text" placeholder="password" />
                <button className="btn" type="submit"> Submit </button>
            </form>
        </div>
    )
}


export default Login
