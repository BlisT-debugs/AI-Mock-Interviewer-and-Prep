"use client"
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { Experts } from '@/services/Options';
import { UserButton } from '@stackframe/stack';
import { RealtimeTranscriber } from 'assemblyai';
import { useQuery } from 'convex/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useRef} from 'react'
import RecordRTC from 'recordrtc';


function DiscussionRoom() {
  const {roomId} = useParams();
  const RoomData=useQuery(api.DiscussionRoom.GetRoom,{id:roomId});
  const [expert,setExpert]=useState();
  const[enableMic,setEnableMic]=useState(false)
  const recorder=useRef(null)
  const realtimeTranscriber=useRef(null)

  let silenceTimeout


  useEffect(()=>{
    if (RoomData) {
      const Expert=Experts.find(item=>item.name==RoomData.Assistant)
      console.log(Expert)
      setExpert(Expert) 
      
    }
  },[RoomData])


  const connectToServer=()=>{
    setEnableMic(true)

    //Initalizing Assembly AI
    realtimeTranscriber.current=new RealtimeTranscriber({
      token:'',
      sampleRate:16_000
    })
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            recorder.current = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm;codecs=pcm',
                recorderType: RecordRTC.StereoAudioRecorder,
                timeSlice: 250,
                desiredSampleRate: 16000,
                numberOfAudioChannels: 1,
                bufferSize: 4096,
                audioBitsPerSecond: 128000,
                ondataavailable: async (blob) => {
                    // if (!realtimeTranscriber.current) return;
                    
                    // Reset the silence detection timer on audio input
                    clearTimeout(silenceTimeout);
                    const buffer = await blob.arrayBuffer();

                    // Restart the silence detection timer
                    silenceTimeout = setTimeout(() => {
                        console.log("User stopped talking");
                        // Handle user stopped talking (e.g., send final transcript, stop recording, etc.)
                    }, 2000);
                },
            });
            recorder.current.startRecording();
        })
        .catch((error) => {
            console.error("Error accessing microphone:", error);
        });
}
  }

  const disconnect=(e)=>{
    e.preventDefault()

    recorder.current.pauseRecording()
    recorder.current=null
    setEnableMic(false)
  }

    return (
    <div className='-mt-12'>
      <h2 className='text-lg font-bold'>{RoomData?.Option}</h2>
      <div className='mt-7 grid grid-cols-1 lg:grid-cols-3 gap-10'>
        <div className='lg:col-span-2'>
        <div className='lg:col-span-2 h-[70vh] bg-secondary border rounded-3xl flex flex-col items-center justify-center relative'>
          {expert && expert.avatar && (
            <Image src={expert.avatar} alt='Avatar' height={200} width={200}
            className='rounded-full h-[100px] w-[100px] object-cover animate-pulse' />
          )}
          <h2 className='font-mono text-gray-500'>{expert?.name}</h2>
          <div className='p-7 bg-gray-300 px-15 rounded-lg absolute bottom-5 right-5'>
            <UserButton/>
          </div>
        </div>
        <div className='mt-5 flex items-center justify-center'>
          {!enableMic ?<Button onClick={connectToServer} className={'bg-sky-500'}>Connect</Button>
          :
          <Button variant="destructive" onClick={disconnect} >Disconnect</Button>}
        </div>
        </div>
       <div className='relative'>
          <div className='h-[70vh] w-[400px] bg-secondary border rounded-3xl flex flex-col items-center justify-center relative'>
            <h2 className='font-semibold'>Interaction Section</h2>
          </div>
          <div className="mt-2 flex justify-center">
            <div className="tooltip absolute -right-65">
              <button className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </button>
              <span className="tooltiptext">We will record and give you back your conversation at the end of the meet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiscussionRoom