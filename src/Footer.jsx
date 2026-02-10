import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#0f0f0f] border-t border-white/5 py-8 mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand / Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <h3 className="text-white font-bold tracking-tight text-lg">WatchIt Together</h3>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Made with <Heart size={10} className="inline text-red-500 mx-0.5" /> for friends.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-6 text-sm font-medium text-gray-400">
          <a href="/privacy" className="hover:text-purple-400 transition-colors duration-200">
            Privacy
          </a>
          <a href="/terms" className="hover:text-purple-400 transition-colors duration-200">
            Terms
          </a>
        </div>

        {/* Social Media */}
        <div className="flex gap-4">
          <a 
            href="https://github.com/your-repo" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all duration-200"
            aria-label="Twitter"
          >
            <Twitter size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;