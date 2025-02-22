import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <div className="mt-16 sm:mt-24 py-8 text-center border-t border-white/5 bg-white/[0.02]">
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-white/60">
          Made with ♥️ by Pratham
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/prathamdby"
            target="_blank"
            className="text-white/40 hover:text-white transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href="https://twitter.com/prathamdby"
            target="_blank"
            className="text-white/40 hover:text-white transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            href="https://linkedin.com/in/prathamdby"
            target="_blank"
            className="text-white/40 hover:text-white transition-colors"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
