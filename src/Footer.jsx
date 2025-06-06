import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full mt-auto bg-muted text-muted-foreground border-t px-4 py-6 text-sm">
      <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          © {new Date().getFullYear()} WatchIt Together. All rights reserved.
        </div>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="hover:underline">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
