export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">VEQ</h3>
            <p className="text-sm text-gray-400">Knowledge that stays. Work that continues.</p>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="text-sm text-gray-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="text-sm text-gray-400 hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} VEQ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}