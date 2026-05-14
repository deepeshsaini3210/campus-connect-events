"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Calendar, Users, Award, Building } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const type = searchParams.get('type') || 'registration';
  const [redirectPath, setRedirectPath] = useState('/auth/login');

  useEffect(() => {
    // Set redirect path based on success type
    switch (type) {
      case 'registration':
        setRedirectPath('/auth/login');
        break;
      case 'password-reset':
        setRedirectPath('/auth/login');
        break;
      case 'email-verified':
        setRedirectPath('/auth/login');
        break;
      case 'profile-complete':
        setRedirectPath('/dashboard');
        break;
      default:
        setRedirectPath('/auth/login');
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [type, redirectPath, router]);

  const getSuccessContent = () => {
    switch (type) {
      case 'registration':
        return {
          title: "Registration Successful!",
          description: "Your account has been created successfully. Please check your email to verify your account.",
          icon: CheckCircle,
          color: "green",
          features: [
            "Account created successfully",
            "Email verification sent",
            "Ready to discover events",
            "Connect with community"
          ]
        };
      case 'password-reset':
        return {
          title: "Password Reset Successful!",
          description: "Your password has been reset successfully. You can now sign in with your new password.",
          icon: CheckCircle,
          color: "blue",
          features: [
            "Password updated successfully",
            "Secure login enabled",
            "Account access restored",
            "Ready to continue"
          ]
        };
      case 'email-verified':
        return {
          title: "Email Verified Successfully!",
          description: "Your email has been verified and your account is now active. Welcome to the University Event Portal!",
          icon: CheckCircle,
          color: "green",
          features: [
            "Email verification complete",
            "Account activated",
            "Full access enabled",
            "Ready to explore events"
          ]
        };
      case 'profile-complete':
        return {
          title: "Profile Completed!",
          description: "Your profile has been set up successfully. You're all ready to start exploring events!",
          icon: CheckCircle,
          color: "purple",
          features: [
            "Profile setup complete",
            "Personalization enabled",
            "Event recommendations ready",
            "Community access granted"
          ]
        };
      default:
        return {
          title: "Success!",
          description: "Your action has been completed successfully.",
          icon: CheckCircle,
          color: "green",
          features: [
            "Action completed",
            "System updated",
            "Ready to continue",
            "All set"
          ]
        };
    }
  };

  const content = getSuccessContent();
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white p-12 flex-col justify-between">
        <div className="flex items-center space-x-3 mb-8">
          <Building className="h-10 w-10" />
          <span className="text-2xl font-bold">University Event Portal</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Welcome Aboard!
          </h1>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            You're now part of our vibrant university event community
          </p>
          
          <div className="space-y-6">
            <div className="bg-blue-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">What You Can Do Now:</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-200" />
                  <div>
                    <h4 className="font-medium">Discover Events</h4>
                    <p className="text-sm text-blue-100">Browse events across all university colleges</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-200" />
                  <div>
                    <h4 className="font-medium">Connect & Network</h4>
                    <p className="text-sm text-blue-100">Meet students and event organizers</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-blue-200" />
                  <div>
                    <h4 className="font-medium">Register & Participate</h4>
                    <p className="text-sm text-blue-100">Easy event registration and management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-blue-200 text-sm">
          © 2024 University Event Portal. All rights reserved.
        </div>
      </div>

      {/* Right Side - Success Message */}
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <Building className="h-8 w-8 text-blue-900" />
            <span className="text-xl font-bold text-blue-900">University Event Portal</span>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <div className={`w-16 h-16 bg-${content.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`h-8 w-8 text-${content.color}-600`} />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                {content.title}
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {content.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">✨ What's Next?</h4>
                <ul className="space-y-2">
                  {content.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">Auto-redirecting...</h4>
                    <p className="text-sm text-blue-700">
                      You'll be redirected in {countdown} seconds
                    </p>
                  </div>
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-4 space-y-3">
              <Link href={redirectPath} className="w-full">
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium">
                  Continue to {type === 'profile-complete' ? 'Dashboard' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              {type === 'registration' && (
                <div className="text-center text-sm text-gray-600">
                  <p>Need help? <Link href="/support" className="text-blue-600 hover:text-blue-800">Contact Support</Link></p>
                </div>
              )}
            </CardFooter>
          </Card>
          
          {/* Mobile Hero Section */}
          <div className="lg:hidden mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start Your Event Journey
            </h3>
            <p className="text-sm text-gray-600">
              Explore exciting events and connect with the university community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
