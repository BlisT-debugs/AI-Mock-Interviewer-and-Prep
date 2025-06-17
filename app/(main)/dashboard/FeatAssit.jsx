'use client'
import { useUser } from '@stackframe/stack'
import React from 'react'

function FeatAssit() {
    const user=useUser()
  return (
    <div>
      <h2>My Space</h2>
      <h2>Welcome Back , {user?.displayName}</h2>
    </div>
  )
}

export default FeatAssit
