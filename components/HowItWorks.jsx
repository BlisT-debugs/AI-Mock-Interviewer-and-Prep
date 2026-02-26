"use client";
import { motion } from 'motion/react';
import { UserSearch, Mic2, TrendingUp, Play } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

const steps = [
  {
    number: 1,
    icon: UserSearch,
    title: 'Select Your Expert',
    description: 'Choose from our roster of AI specialists tailored to your interview needs.',
  },
  {
    number: 2,
    icon: Mic2,
    title: 'Start Your Session',
    description: 'Connect your microphone and have a natural conversation with your AI coach.',
  },
  {
    number: 3,
    icon: TrendingUp,
    title: 'Get Instant Feedback',
    description: 'Receive real-time analysis and personalized tips to improve your performance.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-white">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get started in three simple steps and transform your interview skills
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Video/Demo Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 hover:bg-white/30 transition-colors cursor-pointer group">
                  <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-white font-semibold">Product Demo</p>
              </div>

              {/* Floating cards animation */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg"
              >
                <div className="text-xs font-semibold text-gray-900 dark:text-white">AI Analysis</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Real-time feedback</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6"
              >
                {/* Number Badge */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-bold dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4"
            >   
                <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Try It Now - Free
              </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}