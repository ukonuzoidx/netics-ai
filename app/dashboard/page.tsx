import { BotIcon } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-neutral-950">
      <div className="relative max-w-2xl w-full">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-900 to-neutral-800/50 rounded-3xl"></div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] rounded-3xl"></div>

        <div className="relative space-y-6 p-8 text-center">
          <div className="bg-neutral-900/60 backdrop-blur-sm shadow-sm ring-1 ring-neutral-800/50 rounded-2xl p-6 space-y-4">
            <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl p-4 inline-flex">
              <BotIcon className="w-12 h-12 text-neutral-300" />
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-br from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Welcome to Netics AI
            </h2>
            <p className="text-neutral-400 max-w-md mx-auto">
              Your all-in-one AI assistant. Start a conversation to unlock
              productivity, research, scheduling, and more.
            </p>
            <div className="pt-2 flex justify-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Real-time responses
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Smart assistance
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Powerful tools
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
