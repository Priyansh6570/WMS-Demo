"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Form/Input";
import { useAuth } from "@/context/AuthContext";
import { validateMobile, validateOTP } from "@/lib/utils";
import Loading from "@/components/ui/Loading";

// Define demo users as an array of objects for cleaner code and easier mapping
const demoUsers = [
    { role: "Super Admin", mobile: "9755326570" },
    { role: "Admin", mobile: "9876543211" },
    { role: "Contractor", mobile: "9755326578" },
    { role: "Quality Manager", mobile: "9876543213" },
    { role: "Financial Officer", mobile: "9876543214" },
    { role: "Worker", mobile: "9999999999" },
];

export default function LoginPageClient() {
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState("");

    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");

    useEffect(() => {
        const mobileParam = searchParams.get("mobile");
        if (mobileParam) setMobile(mobileParam);
    }, [searchParams]);

    useEffect(() => {
        if (!authLoading && isAuthenticated()) {
            router.push("/WMS/dashboard");
        }
    }, [authLoading, isAuthenticated, router]);

    const handleMobileSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (!validateMobile(mobile)) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }
        setStep(2);
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFormLoading(true);
        if (!validateOTP(otp)) {
            setError("Please enter a valid 6-digit OTP");
            setFormLoading(false);
            return;
        }
        const result = await login(mobile, otp);
        if (!result.success) {
            setError(result.error);
            setFormLoading(false);
        }
    };

    const handleBack = () => {
        setStep(1);
        setOtp("");
        setError("");
    };

    /**
     * Handles clicking a demo user's mobile number.
     * @param {string} demoMobile - The mobile number to set in the input field.
     */
    const handleDemoUserClick = (demoMobile) => {
        setMobile(demoMobile);
    };

    if (authLoading || isAuthenticated()) return <Loading />;

    return (
        <div className="flex items-center justify-center min-h-screen p-4 text-gray-700 bg-gradient-to-br from-primary-50 to-blue-100">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-white rounded-full shadow-lg">
                            <Building2 className="w-8 h-8 text-primary-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">WMS Portal</h1>
                    <p className="mt-1 text-gray-600">
                        Directorate of Archaeology, MP
                    </p>
                    {redirect && <p className="mt-2 text-sm text-blue-600">Redirecting to: {redirect}</p>}
                </div>

                <div className="p-6 card">
                    {step === 1 ? (
                        <form onSubmit={handleMobileSubmit} className="space-y-4">
                            <Input
                                label="Mobile Number"
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                required
                                maxLength={10}
                            />
                            {error && <p className="form-error">{error}</p>}
                            <Button type="submit" className="w-full" disabled={!mobile}>
                                Send OTP
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                            <Input
                                label="6-digit OTP"
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                            />
                            {error && <p className="form-error">{error}</p>}
                            <div className="p-3 text-sm text-blue-600 rounded-md bg-blue-50">
                                <strong>Demo Mode:</strong> Use OTP: <strong>123456</strong>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                                    Back
                                </Button>
                                <Button type="submit" className="flex-1" loading={formLoading} disabled={!otp}>
                                    Verify & Login
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Updated Demo Users section with clickable numbers */}
                    <div className="p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="mb-3 font-medium text-gray-900">Demo Users (Click to use)</h3>
                        <div className="space-y-2 text-sm">
                            {demoUsers.map((user) => (
                                <div key={user.mobile} className="flex items-center justify-between">
                                    <span className="text-gray-700">{user.role}:</span>
                                    <button
                                        type="button"
                                        className="font-mono cursor-pointer font-medium tracking-wider text-primary-600 transition-colors duration-200 hover:text-primary-800 hover:underline focus:outline-none"
                                        onClick={() => handleDemoUserClick(user.mobile)}
                                    >
                                        {user.mobile}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}