import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "../common/Card";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { useAuth } from "../../contexts/AuthContext";

type FormMode = "login" | "register" | "resetPassword";

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<FormMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AuthFormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await signIn(data.email, data.password);
      } else if (mode === "register") {
        await signUp(data.email, data.password);
      } else if (mode === "resetPassword") {
        await resetPassword(data.email);
        setResetEmailSent(true);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: FormMode) => {
    setMode(newMode);
    setError(null);
    setResetEmailSent(false);
    reset();
  };

  const renderTitle = () => {
    switch (mode) {
      case "login":
        return "Sign in to your account";
      case "register":
        return "Create a new account";
      case "resetPassword":
        return "Reset your password";
    }
  };

  const getGlowColor = () => {
    switch (mode) {
      case "login":
        return "before:from-purple-600/30 before:to-blue-600/30";
      case "register":
        return "before:from-green-600/30 before:to-blue-600/30";
      case "resetPassword":
        return "before:from-amber-600/30 before:to-orange-600/30";
    }
  };

  return (
    <Card
      variant="glass"
      className={`w-full max-w-md mx-auto relative before:absolute before:inset-0 before:-z-10 before:rounded-lg ${getGlowColor()} before:p-1 before:blur-xl`}
    >
      <div className="flex flex-col items-center p-2 pt-6">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          {renderTitle()}
        </h1>

        {error && (
          <div className="w-full p-3 mb-4 bg-red-900/40 border border-red-500 rounded-md text-sm text-red-200">
            {error}
          </div>
        )}

        {mode === "resetPassword" && resetEmailSent && (
          <div className="w-full p-3 mb-4 bg-green-900/40 border border-green-500 rounded-md text-sm text-green-200">
            We've sent a password reset link to your email address.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <Input
            label="Email address"
            type="email"
            fullWidth
            error={errors.email?.message}
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />

          {mode !== "resetPassword" && (
            <Input
              label="Password"
              type="password"
              fullWidth
              error={errors.password?.message}
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              {...register("password", {
                required: "Password is required",
                minLength:
                  mode === "register"
                    ? {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      }
                    : undefined,
              })}
            />
          )}

          {mode === "register" && (
            <Input
              label="Confirm Password"
              type="password"
              fullWidth
              error={errors.confirmPassword?.message}
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
              {...register("confirmPassword", {
                validate: (value) =>
                  value === password || "The passwords do not match",
              })}
            />
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            variant={mode === "resetPassword" ? "outline" : "primary"}
          >
            {mode === "login" && "Sign In"}
            {mode === "register" && "Create Account"}
            {mode === "resetPassword" && "Send Reset Link"}
          </Button>
        </form>

        {mode !== "resetPassword" && (
          <>
            <div className="relative w-full my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-gray-900 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              fullWidth
              variant="outline"
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
              leftIcon={
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
              }
            >
              Google
            </Button>
          </>
        )}

        <div className="mt-6 text-center text-sm">
          {mode === "login" && (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="text-purple-400 hover:text-purple-300 focus:outline-none"
                onClick={() => switchMode("register")}
              >
                Sign up
              </button>
              <span className="block mt-2">
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 focus:outline-none"
                  onClick={() => switchMode("resetPassword")}
                >
                  Forgot your password?
                </button>
              </span>
            </>
          )}

          {mode === "register" && (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-purple-400 hover:text-purple-300 focus:outline-none"
                onClick={() => switchMode("login")}
              >
                Sign in
              </button>
            </>
          )}

          {mode === "resetPassword" && (
            <button
              type="button"
              className="text-purple-400 hover:text-purple-300 focus:outline-none"
              onClick={() => switchMode("login")}
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
