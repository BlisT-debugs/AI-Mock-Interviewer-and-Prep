"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Mic, Cpu, LineChart, Shield, Zap, Layout, CheckCircle2 } from "lucide-react";
import AppHeader from "./(main)/_components/AppHeader";
import { UserButton } from "@stackframe/stack";
import { LiveChat } from "@/components/LiveChat";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/footer";
import { CTA } from "@/components/CTA";




export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header />
      
    
        <Hero />

        {/* Features Section */}
        <Features />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <CTA />
      

      <Footer />
      <LiveChat />
    </div>
  );
}