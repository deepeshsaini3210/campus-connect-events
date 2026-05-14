"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Mail, Lock, Eye, EyeOff, User, Phone, Building, GraduationCap, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  collegeName: string;
  department: string;
  role: string;
  termsAccepted: boolean;
}

const colleges = [
  "College of Engineering",
  "College of Arts and Sciences",
  "College of Business",
  "College of Medicine",
  "College of Law",
  "College of Education",
  "College of Nursing",
  "College of Pharmacy"
];

const departments = [
  "Computer Science",
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Economics",
  "Psychology",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "English",
  "History",
  "Philosophy"
];

const roles = [
  { value: "STUDENT", label: "Student" },
  { value: "ORGANIZER", label: "Event Organizer" },
  { value: "COLLEGE_ADMIN", label: "College Admin" },
  { value: "EXTERNAL_PARTNER", label: "External Partner" }
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
    department: "",
    role: "",
    termsAccepted: false,
  });

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
    if (error) setError("");
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email) {
          setError("Please fill in all required fields");
          return false;
        }
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          setError("Please enter a valid email address");
          return false;
        }
        break;
      case 2:
        if (!formData.mobileNumber || !formData.collegeName || !formData.department || !formData.role) {
          setError("Please fill in all required fields");
          return false;
        }
        if (!formData.mobileNumber.match(/^[0-9]{10}$/)) {
          setError("Please enter a valid 10-digit mobile number");
          return false;
        }
        break;
      case 3:
        if (!formData.password || !formData.confirmPassword) {
          setError("Please enter and confirm your password");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        if (!formData.termsAccepted) {
          setError("You must accept the terms and conditions");
          return false;
        }
        break;
      default:
        return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // API call to register endpoint
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          collegeName: formData.collegeName,
          department: formData.department,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      toast.success("Registration successful! Please check your email for verification.");
      
      // Redirect to email verification page
      router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email));
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="university.email@edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">
                Mobile Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="collegeName" className="text-sm font-medium text-gray-700">
                College Name *
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select
                  value={formData.collegeName}
                  onValueChange={(value) => handleSelectChange("collegeName", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college} value={college}>
                        {college}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                Department *
              </Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, termsAccepted: checked as boolean }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white p-12 flex-col justify-between">
        <div className="flex items-center space-x-3 mb-8">
          <GraduationCap className="h-10 w-10" />
          <span className="text-2xl font-bold">University Event Portal</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Join Our Event Community
          </h1>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Create your account to discover and participate in exciting university events
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-200" />
              <span className="text-blue-100">Access events across all university colleges</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-200" />
              <span className="text-blue-100">Connect with students and organizers</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-200" />
              <span className="text-blue-100">Secure and easy event registration</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-200" />
              <span className="text-blue-100">Personalized event recommendations</span>
            </div>
          </div>
        </div>
        
        <div className="text-blue-200 text-sm">
          © 2024 University Event Portal. All rights reserved.
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <GraduationCap className="h-8 w-8 text-blue-900" />
            <span className="text-xl font-bold text-blue-900">University Event Portal</span>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Create Account
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Join our university event community
              </CardDescription>
              
              {/* Progress Indicator */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Personal Info</span>
                  <span>Academic Info</span>
                  <span>Security</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                {renderStepContent()}
                
                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </Button>
                  )}
                  
                  <div className="flex-1" />
                  
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-blue-900 hover:bg-blue-800"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-blue-900 hover:bg-blue-800 text-white font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="pt-4">
              <p className="text-center text-sm text-gray-600 w-full">
                Already have an account?{" "}
                <Link 
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
          
          {/* Mobile Hero Section */}
          <div className="lg:hidden mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start Your Event Journey
            </h3>
            <p className="text-sm text-gray-600">
              Join thousands of students in our university event community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
