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




export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header />
      
      <main>
        <Hero />

        {/* Features Section */}
        <Features />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <section className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Ace Your Next Interview?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join us and transform your interview skills with our AI coaches.
          </p>
          <Link href="/dashboard">
            <Button className="px-8 py-6 text-lg bg-white text-blue-600 hover:bg-gray-100">
              Start Practicing Now
            </Button>
          </Link>
        </section>
      </main>

      <Footer />
      <LiveChat />
    </div>
  );
}