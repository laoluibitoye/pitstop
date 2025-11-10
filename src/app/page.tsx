'use client'

import {
  Users,
  Zap,
  Smartphone,
  CheckCircle,
  Star,
  TrendingUp,
  Target,
  Brain,
  Shield,
  Globe,
  Headphones
} from 'lucide-react'
import { SignInButton } from '@/components/auth/sign-in-button'
import { SignUpButton } from '@/components/auth/sign-up-button'
import { GuestModeButton } from '@/components/guest/guest-mode-button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PitStop</h1>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                100% FREE
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">How It Works</a>
              <a href="#use-cases" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Use Cases</a>
              <a href="#why-choose" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Why Choose</a>
            </nav>
            <div className="flex space-x-4">
              <SignInButton />
              <SignUpButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold mb-8">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completely Free Forever • No Hidden Costs
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              The Ultimate
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Task Collaboration</span>
              Platform
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Streamline your team's productivity with real-time collaborative task management. 
              <strong className="text-gray-900 dark:text-white"> Completely free</strong> with premium features, 
              cross-platform accessibility, and intuitive workflow management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <SignUpButton className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl flex items-center justify-center transform hover:scale-105 transition-all" />
              <GuestModeButton className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-blue-600 px-8 py-4 text-lg font-semibold rounded-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all" />
            </div>

            <div className="flex justify-center items-center space-x-8 text-sm text-gray-600 dark:text-gray-300">
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Modern Teams</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to collaborate effectively, manage tasks efficiently, and boost team productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Real-Time Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300">See live updates as your team works. Instant synchronization across all devices.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Intuitive Workflows</h3>
              <p className="text-gray-600 dark:text-gray-300">Drag-and-drop task management with smart automation and custom workflows.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Cross-Platform Access</h3>
              <p className="text-gray-600 dark:text-gray-300">Work seamlessly on web, mobile, and desktop with full feature parity.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">Track team performance, project progress, and identify bottlenecks instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Get Started in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> 3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From sign-up to productivity boost - your journey to better team collaboration starts here
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto shadow-lg">
                  1
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sign Up Free</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create your account in seconds. No credit card required, no setup fees. Start collaborating immediately.
                </p>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto shadow-lg">
                  2
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create & Collaborate</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Design your workflows, assign tasks, and watch your team collaborate in real-time with instant updates.
                </p>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto shadow-lg">
                  3
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Track Progress</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Monitor progress, generate insights, and optimize your team's productivity with advanced analytics.
                </p>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Perfect for Every
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Workflow</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Whether you're managing a team, collaborating with clients, or organizing personal projects
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Team Project Management</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Coordinate complex projects with multiple stakeholders, deadlines, and deliverables.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time task synchronization
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Team member assignment
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Progress tracking & reporting
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Milestone management
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Freelance Client Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Keep clients updated and maintain transparency throughout project delivery.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Client access controls
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Transparent progress updates
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  File sharing & comments
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Invoice-ready time tracking
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Personal Productivity</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Organize your personal tasks, goals, and daily routines with smart automation.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Personal task automation
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Goal setting & tracking
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Habit formation tools
                </li>
                <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Productivity analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose PitStop Section */}
      <section id="why-choose" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Teams Choose
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> PitStop</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're not just another task manager - we're the complete solution for modern team collaboration
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">100% Free Forever</h3>
                    <p className="text-gray-600 dark:text-gray-300">No hidden costs, no premium tiers, no feature limitations. Everything is included for free.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cross-Platform Ready</h3>
                    <p className="text-gray-600 dark:text-gray-300">Works seamlessly on any device, any platform, with full feature synchronization.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
                    <p className="text-gray-600 dark:text-gray-300">Get help when you need it with our responsive support team and comprehensive documentation.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                PitStop vs. Competitors
              </h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-gray-900 dark:text-white font-medium">Price</div>
                  <div className="text-green-600 font-semibold flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Free
                  </div>
                  <div className="text-red-500">$10-50/month</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-gray-900 dark:text-white font-medium">Real-time Sync</div>
                  <div className="text-green-600 font-semibold flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    ✓
                  </div>
                  <div className="text-red-500">Limited</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-gray-900 dark:text-white font-medium">Team Size</div>
                  <div className="text-green-600 font-semibold flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Unlimited
                  </div>
                  <div className="text-red-500">5-50 users</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-gray-900 dark:text-white font-medium">Storage</div>
                  <div className="text-green-600 font-semibold flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Unlimited
                  </div>
                  <div className="text-red-500">1-10GB</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-gray-900 dark:text-white font-medium">Support</div>
                  <div className="text-green-600 font-semibold flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    24/7
                  </div>
                  <div className="text-red-500">Email only</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3">
                  <div className="text-gray-900 dark:text-white font-medium">Mobile Apps</div>
                  <div className="text-green-600 font-semibold flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    ✓
                  </div>
                  <div className="text-red-500">Premium only</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center mt-20">
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-300">4.9/5 from 1,000+ reviews</span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              "PitStop transformed how our team collaborates. The real-time features and intuitive design made adoption instant. Best of all - it's completely free!"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">- Sarah Johnson, Project Manager at TechFlow</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-white/20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Team's Productivity?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using PitStop to streamline their workflows and boost collaboration.
            </p>
            <div className="flex justify-center">
              <SignUpButton className="bg-white text-blue-600 font-bold text-lg px-8 py-4 rounded-xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-150 shadow-lg" />
            </div>
            <p className="text-blue-100 text-sm mt-4">
              No credit card required • Setup in 30 seconds • Free forever
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <h3 className="text-xl font-bold">PitStop</h3>
              </div>
              <p className="text-gray-400 text-sm">
                The ultimate free collaborative task management platform for modern teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 PitStop. All rights reserved. Made with ❤️ for productive teams worldwide.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
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