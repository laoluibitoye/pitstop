'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Users, 
  Zap, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  Star,
  TrendingUp,
  Clock,
  Target,
  Laptop,
  Brain,
  Sparkles,
  Shield,
  Globe,
  Headphones
} from 'lucide-react'

const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

const AnimatedIcon = ({ icon: Icon, delay = 0 }: { icon: any, delay?: number }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, delay }}
      className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center"
    >
      <Icon className="h-8 w-8 text-white" />
    </motion.div>
  )
}

const ProgressBar = ({ step, total, label }: { step: number, total: number, label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-3"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5, delay: step * 0.2 }}
        viewport={{ once: true }}
      >
        {step}
      </motion.div>
      <h4 className="text-lg font-semibold text-primary-900 dark:text-dark-text mb-2">{label}</h4>
      <motion.div
        className="h-1 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 1, delay: step * 0.3 }}
        viewport={{ once: true }}
      >
        <div className="h-full bg-gradient-primary rounded-full"></div>
      </motion.div>
    </div>
  )
}

const UseCaseCard = ({ 
  title, 
  description, 
  icon: Icon, 
  features, 
  delay = 0 
}: { 
  title: string, 
  description: string, 
  icon: any, 
  features: string[], 
  delay?: number 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="neo-card p-8 bg-white/50 dark:bg-dark-card/50 cursor-pointer"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl mb-6">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-primary-900 dark:text-dark-text mb-3">{title}</h3>
      <p className="text-primary-600 dark:text-primary-300 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-primary-600 dark:text-primary-300">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

const ComparisonItem = ({ title, pitstop, competitor }: { title: string, pitstop: string, competitor: string }) => {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-primary-200 dark:border-primary-700">
      <div className="text-primary-900 dark:text-dark-text font-medium">{title}</div>
      <div className="text-green-600 font-semibold flex items-center">
        <CheckCircle className="h-4 w-4 mr-1" />
        {pitstop}
      </div>
      <div className="text-red-500">Limited/Paid</div>
    </div>
  )
}

export default function Home() {
  useEffect(() => {
    // Smooth scroll behavior
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.hash) {
        e.preventDefault()
        const element = document.querySelector(target.hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    document.addEventListener('click', handleSmoothScroll)
    return () => document.removeEventListener('click', handleSmoothScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-blue-50 dark:from-dark-bg dark:via-primary-900 dark:to-dark-bg">
      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "PitStop",
            "description": "Free collaborative task management application with real-time synchronization and premium design",
            "applicationCategory": "ProductivityApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "1000"
            }
          })
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-primary-200/50 dark:border-primary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold text-primary-900 dark:text-dark-text">PitStop</h1>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                100% FREE
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-primary-600 hover:text-primary-900 dark:text-primary-300 dark:hover:text-dark-text transition-colors">Features</a>
              <a href="#how-it-works" className="text-primary-600 hover:text-primary-900 dark:text-primary-300 dark:hover:text-dark-text transition-colors">How It Works</a>
              <a href="#use-cases" className="text-primary-600 hover:text-primary-900 dark:text-primary-300 dark:hover:text-dark-text transition-colors">Use Cases</a>
              <a href="#why-choose" className="text-primary-600 hover:text-primary-900 dark:text-primary-300 dark:hover:text-dark-text transition-colors">Why Choose</a>
            </nav>
            <div className="flex space-x-4">
              <button className="neo-button px-4 py-2 text-sm">
                Sign In
              </button>
              <button className="neo-button px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600">
                Start Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <FadeInSection delay={0.1}>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold mb-8">
                <Sparkles className="h-4 w-4 mr-2" />
                Completely Free Forever • No Hidden Costs
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.2}>
              <h1 className="text-5xl md:text-7xl font-bold text-primary-900 dark:text-dark-text mb-6 leading-tight">
                The Ultimate
                <span className="text-gradient block">Task Collaboration</span>
                Platform
              </h1>
            </FadeInSection>
            
            <FadeInSection delay={0.3}>
              <p className="text-xl md:text-2xl text-primary-600 dark:text-primary-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Streamline your team's productivity with real-time collaborative task management. 
                <strong className="text-primary-900 dark:text-dark-text"> Completely free</strong> with premium features, 
                cross-platform accessibility, and intuitive workflow management.
              </p>
            </FadeInSection>

            <FadeInSection delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button className="neo-button px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105">
                  Start Managing Tasks Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="neo-button px-8 py-4 text-lg font-semibold">
                  Try Guest Mode
                </button>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.5}>
              <div className="flex justify-center items-center space-x-8 text-sm text-primary-600 dark:text-primary-300">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  No Credit Card Required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Setup in 30 Seconds
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Free Forever
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white/50 dark:bg-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-dark-text mb-6">
                Powerful Features for 
                <span className="text-gradient">Modern Teams</span>
              </h2>
              <p className="text-xl text-primary-600 dark:text-primary-300 max-w-3xl mx-auto">
                Everything you need to collaborate effectively, manage tasks efficiently, and boost team productivity
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FadeInSection delay={0.1}>
              <div className="text-center">
                <AnimatedIcon icon={Users} delay={0.2} />
                <h3 className="text-xl font-semibold text-primary-900 dark:text-dark-text mb-3">Real-Time Collaboration</h3>
                <p className="text-primary-600 dark:text-primary-300">See live updates as your team works. Instant synchronization across all devices.</p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="text-center">
                <AnimatedIcon icon={Zap} delay={0.3} />
                <h3 className="text-xl font-semibold text-primary-900 dark:text-dark-text mb-3">Intuitive Workflows</h3>
                <p className="text-primary-600 dark:text-primary-300">Drag-and-drop task management with smart automation and custom workflows.</p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.3}>
              <div className="text-center">
                <AnimatedIcon icon={Smartphone} delay={0.4} />
                <h3 className="text-xl font-semibold text-primary-900 dark:text-dark-text mb-3">Cross-Platform Access</h3>
                <p className="text-primary-600 dark:text-primary-300">Work seamlessly on web, mobile, and desktop with full feature parity.</p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.4}>
              <div className="text-center">
                <AnimatedIcon icon={TrendingUp} delay={0.5} />
                <h3 className="text-xl font-semibold text-primary-900 dark:text-dark-text mb-3">Advanced Analytics</h3>
                <p className="text-primary-600 dark:text-primary-300">Track team performance, project progress, and identify bottlenecks instantly.</p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-dark-text mb-6">
                Get Started in
                <span className="text-gradient">3 Simple Steps</span>
              </h2>
              <p className="text-xl text-primary-600 dark:text-primary-300 max-w-3xl mx-auto">
                From sign-up to productivity boost - your journey to better team collaboration starts here
              </p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-12">
            <FadeInSection delay={0.1}>
              <div className="text-center">
                <ProgressBar step={1} total={3} label="Sign Up Free" />
                <div className="mt-8 p-6 neo-card bg-white/50 dark:bg-dark-card/50">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-primary-600 dark:text-primary-300">
                    Create your account in seconds. No credit card required, no setup fees. Start collaborating immediately.
                  </p>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="text-center">
                <ProgressBar step={2} total={3} label="Create & Collaborate" />
                <div className="mt-8 p-6 neo-card bg-white/50 dark:bg-dark-card/50">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-primary-600 dark:text-primary-300">
                    Design your workflows, assign tasks, and watch your team collaborate in real-time with instant updates.
                  </p>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.3}>
              <div className="text-center">
                <ProgressBar step={3} total={3} label="Track Progress" />
                <div className="mt-8 p-6 neo-card bg-white/50 dark:bg-dark-card/50">
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-primary-600 dark:text-primary-300">
                    Monitor progress, generate insights, and optimize your team's productivity with advanced analytics.
                  </p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 bg-white/50 dark:bg-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-dark-text mb-6">
                Perfect for Every
                <span className="text-gradient">Workflow</span>
              </h2>
              <p className="text-xl text-primary-600 dark:text-primary-300 max-w-3xl mx-auto">
                Whether you're managing a team, collaborating with clients, or organizing personal projects
              </p>
            </div>
          </FadeInSection>

          <div className="grid lg:grid-cols-3 gap-8">
            <UseCaseCard
              title="Team Project Management"
              description="Coordinate complex projects with multiple stakeholders, deadlines, and deliverables."
              icon={Users}
              features={[
                "Real-time task synchronization",
                "Team member assignment",
                "Progress tracking & reporting",
                "Milestone management"
              ]}
              delay={0.1}
            />

            <UseCaseCard
              title="Freelance Client Collaboration"
              description="Keep clients updated and maintain transparency throughout project delivery."
              icon={Laptop}
              features={[
                "Client access controls",
                "Transparent progress updates",
                "File sharing & comments",
                "Invoice-ready time tracking"
              ]}
              delay={0.2}
            />

            <UseCaseCard
              title="Personal Productivity"
              description="Organize your personal tasks, goals, and daily routines with smart automation."
              icon={Brain}
              features={[
                "Personal task automation",
                "Goal setting & tracking",
                "Habit formation tools",
                "Productivity analytics"
              ]}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Why Choose PitStop Section */}
      <section id="why-choose" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-dark-text mb-6">
                Why Teams Choose
                <span className="text-gradient">PitStop</span>
              </h2>
              <p className="text-xl text-primary-600 dark:text-primary-300 max-w-3xl mx-auto">
                We're not just another task manager - we're the complete solution for modern team collaboration
              </p>
            </div>
          </FadeInSection>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInSection delay={0.1}>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-900 dark:text-dark-text mb-2">100% Free Forever</h3>
                    <p className="text-primary-600 dark:text-primary-300">No hidden costs, no premium tiers, no feature limitations. Everything is included for free.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-900 dark:text-dark-text mb-2">Cross-Platform Ready</h3>
                    <p className="text-primary-600 dark:text-primary-300">Works seamlessly on any device, any platform, with full feature synchronization.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-900 dark:text-dark-text mb-2">24/7 Support</h3>
                    <p className="text-primary-600 dark:text-primary-300">Get help when you need it with our responsive support team and comprehensive documentation.</p>
                  </div>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="neo-card p-8 bg-white/50 dark:bg-dark-card/50">
                <h3 className="text-2xl font-bold text-primary-900 dark:text-dark-text mb-6 text-center">
                  PitStop vs. Competitors
                </h3>
                <div className="space-y-2">
                  <ComparisonItem title="Price" pitstop="Free" competitor="$10-50/month" />
                  <ComparisonItem title="Real-time Sync" pitstop="✓" competitor="Limited" />
                  <ComparisonItem title="Team Size" pitstop="Unlimited" competitor="5-50 users" />
                  <ComparisonItem title="Storage" pitstop="Unlimited" competitor="1-10GB" />
                  <ComparisonItem title="Support" pitstop="24/7" competitor="Email only" />
                  <ComparisonItem title="Mobile Apps" pitstop="✓" competitor="Premium only" />
                </div>
              </div>
            </FadeInSection>
          </div>

          {/* Social Proof */}
          <FadeInSection delay={0.3}>
            <div className="text-center mt-20">
              <div className="flex justify-center items-center space-x-8 mb-8">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-primary-600 dark:text-primary-300">4.9/5 from 1,000+ reviews</span>
              </div>
              <p className="text-lg text-primary-600 dark:text-primary-300 max-w-2xl mx-auto">
                "PitStop transformed how our team collaborates. The real-time features and intuitive design made adoption instant. Best of all - it's completely free!"
              </p>
              <p className="text-sm text-primary-500 dark:text-primary-400 mt-2">- Sarah Johnson, Project Manager at TechFlow</p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Team's Productivity?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using PitStop to streamline their workflows and boost collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors transform hover:scale-105">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors">
                View Demo
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-4">
              No credit card required • Setup in 30 seconds • Free forever
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 dark:bg-dark-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <h3 className="text-xl font-bold">PitStop</h3>
              </div>
              <p className="text-primary-300 text-sm">
                The ultimate free collaborative task management platform for modern teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-primary-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-primary-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-primary-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-300 text-sm">
              © 2025 PitStop. All rights reserved. Made with ❤️ for productive teams worldwide.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-primary-300 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-primary-300 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}