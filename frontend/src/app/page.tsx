"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  University, 
  Calendar, 
  Users, 
  Award, 
  Building, 
  MapPin, 
  Clock, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  GraduationCap,
  Briefcase,
  Handshake
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <University className="h-8 w-8 text-blue-900" />
              <span className="text-xl font-bold text-blue-900">University Event Portal</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-900 font-medium">
                Features
              </a>
              <a href="#events" className="text-gray-700 hover:text-blue-900 font-medium">
                Events
              </a>
              <a href="#colleges" className="text-gray-700 hover:text-blue-900 font-medium">
                Colleges
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-900 font-medium">
                About
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <a href="/auth/login">
                <Button variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50">
                  Sign In
                </Button>
              </a>
              <a href="/auth/register">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                  Sign Up
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 bg-blue-100 text-blue-900 border-blue-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                Join 10,000+ Students
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Discover Events Across
                <span className="text-blue-900"> University Colleges</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect, collaborate, and participate in exciting events happening across all university colleges. 
                From academic workshops to cultural festivals, find everything in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/auth/register">
                  <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="/auth/login">
                  <Button size="lg" variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50 px-8 py-3">
                    Sign In to Explore
                  </Button>
                </a>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-8 mt-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Free to join</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Instant access</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-700/50 rounded-lg p-4">
                    <Calendar className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">500+ Events</h3>
                    <p className="text-sm text-blue-100">Monthly</p>
                  </div>
                  <div className="bg-blue-700/50 rounded-lg p-4">
                    <Users className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">10,000+</h3>
                    <p className="text-sm text-blue-100">Active Students</p>
                  </div>
                  <div className="bg-blue-700/50 rounded-lg p-4">
                    <Building className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">15+</h3>
                    <p className="text-sm text-blue-100">Colleges</p>
                  </div>
                  <div className="bg-blue-700/50 rounded-lg p-4">
                    <Award className="h-8 w-8 mb-2" />
                    <h3 className="font-semibold">4.8/5</h3>
                    <p className="text-sm text-blue-100">User Rating</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-blue-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100">Upcoming Events Today</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <Button variant="secondary" size="sm" className="bg-white text-blue-900 hover:bg-blue-50">
                      View All Events
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Event Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides comprehensive tools for students, organizers, and administrators 
              to manage and participate in university events seamlessly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-blue-900" />
                </div>
                <CardTitle className="text-xl">Event Discovery</CardTitle>
                <CardDescription>
                  Browse and discover events happening across all university colleges with advanced filtering and search capabilities.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-900" />
                </div>
                <CardTitle className="text-xl">Easy Registration</CardTitle>
                <CardDescription>
                  Register for events instantly with secure payment processing and receive digital tickets with QR codes.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-purple-900" />
                </div>
                <CardTitle className="text-xl">Event Management</CardTitle>
                <CardDescription>
                  Organizers can create, manage, and promote events with comprehensive analytics and attendee tracking.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-orange-900" />
                </div>
                <CardTitle className="text-xl">College Collaboration</CardTitle>
                <CardDescription>
                  Connect with other colleges for collaborative events and expand your network across the university system.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-red-900" />
                </div>
                <CardTitle className="text-xl">Venue Management</CardTitle>
                <CardDescription>
                  Find and book suitable venues for your events with real-time availability and scheduling features.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-indigo-900" />
                </div>
                <CardTitle className="text-xl">Real-time Updates</CardTitle>
                <CardDescription>
                  Stay informed with instant notifications about event updates, cancellations, and important announcements.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="colleges" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Join As Your Role
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a student, event organizer, or administrator, we have the right tools for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-900" />
                </div>
                <CardTitle className="text-xl">Student</CardTitle>
                <CardDescription>
                  Discover and register for events, track your participation, and connect with peers.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-green-900" />
                </div>
                <CardTitle className="text-xl">Event Organizer</CardTitle>
                <CardDescription>
                  Create and manage events, track attendance, and analyze event performance.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-purple-900" />
                </div>
                <CardTitle className="text-xl">College Admin</CardTitle>
                <CardDescription>
                  Approve events, manage college resources, and oversee institutional activities.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="h-8 w-8 text-orange-900" />
                </div>
                <CardTitle className="text-xl">External Partner</CardTitle>
                <CardDescription>
                  Collaborate on events, sponsor activities, and engage with the university community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <a href="/auth/register">
              <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3">
                Join Your Community Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-200">Partner Colleges</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Monthly Events</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-200">Event Registrations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to Join the University Event Community?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Sign up now and start discovering amazing events happening across your university.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/register">
              <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="/auth/login">
              <Button size="lg" variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50 px-8 py-3">
                Sign In
              </Button>
            </a>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mt-8">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Free forever for students</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">No setup required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <University className="h-8 w-8" />
                <span className="text-xl font-bold">University Event Portal</span>
              </div>
              <p className="text-gray-400">
                Connecting students and organizers across university colleges for memorable events and experiences.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/events" className="hover:text-white">Events</a></li>
                <li><a href="/colleges" className="hover:text-white">Colleges</a></li>
                <li><a href="/organizers" className="hover:text-white">Organizers</a></li>
                <li><a href="/about" className="hover:text-white">About</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Get Started</h3>
              <div className="space-y-3">
                <a href="/auth/register">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </a>
                <a href="/auth/login">
                  <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800">
                    Sign In
                  </Button>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 University Event Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
