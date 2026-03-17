import React from 'react'
import './index.css'
import { SparklesPreview } from './components/ui/SparklesPreview'

function App() {
  return (
    <div className='h-screen w-full bg-zinc-800 text-white'>
      <h1 className='text-3xl font-bold text-center mt-10'>Hello World</h1>
      <p className='text-center mt-4'>IS mango pie speaking</p>
      <SparklesPreview />
    </div>
  )
}

export default App
