"use client";

import Link from "next/link";

import { Mic, MonitorPlay, MessageSquareQuote } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: Mic,
    title: 'Natural Voice Conversations',
    description: 'Speak naturally with AI experts that understand and respond to your questions in real-time.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MonitorPlay,
    title: 'Domain-Specific Experts',
    description: 'Choose from specialized AI coaches for tech, business, healthcare, and more.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: MessageSquareQuote,
    title: 'Personalized Feedback',
    description: 'Get tailored suggestions to improve your answers and communication skills.',
    gradient: 'from-orange-500 to-red-500',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-white dark:bg-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-white">
            Why Choose Our AI Assistant
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Experience the future of interview preparation with cutting-edge AI technology
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative element */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity -z-10`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}