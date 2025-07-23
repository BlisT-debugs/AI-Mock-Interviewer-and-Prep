import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import AppHeader from "./(main)/_components/AppHeader";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-12 md:py-24">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered <span className="text-blue-600">Interview Coach</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
            Practice with expert AI assistants, get real-time feedback, and ace your next interview.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <Button className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 transition-all">
                Get Started - It's Free
              </Button>
            </Link>
            <Link href="#features" >
              <Button variant="outline" className="px-8 py-6 text-lg border-blue-600 text-blue-600 hover:bg-blue-50">
                Learn More
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mb-24 pt-20 -mt-20">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Our AI Assistant</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Image 
                  src="/mic.svg" 
                  alt="Voice Interaction" 
                  width={32} 
                  height={32} 
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Natural Voice Conversations</h3>
              <p className="text-gray-600">
                Speak naturally with AI experts that understand and respond to your questions in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Image 
                  src="/expert.svg" 
                  alt="Expert Coaches" 
                  width={32} 
                  height={32} 
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Domain-Specific Experts</h3>
              <p className="text-gray-600">
                Choose from specialized AI coaches for tech, business, healthcare, and more.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Image 
                  src="/feedback.svg" 
                  alt="Instant Feedback" 
                  width={32} 
                  height={32} 
                />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalized Feedback</h3>
              <p className="text-gray-600">
                Get tailored suggestions to improve your answers and communication skills.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                {/* Replace with your actual demo video or image */}
                <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-lg font-medium">Product Demo</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Select Your Expert</h3>
                  <p className="text-gray-600">
                    Choose from our roster of AI specialists tailored to your interview needs.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Start Your Session</h3>
                  <p className="text-gray-600">
                    Connect your microphone and have a natural conversation with your AI coach.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Instant Feedback</h3>
                  <p className="text-gray-600">
                    Receive real-time analysis and suggestions to improve your performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah K.</h4>
                  <p className="text-gray-500 text-sm">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The AI technical interviewer helped me land my dream job at Google. The practice sessions were incredibly realistic!"
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael T.</h4>
                  <p className="text-gray-500 text-sm">Business Analyst</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "I was nervous about case interviews, but after 10 sessions with the McKinsey-style AI coach, I aced my final rounds."
              </p>
            </div>
          </div>
        </section>

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

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Go Ready</h3>
              <p className="text-gray-400">The smart way to prepare for interviews</p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">Terms</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © {new Date().getFullYear()} Go Ready. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
