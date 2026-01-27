import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.jpg";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "About", to: "/about" },
  // { label: "Careers", to: "#" },
  { label: "Blog", to: "#" },
  { label: "Privacy", to: "/terms#privacy-policy" },
  { label: "Terms", to: "/terms" },
];

const supportEmail = "Plabonic.hq@gmail.com";

export default function Footer() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const helpModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpModalRef.current && !helpModalRef.current.contains(event.target as Node)) {
        setShowHelpModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <footer className="border-t bg-white">
      <div className="container-xl py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
                <div className="relative mr-8">
                  <img
                    src={logo}
                    alt="Plabonic"
                    className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                  <span className="absolute -top-1 -right-6 sm:-right-8 bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-full">
                    Beta
                  </span>
                </div>
              </Link>
              {/* <span className="text-xl font-bold">Plabonic<span className="text-brand">.com</span></span> */}
            </div>
            <p className="mt-3 text-sm text-gray-600">Where talent meets opportunity.</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className="text-sm text-gray-700 hover:text-brand">
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-sm text-gray-700 hover:text-brand text-left"
            >
              Support
            </button>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t pt-6 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Plabonic</p>
          <p>Made with Care</p>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black bg-opacity-60 flex items-center justify-center"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              ref={helpModalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[85vh] overflow-y-auto mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Get Help</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Tap the button below to compose an email in your mail app (Gmail on mobile will open if installed).
                </p>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={supportEmail}
                      readOnly
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(supportEmail);
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      }}
                      className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-700" />
                      )}
                      <span>{copiedEmail ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=Support%20request%20from%20Plabonic`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 text-xs sm:text-sm text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Gmail Web
                </a>
              </div>
              <div className="mt-4 sm:mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
