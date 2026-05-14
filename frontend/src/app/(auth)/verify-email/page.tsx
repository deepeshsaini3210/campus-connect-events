"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/auth/register');
    }
  }, [email, router]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setError("");

    try {
      // API call to resend verification email
      const response = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      toast.success("Verification email has been resent!");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email. Please try again.");
      toast.error("Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsLoading(true);
    setError("");

    try {
      // API call to verify email
      const response = await fetch('/api/v1/auth/verify-email', {
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
        throw new Error(errorData.message || 'Email verification failed');
      }

      setIsVerified(true);
      toast.success("Email verified successfully!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Email verification failed. Please try again.");
      toast.error("Email verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-700 to-green-600 text-white p-12 flex-col justify-between">
          <div className="flex items-center space-x-3 mb-8">
            <CheckCircle className="h-10 w-10" />
            <span className="text-2xl font-bold">University Event Portal</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Email Verified!
            </h1>
            <p className="text-xl mb-8 text-green-100 leading-relaxed">
              Your account has been successfully verified and is ready to use
            </p>
            
            <div className="bg-green-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">What's Next?</h3>
              <ul className="space-y-2 text-green-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Sign in to your new account</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete your profile setup</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Start discovering events</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Connect with the community</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-green-200 text-sm">
            © 2024 University Event Portal. All rights reserved.
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center space-x-3 mb-8">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-green-600">University Event Portal</span>
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Verification Successful!
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Your email has been verified successfully
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Account Activated</h4>
                      <p className="text-sm text-green-700">
                        Your account is now active and ready to use. You can now sign in and start exploring events.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Redirecting to sign in page...
                  </p>
                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-4">
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Go to Sign In
                  </Button>
                </Link>
              </CardFooter>
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
            Verify Your Email
          </h1>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Complete your registration by verifying your email address
          </p>
          
          <div className="space-y-6">
            <div className="bg-blue-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Why Verify Your Email?</h3>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Ensures account security</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Prevents unauthorized access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Enables event notifications</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Allows password recovery</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-blue-200 text-sm">
          © 2024 University Event Portal. All rights reserved.
        </div>
      </div>

      {/* Right Side - Email Verification */}
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <Mail className="h-8 w-8 text-blue-900" />
            <span className="text-xl font-bold text-blue-900">University Event Portal</span>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                We've sent a verification link to
              </CardDescription>
              <p className="text-center font-medium text-blue-900">{email}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Open your email inbox</li>
                  <li>2. Look for an email from "University Event Portal"</li>
                  <li>3. Click the verification link in the email</li>
                  <li>4. Your account will be activated instantly</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleVerifyEmail}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "I've Verified My Email"
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="pt-4">
              <div className="text-center text-sm text-gray-600 w-full">
                <p className="mb-2">Didn't receive the email?</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Check your spam folder</li>
                  <li>• Make sure the email address is correct</li>
                  <li>• Wait a few minutes for delivery</li>
                </ul>
              </div>
            </CardFooter>
          </Card>
          
          {/* Mobile Hero Section */}
          <div className="lg:hidden mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Verification Required
            </h3>
            <p className="text-sm text-gray-600">
              Please check your email to complete registration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
