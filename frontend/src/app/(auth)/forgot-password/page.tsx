"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // API call to forgot password endpoint
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      setIsSubmitted(true);
      toast.success("Password reset link has been sent to your email!");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white p-12 flex-col justify-between">
          <div className="flex items-center space-x-3 mb-8">
            <Mail className="h-10 w-10" />
            <span className="text-2xl font-bold">University Event Portal</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Check Your Email
            </h1>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              We've sent you a password reset link to your email address
            </p>
            
            <div className="bg-blue-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">What happens next?</h3>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Check your email inbox</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Click the reset link in the email</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Create a new password</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Sign in with your new password</span>
                </li>
              </ul>
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
              <Mail className="h-8 w-8 text-blue-900" />
              <span className="text-xl font-bold text-blue-900">University Event Portal</span>
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Email Sent!
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  We've sent a password reset link to
                </CardDescription>
                <p className="text-center font-medium text-blue-900">{email}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Didn't receive the email?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check your spam folder</li>
                    <li>• Make sure the email address is correct</li>
                    <li>• Wait a few minutes and try again</li>
                  </ul>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Try Different Email
                  </Button>
                  
                  <Link href="/auth/login">
                    <Button className="w-full bg-blue-900 hover:bg-blue-800">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white p-12 flex-col justify-between">
        <div className="flex items-center space-x-3 mb-8">
          <Mail className="h-10 w-10" />
          <span className="text-2xl font-bold">University Event Portal</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Reset Your Password
          </h1>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            We'll send you a link to reset your password and regain access to your account
          </p>
          
          <div className="space-y-6">
            <div className="bg-blue-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Password Reset Process</h3>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Enter your university email address</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Check your email for reset link</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Create a new secure password</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Access your account again</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-blue-200 text-sm">
          © 2024 University Event Portal. All rights reserved.
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <Mail className="h-8 w-8 text-blue-900" />
            <span className="text-xl font-bold text-blue-900">University Event Portal</span>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                No worries! Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="university.email@edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter your university email address associated with your account
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="pt-4">
              <div className="text-center text-sm text-gray-600 w-full">
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardFooter>
          </Card>
          
          {/* Mobile Hero Section */}
          <div className="lg:hidden mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Password Recovery
            </h3>
            <p className="text-sm text-gray-600">
              We'll help you regain access to your account securely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
