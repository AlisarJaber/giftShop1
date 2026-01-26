import { Routes, Route } from 'react-router-dom'
import Login from './components/pages/login'
import Signup from './components/pages/signup'
import Navigation from './components/layouts/layout/navigation'

function App() {

  return (
    <>
    <Navigation/>
    <Routes>
      <Route path='/login' Component={Login}/>
      <Route path='/signup' Component={Signup}/>
    </Routes>
    </>
  )
}


export default App
