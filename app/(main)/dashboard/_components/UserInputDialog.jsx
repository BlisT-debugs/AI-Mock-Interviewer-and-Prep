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
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

function UserInputDialog({ children, options }) {
    const [selectedExpert, setSelectedExpert] = useState();
    const [Topic, setTopic] = useState();
    const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateRoom);
    const [loading, setloading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const router = useRouter();

    const onClickNext = async () => {
        setloading(true);
        const result = await createDiscussionRoom({
            Topic: Topic,
            Option: options?.name,
            Assistant: selectedExpert
        })
        console.log(result)
        setloading(false);
        setOpenDialog(false);
        router.push('/DiscussionRoom/' + result)
    }

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            
            {/* Removed the hardcoded blue bg, replaced with theme-aware styling */}
            <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {options.name}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="mt-4 space-y-6">
                            
                            {/* Topic Input Section */}
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                                    Which topic do you want to cover today?
                                </h2>
                                <Textarea 
                                    placeholder="Waiting patiently for your reply 😊..." 
                                    className="min-h-[100px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500"
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>
                            
                            {/* Expert Selection Section */}
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3 text-center">
                                    Select your Learning Assistant
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {Experts.map((expert, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => setSelectedExpert(expert.name)} 
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                                selectedExpert === expert.name 
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 shadow-sm transform scale-105' 
                                                : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <Image 
                                                src={expert.avatar} 
                                                alt={expert.name} 
                                                width={64} 
                                                height={64} 
                                                className="rounded-full object-cover mb-2 drop-shadow-sm" 
                                            />
                                            <h2 className={`text-xs font-medium text-center ${
                                                selectedExpert === expert.name ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                                {expert.name}
                                            </h2>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                                <DialogClose asChild>
                                    <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button 
                                    disabled={!Topic || !selectedExpert || loading} 
                                    onClick={onClickNext}
                                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                                >
                                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin mr-2"/> : null}
                                    {loading ? 'Starting...' : 'Let\'s Go'}
                                </Button>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default UserInputDialog