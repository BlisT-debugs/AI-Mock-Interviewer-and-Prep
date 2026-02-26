"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { motion } from 'motion/react';

const faqs = [
  {
    question: 'How does the AI interview coach work?',
    answer: 'Our AI coaches use advanced natural language processing to conduct realistic interview conversations. They listen to your responses, analyze your communication style, and provide personalized feedback based on industry best practices.',
  },
  {
    question: 'Is my data secure and private?',
    answer: 'Absolutely. We take privacy seriously. All your practice sessions are encrypted and stored securely. We never share your personal information or interview responses with third parties. You can delete your data at any time.',
  },
  {
    question: 'What types of interviews can I practice?',
    answer: 'We offer AI coaches for technical interviews (coding, system design), behavioral interviews, case interviews, product management interviews, and more. Each coach is trained on domain-specific knowledge and interview patterns.',
  },
  {
    question: 'Can I get feedback on my answers?',
    answer: 'Yes! After each session, you receive detailed feedback including strengths, areas for improvement, suggested talking points, and tips on body language and communication style. You can also review transcripts of your sessions.',
  },
  {
    question: 'How much does it cost?',
    answer: 'We offer a free plan with 3 practice sessions per month. Our Pro plan ($29/month) includes unlimited sessions, all expert coaches, detailed analytics, and personalized improvement plans. Enterprise plans are also available.',
  },
  {
    question: 'Do I need any special equipment?',
    answer: 'No special equipment needed! Just a device with a microphone and internet connection. Our platform works on desktop, laptop, and mobile devices. We recommend using headphones for the best experience.',
  },
  {
    question: 'Can I practice with a friend or mentor?',
    answer: 'While our AI coaches are designed for one-on-one practice, we offer a collaborative mode where you can share your session recordings and feedback reports with mentors or career coaches for additional guidance.',
  },
  {
    question: 'How realistic are the AI interviews?',
    answer: 'Our AI coaches are trained on thousands of real interview conversations and continuously updated with the latest interview trends. Users report that our sessions feel remarkably similar to actual interviews, helping them feel prepared and confident.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-32 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to know about Go Ready
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Still have questions?
          </p>
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Contact our support team →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
