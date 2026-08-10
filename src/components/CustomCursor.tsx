import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    const magneticElements = document.querySelectorAll(
      'button, a, input, textarea, [role="button"], .magnetic'
    );

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      gsap.to(follower, {
        scale: 2.5,
        opacity: 0.3,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(cursor, {
        scale: 0.8,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(follower, {
        scale: 1,
        opacity: 0.5,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMagneticMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const magnetic = target.closest("[data-magnetic]");
      if (!magnetic) return;

      const rect = magnetic.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 100;

      if (distance < maxDistance) {
        const strength = (maxDistance - distance) / maxDistance;
        const moveX = deltaX * strength * 0.4;
        const moveY = deltaY * strength * 0.4;

        gsap.to(magnetic, {
          x: moveX,
          y: moveY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMagneticLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      const magnetic = target.closest("[data-magnetic]");
      if (!magnetic) return;

      gsap.to(magnetic, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });
    };

    magneticElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
      el.setAttribute("data-magnetic", "true");
    });

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("mousemove", handleMagneticMove);
    document.addEventListener("mouseover", handleMagneticMove);
    document.addEventListener("mouseout", handleMagneticLeave);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mousemove", handleMagneticMove);
      document.removeEventListener("mouseover", handleMagneticMove);
      document.removeEventListener("mouseout", handleMagneticLeave);
      magneticElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
        el.removeAttribute("data-magnetic");
      });
    };
  }, []);

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        @media (pointer: coarse) {
          * { cursor: auto !important; }
          .custom-cursor, .cursor-follower { display: none !important; }
        }
      `}</style>
      <div
        ref={cursorRef}
        className="custom-cursor fixed top-0 left-0 w-2 h-2 bg-[#5eead4] rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <div
        ref={followerRef}
        className="cursor-follower fixed top-0 left-0 w-8 h-8 border-2 border-[#5eead4]/60 rounded-full pointer-events-none z-[9998] backdrop-blur-sm"
        style={{ transform: "translate(-50%, -50%)", opacity: 0.5 }}
      />
    </>
  );
};
