'use client'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { options } from '@/services/Options'
import { useUser } from '@stackframe/stack'
import Image from 'next/image'
import React from 'react'
import UserInputDialog from './UserInputDialog'

function FeatAssit() {
    const user=useUser()
  return (
    <div>
        <div className='flex justify-between items-center'>
            <div>
                <h2 className='font-medium font-serif'>My Space</h2>
                <h2 className='text-3xl font-extrabold font-serif'>Welcome Back , {user?.displayName}</h2>
            </div>
            <Button>Profile</Button>
        </div>
        <div className='grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 mt-10'>
          {options.map((option, index) => (
            <BlurFade key={option.icon} delay={0.25 +index*0.05} inView>
               <div key={index} className='flex flex-col items-center justify-center p-8 border rounded-3xl bg-secondary cursor-pointer hover:bg-secondary hover:scale-120 transition-all '>
             <UserInputDialog options={option} > 
               <div key={index} className='flex flex-col items-center justify-center'>
              <Image src={option.icon} alt={option.name} width={150} height={150} className='h-[70px] w-[70px]' />
              <h2 className='font-semibold mt-2 '>{option.name}</h2>
              </div>
            </UserInputDialog>
                </div>
            </BlurFade>  
          ))}
        </div>
    </div>
  )
}

export default FeatAssit
