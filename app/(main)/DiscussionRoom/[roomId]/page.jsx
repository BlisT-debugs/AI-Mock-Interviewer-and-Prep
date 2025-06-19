"use client"
import { api } from '@/convex/_generated/api';
import { Experts } from '@/services/Options';
import { UserButton } from '@stackframe/stack';
import { useQuery } from 'convex/react';
import Image from 'next/image';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'


function DiscussionRoom() {
  const {roomId} = useParams();
  const RoomData=useQuery(api.DiscussionRoom.GetRoom,{id:roomId});
  const [expert,setExpert]=useState();
  useEffect(()=>{
    if (RoomData) {
      const Expert=Experts.find(item=>item.name==RoomData.Assistant)
      console.log(Expert)
      setExpert(Expert) 
      
    }
  },[RoomData])
    return (
    <div>
      <h2 className='text-lg font-bold'>{RoomData?.Option}</h2>
      <div className='mt-7 grid grid-cols-1 lg:grid-cols-3 gap-10'>
        <div className='lg:col-span-2 h-[70vh] bg-secondary border rounded-3xl flex flex-col items-center justify-center relative'>
          <Image src ={expert?.avatar} alt='Avatar' height={200} width={200}
          className='rounded-full h-[100px] w-[100px] object-cover animate-pulse' />
          <h2 className='font-mono text-gray-500'>{expert?.name}</h2>
          <div className='p-7 bg-gray-300 px-15 rounded-lg absolute bottom-5 right-5'>
            <UserButton/>
          </div>
        </div>
        <div className=' h-[70vh] w-[400px] bg-secondary border rounded-3xl flex flex-col items-center justify-center relative'>
            <h2 className='font-semibold'>Interaction Section</h2>
        </div>
      </div>
    </div>
  )
}

export default DiscussionRoom
