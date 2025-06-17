import React from 'react'
import FeatAssit from './_components/FeatAssit'
import History from './_components/History'
import Feedback from './_components/Feedback'

function Dashboard() {
  return (
    <div>
      <FeatAssit />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-10'>
        <History />
        <Feedback />
      </div>
    </div>
  )
}

export default Dashboard
