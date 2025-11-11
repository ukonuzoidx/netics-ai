export default function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full mt-10">
      
      <div className="bg-neutral-200/10 dark:bg-neutral-900 rounded-2xl shadow-sm ring-1 ring-inset ring-neutral-800 px-6 py-5 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          👋 Welcome to Netics AI
        </h2>
        <p className="dark:text-neutral-400 text-neutral-900 mb-4 leading-relaxed">
          Your all-in-one AI assistant that eliminates app-switching. I can help
          you with:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 mb-2">
              🔍 Research & Learning
            </h3>
            <ul className="space-y-1.5 text-sm text-neutral-900 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Search Wikipedia articles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Analyze YouTube video transcripts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Find books on any topic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Get latest news headlines</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 mb-2">
              🛠️ Utilities & Tools
            </h3>
            <ul className="space-y-1.5 text-sm text-neutral-900 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Check weather anywhere</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Convert currencies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Perform calculations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Get current date & time</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-950 rounded-lg p-3 mb-4 border border-blue-900">
          <p className="text-sm text-blue-400 font-medium mb-1">
            🚀 Coming Soon:
          </p>
          <p className="text-xs text-blue-300">
            Calendar scheduling • Expense tracking • Smart home control • Travel
            booking • Voice commands • And more!
          </p>
        </div>

        <div className="border-t border-neutral-800 pt-3">
          <p className="text-sm text-neutral-900 dark:text-neutral-500 mb-2">Try asking me:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "What's the weather in Tokyo?",
              "Convert 100 USD to EUR",
              "Summarize this YouTube video: [URL]",
              "Latest tech news",
            ].map((example) => (
              <span
                key={example}
                className="text-xs dark:bg-neutral-800 text-neutral-900 dark:text-neutral-300 px-2.5 py-1 rounded-full border border-neutral-700"
              >
                &quot;{example}&quot;
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
