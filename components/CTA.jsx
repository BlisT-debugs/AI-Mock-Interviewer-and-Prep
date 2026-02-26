"use client";

import { Button } from './ui/button';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 md:p-16 shadow-2xl"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-10">
              Join us and transform your interview skills with our AI coaches.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100 group shadow-xl"
            >
              Start Practicing Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
