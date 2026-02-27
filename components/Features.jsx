"use client";

import { Mic, MonitorPlay, MessageSquareQuote, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: Mic,
    title: 'Natural Voice Conversations',
    description: 'Engage in realistic interview conversations with AI that understands context and provides meaningful responses.',
    gradient: 'from-blue-600 to-cyan-600',
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40',
  },
  {
    icon: MonitorPlay,
    title: 'Domain-Specific Experts',
    description: 'Access specialized AI coaches trained in technical, behavioral, and industry-specific interview formats.',
    gradient: 'from-indigo-600 to-purple-600',
    bgGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40',
  },
  {
    icon: MessageSquareQuote,
    title: 'Actionable Feedback',
    description: 'Receive detailed analysis and personalized recommendations to improve your communication and responses.',
    gradient: 'from-blue-600 to-indigo-700',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Key Features</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold mb-4 dark:text-white"
          >
            Advanced AI Interview Assistant
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-300"
          >
            Experience cutting-edge technology designed to elevate your interview preparation
          </motion.p>
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
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${feature.bgGradient} border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 h-full`}>
                {/* Icon */}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
