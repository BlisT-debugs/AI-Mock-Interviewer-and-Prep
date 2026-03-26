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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image'
import { Experts } from '@/services/Options'
import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { LoaderCircle, UploadCloud } from 'lucide-react'
import { useRouter } from 'next/navigation'

function UserInputDialog({ children, options }) {
    const isMockInterview = options?.name === 'Mock Interviews';
    const router = useRouter();
    const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateRoom);

    // Standard States
    const [selectedExpert, setSelectedExpert] = useState();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    // New Mock Interview States
    const [resumeFile, setResumeFile] = useState(null);
    const [jdFile, setJdFile] = useState(null);
    const [jdText, setJdText] = useState('');
    const [role, setRole] = useState('');
    const [industry, setIndustry] = useState('');

    // Helper to parse PDF via our new API route
    const parsePDF = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.text;
    }

    const onClickNext = async () => {
        setLoading(true);
        try {
            let finalResumeText = "";
            let finalJdText = jdText;

            // If it's a mock interview, we MUST parse the PDFs first
            if (isMockInterview) {
                if (resumeFile) {
                    finalResumeText = await parsePDF(resumeFile);
                }
                if (jdFile) {
                    finalJdText = await parsePDF(jdFile);
                }
            }

            const result = await createDiscussionRoom({
                Topic: isMockInterview ? (role || "General Interview") : topic,
                Option: options?.name,
                Assistant: selectedExpert,
                resumeText: finalResumeText,
                jdText: finalJdText,
                role: role,
                industry: industry
            });

            setOpenDialog(false);
            router.push('/DiscussionRoom/' + result);
        } catch (error) {
            console.error("Failed to start session:", error);
            alert("Failed to process files. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // Validation: Require Topic for normal mode. Require Resume for Mock mode.
    const isReady = isMockInterview 
        ? (resumeFile && selectedExpert && !loading) 
        : (topic && selectedExpert && !loading);

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            
            <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {options.name}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="mt-4 space-y-6">
                            
                            {/* --- CONDITIONAL RENDERING BASED ON MODE --- */}
                            {!isMockInterview ? (
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                                        Which topic do you want to cover today?
                                    </h2>
                                    <Textarea 
                                        placeholder="E.g., React Hooks, Python Basics, Advanced C++..." 
                                        className="min-h-[100px] bg-gray-50 dark:bg-gray-800"
                                        onChange={(e) => setTopic(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Resume Upload (Required) */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-900 dark:text-gray-200 font-semibold flex items-center gap-2">
                                                Resume (Required) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                type="file" 
                                                accept=".pdf" 
                                                onChange={(e) => setResumeFile(e.target.files[0])}
                                                className="cursor-pointer file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-blue-100"
                                            />
                                        </div>

                                        {/* JD Upload (Optional) */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-900 dark:text-gray-200 font-semibold">
                                                Job Description PDF (Optional)
                                            </Label>
                                            <Input 
                                                type="file" 
                                                accept=".pdf" 
                                                onChange={(e) => setJdFile(e.target.files[0])}
                                                className="cursor-pointer file:bg-gray-100 file:text-gray-700 file:border-0 file:rounded-md file:px-4 file:py-1"
                                            />
                                        </div>
                                    </div>

                                    {/* JD Text Fallback */}
                                    {!jdFile && (
                                        <div className="space-y-2">
                                            <Label className="text-gray-900 dark:text-gray-200 font-semibold text-xs text-muted-foreground">
                                                Or paste the Job Description text here:
                                            </Label>
                                            <Textarea 
                                                placeholder="Paste the requirements, responsibilities, etc..." 
                                                className="min-h-[80px]"
                                                onChange={(e) => setJdText(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {/* Role & Industry (If no JD provided) */}
                                    {(!jdFile && !jdText) && (
                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <div className="space-y-2">
                                                <Label className="text-gray-900 dark:text-gray-200 font-semibold text-sm">Target Role</Label>
                                                <Input placeholder="e.g. Frontend Developer" onChange={(e) => setRole(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-900 dark:text-gray-200 font-semibold text-sm">Industry</Label>
                                                <Input placeholder="e.g. Fintech, Healthcare" onChange={(e) => setIndustry(e.target.value)} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* --- EXPERT SELECTION --- */}
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3 text-center">
                                    Select your Interviewer
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

                            {/* --- ACTION BUTTONS --- */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                                <DialogClose asChild>
                                    <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button 
                                    disabled={!isReady} 
                                    onClick={onClickNext}
                                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                >
                                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin mr-2"/> : null}
                                    {loading ? (isMockInterview ? 'Analyzing...' : 'Starting...') : 'Let\'s Go'}
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