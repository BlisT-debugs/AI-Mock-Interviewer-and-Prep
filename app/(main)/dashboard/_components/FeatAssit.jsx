'use client'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { options } from '@/services/Options'
import { useUser } from '@stackframe/stack'
import Image from 'next/image'
import React from 'react'
import UserInputDialog from './UserInputDialog'

function FeatAssit() {
    const user = useUser()
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">My Workspace</h2>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
                        Welcome Back, <span className="text-blue-600">{user?.displayName}</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Select an assistant to get started</p>
                </div>
                {/* <Button variant="outline" className="px-6 py-3 border-gray-300 hover:bg-gray-50 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Profile Settings
                </Button> */}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {options.map((option, index) => (
                    <BlurFade key={option.icon} delay={0.25 + index * 0.05} inView>
                        <UserInputDialog options={option}>
                            <div className="group relative flex flex-col items-center justify-center p-6 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer h-full">
                                {/* Icon with gradient background */}
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                                    <div className="relative flex items-center justify-center bg-white rounded-full p-4 shadow-sm border border-gray-100 group-hover:border-blue-200 transition-all">
                                        <Image 
                                            src={option.icon} 
                                            alt={option.name} 
                                            width={80} 
                                            height={80} 
                                            className="h-12 w-12 object-contain"
                                        />
                                    </div>
                                </div>
                                
                                {/* Option Name */}
                                <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                                    {option.name}
                                </h3>
                                
                                {/* Description (if available) */}
                                {option.description && (
                                    <p className="text-sm text-gray-500 text-center line-clamp-2">
                                        {option.description}
                                    </p>
                                )}
                                
                                {/* Hover indicator */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </UserInputDialog>
                    </BlurFade>
                ))}
            </div>

            {/* Recent Activity Section (optional) */}
            <div className="mt-16">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <p className="text-gray-500 text-center">Your recent sessions will appear here</p>
                </div>
            </div>
        </div>
    )
}

export default FeatAssit