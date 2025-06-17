import React from 'react'
import AppHeader from './_components/AppHeader'

function DashboardLayout({ children }) {
  return (
    <div>
      <AppHeader />
      <div className='p-10 mt-14 md:px-20 lg:px-40 xl:px-60 2xl:px-80'>
      {children}
      </div>
    </div>
  )
}

export default DashboardLayout
