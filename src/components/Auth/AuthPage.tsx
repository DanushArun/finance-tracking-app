import { AuthForm } from "./AuthForm";

export const AuthPage: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-purple-900/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-tl from-blue-900/50 to-transparent pointer-events-none" />

      {/* Animated Background Shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Finance Tracking
          </h1>
          <p className="text-gray-400">
            Manage your finances simply and efficiently
          </p>
        </div>

        <AuthForm />

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} Finance Tracking. All rights reserved.
          </p>
          <p className="mt-1">
            Secure, intuitive, and personalized financial management
          </p>
        </div>
      </div>
    </div>
  );
};
