import React from 'react'
import AppHeader from './_components/AppHeader'

function DashboardLayout({ children }) {
  return (
    <div>
      <AppHeader />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-70 py-10'>
      {children}
      </div>
    </div>
  )
}

export default DashboardLayout
