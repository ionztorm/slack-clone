import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import type { SignInFlow } from "../types";
import { useState } from "react";

type SignUpCardProps = {
	setState: (state: SignInFlow) => void;
};

export const SignUpCard = ({ setState }: SignUpCardProps) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	return (
		<Card className="w-full h-full p-8">
			<CardHeader className="px-0 pt-0">
				<CardTitle>Sign up to continue</CardTitle>
				<CardDescription className="">
					User your email or another service...
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5 px-0 pb-0">
				<form className="space-y-2.5">
					<Input
						disabled={false}
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
						}}
						type="email"
						placeholder="email"
						required
					/>

					<Input
						disabled={false}
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
						}}
						type="password"
						placeholder="password"
						required
					/>
					<Input
						disabled={false}
						value={confirmPassword}
						onChange={(e) => {
							setConfirmPassword(e.target.value);
						}}
						type="password"
						placeholder="confirm password"
						required
					/>

					<Button type="submit" className="w-full" size="lg" disabled={false}>
						Continue
					</Button>
				</form>
				<Separator />
				<div className="flex flex-col gap-y-2.5">
					<Button
						disabled={false}
						onClick={() => {}}
						variant="outline"
						size="lg"
						className="w-full relative"
					>
						<FcGoogle className="size-5 absolute top-3 left-2.5" />
						Continue with Google
					</Button>

					<Button
						disabled={false}
						onClick={() => {}}
						variant="outline"
						size="lg"
						className="w-full relative"
					>
						<FaGithub className="size-5 absolute top-3 left-2.5" />
						Continue with Github
					</Button>
				</div>
				<p className="text-xs text-muted-foreground">
					Already have an account?{" "}
					{/* <span
            onClick={() => setState("signIn")}
            onKeyUp={(e) => e.key === "Enter" && setState("signIn")} // Added keyboard even
            className="text-sky-700 hover:underline cursor-pointer"
            role="button"
            tabIndex={0} // Makes the span focusable via keyboard
          >
            Sign In
          </span> */}
					<button
						type="button"
						onClick={() => setState("signIn")}
						className="text-sky-700 hover:underline cursor-pointer"
					>
						Sign In
					</button>
				</p>
			</CardContent>
		</Card>
	);
};
