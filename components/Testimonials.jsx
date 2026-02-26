"use client";

import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Software Engineer',
    content: 'The AI technical interviewer helped me land my dream job at Google. The practice sessions were incredibly realistic!',
    rating: 5,
    avatar: 'SK',
  },
  {
    name: 'Michael T.',
    role: 'Business Analyst',
    content: 'I was nervous about case interviews, but after 10 sessions with the McKinsey-style AI coach, I aced my final rounds.',
    rating: 5,
    avatar: 'MT',
  },
  {
    name: 'Priya S.',
    role: 'Product Manager',
    content: 'The personalized feedback was game-changing. I improved my communication skills and confidence dramatically.',
    rating: 5,
    avatar: 'PS',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-32 bg-white dark:bg-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-white">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Join thousands of successful candidates who transformed their interview skills
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 h-full">
                {/* Quote Icon */}
                <div className="absolute -top-4 left-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
                    <Quote className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}