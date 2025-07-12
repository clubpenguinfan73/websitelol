import { useState, useEffect } from 'react';

interface AnimatedTitleProps {
  titles: string[];
  speed?: number;
  className?: string;
  updateDocumentTitle?: boolean;
}

export default function AnimatedTitle({ titles, speed = 3000, className = "", updateDocumentTitle = false }: AnimatedTitleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (titles.length === 0) return;

    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Show current title
      const currentTitle = titles[currentIndex];
      setDisplayText(currentTitle);
      
      if (currentIndex === titles.length - 1) {
        // Last title - wait then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, speed);
      } else {
        // Not last title - move to next after pause
        timeout = setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, speed);
      }
    } else {
      // Deleting phase - only happens after last title
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 100);
      } else {
        // Finished deleting, restart from first title
        setIsDeleting(false);
        setCurrentIndex(0);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, displayText, titles, speed]);

  // Update document title
  useEffect(() => {
    if (updateDocumentTitle) {
      document.title = displayText || titles[0] || '';
    }
  }, [displayText, updateDocumentTitle, titles]);

  return null; // Invisible component, only updates document title
}