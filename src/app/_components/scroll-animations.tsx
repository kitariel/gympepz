"use client";

import { useEffect } from "react";

export function ScrollAnimations() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Wait for DOM to be ready and apply animations
    requestAnimationFrame(() => {
      const animatedElements = document.querySelectorAll(
        ".animate-fade-up, .animate-fade-scale, .animate-float",
      );

      animatedElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Check if element is already visible in viewport
        if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
          el.classList.add("visible");
        } else {
          observer.observe(el);
        }
      });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click",  (e) => {
        e.preventDefault();
        const target = document.querySelector(
          (anchor as HTMLAnchorElement).getAttribute("href") ?? "",
        );
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
