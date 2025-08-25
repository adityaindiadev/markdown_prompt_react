import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PromptEditor from './PromptEditor'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PromptEditor/>
    </>
  )
}

export default App
