import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { Experts } from '@/services/Options'
import { Button } from '@/components/ui/button'

function UserInputDialog({children,options}) {
    const [selectedExpert,setSelectedExpert]=useState();
    const [Topic,setTopic]=useState();
  return (
    <div>
      <Dialog>
  <DialogTrigger>{children}</DialogTrigger>
  <DialogContent className={'bg-sky-100'}>
    <DialogHeader>
      <DialogTitle className={'font-bold'}>{options.name}</DialogTitle>
      <DialogDescription asChild>
        <div>
            <h2 className='font-bold'>
                Which topic do you want to cover today?
            </h2>
            <Textarea placeholder='Waiting patiently for you reply 😊...' className={'mt-3'}
                onChange={(e)=>setTopic(e.target.value)}
            />
            <h2 className='text-black mt-3'></h2>
                <h2 className='font-bold mt-2 flex flex-col items-center '>Select your Learnig Assistant</h2>
              <div className='grid grid-cols-2 md:grid-cols-2 gap-4 mt-'>
                {Experts.map((expert,index)=>
                 <div key={index} onClick={()=> setSelectedExpert(expert.name)} className='flex flex-col items-center justify-center mt-3 hover:scale-110 transition-all cursor-pointer'>
                <Image src={expert.avatar} alt={expert.name} width={100} height={100} className={`font-semibold rounded-2xl object-contain p-1 border-primary ${selectedExpert==expert.name && 'border-1'}`} />
                <h2 className='text-center'>{expert.name}</h2>
                </div>
                )}
              </div>
              <div className='flex gap-5 justify-end mt-5'>
                <DialogClose asChild>
                    <Button variant={'ghost'}>Cancel</Button>
                </DialogClose>
                <Button disabled={(!Topic || !selectedExpert)} >Lets Go</Button>
              </div>
        </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
    </div>
  )
}

export default UserInputDialog
