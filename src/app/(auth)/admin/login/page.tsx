"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const rawCallback = searchParams.get("callbackUrl");
    const callbackUrl =    rawCallback && rawCallback.startsWith("/") ? rawCallback : "/admin/dashboard";

    const [email, setEmail] = useState("balamia@gmail.com");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setIsLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
        });

        setIsLoading(false);

        if (result?.error) {
            setError("Email hoặc mật khẩu không đúng.");
            toast.error("Email hoặc mật khẩu không đúng.");
            return;
        }

        toast.success("Đăng nhập thành công.");

        router.push(callbackUrl);
        router.refresh();
    }

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/admin/dashboard");
        }
    }, [status, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4">
            <div className="w-full max-w-[496px] rounded-[8px] border border-zinc-200 bg-white px-[34px] py-[76px] shadow-[0_18px_35px_rgba(0,0,0,0.22)]">
                <h1 className="mb-5 text-[25px] font-bold leading-none text-zinc-950">
                Admin Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-[18px]">
                <div className="space-y-2">
                    <Label
                    htmlFor="email"
                    className="text-[13px] font-normal text-zinc-600"
                    >
                    Email
                    </Label>

                    <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="h-[48px] rounded-[5px] border-zinc-300 px-3 text-[13px] text-zinc-700 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <div className="space-y-2">
                    <Label
                    htmlFor="password"
                    className="text-[13px] font-normal text-zinc-600"
                    >
                    Password
                    </Label>

                    <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-[48px] rounded-[5px] border-zinc-300 px-3 text-[13px] text-zinc-700 shadow-none placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                {error ? (
                    <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                    </p>
                ) : null}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-[25px] h-[48px] w-full rounded-[6px] bg-[#20DF7F] text-[13px] font-semibold text-white hover:bg-[#1BCF74]"
                >
                    {isLoading ? "Logging in..." : "Login now"}
                </Button>
                </form>
            </div>
        </div>
    );
}