"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NeuralPayLogo } from "./logo";

gsap.registerPlugin(CustomEase, SplitText);

const NAV_LINKS = [
  "Platform",
  "Social Settlement",
  "Analytics",
  "Security",
  "Contact",
];

export default function Navbar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (isAnimating) return;
    setIsOpen((prev) => !prev);
  };

  const handleLinkClick = (item: string) => {
    setActiveLink(item);
    setIsOpen(false);
  };

  useGSAP(
    () => {
      CustomEase.create(
        "hop",
        "M0,0 C0.354,0 0.464,0.135 0.498,0.502 0.532,0.872 0.651,1 1,1",
      );

      const split = new SplitText(".orra-menu-header h1", {
        type: "chars",
        charsClass: "char",
      });

      return () => {
        split.revert();
      };
    },
    { scope: containerRef },
  );

  useGSAP(
    () => {
      if (!hasMounted.current) {
        hasMounted.current = true;
        return;
      }

      const q = gsap.utils.selector(containerRef);

      const menu = q<HTMLDivElement>(".orra-menu")[0];

      const links = gsap.utils.toArray<HTMLElement>(
        ".orra-link",
        containerRef.current!,
      );

      const socialLines = gsap.utils.toArray<HTMLElement>(
        ".orra-socials p",
        containerRef.current!,
      );

      setIsAnimating(true);

      if (isOpen) {
        gsap.to(menu, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "hop",
          duration: 1.5,
          onStart: () => {
            menu.style.pointerEvents = "all";
          },
          onComplete: () => setIsAnimating(false),
        });

        gsap.to(links, {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          delay: 0.85,
          duration: 1,
          ease: "power3.out",
        });

        gsap.to(socialLines, {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          delay: 0.85,
          duration: 1,
          ease: "power3.out",
        });

        gsap.to(".orra-video-wrapper", {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "hop",
          duration: 1.5,
          delay: 0.5,
        });

        gsap.to(".orra-menu-header h1 .char", {
          rotateY: 0,
          stagger: 0.05,
          delay: 0.75,
          duration: 1.5,
          ease: "power4.out",
        });

        gsap.to(".orra-menu-header h1 .char", {
          y: 0,
          scale: 1,
          stagger: 0.05,
          delay: 0.5,
          duration: 1.5,
          ease: "power4.out",
        });
      } else {
        gsap.to(menu, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          ease: "hop",
          duration: 1.5,
          onComplete: () => {
            menu.style.pointerEvents = "none";

            gsap.set(menu, {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            });

            gsap.set(links, {
              y: 30,
              opacity: 0,
            });

            gsap.set(socialLines, {
              y: 30,
              opacity: 0,
            });

            gsap.set(".orra-video-wrapper", {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            });

            gsap.set(".orra-menu-header h1 .char", {
              y: 500,
              rotateY: 90,
              scale: 0.75,
            });

            setIsAnimating(false);
          },
        });
      }
    },
    {
      scope: containerRef,
      dependencies: [isOpen],
    },
  );

  return (
    <div ref={containerRef}>
      {/* =========================================================
          DEFAULT HEADER LOGO
          ========================================================= */}

      <div className="fixed left-4 top-4 z-10 sm:left-6 sm:top-6 md:left-8 md:top-8">
        <NeuralPayLogo size={48} showText={false} />
      </div>

      {/* =========================================================
          MENU TOGGLE
          ========================================================= */}

      <div
        onClick={handleToggle}
        aria-label="Toggle Menu"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleToggle();
          }
        }}
        className={`
          group
          fixed
          right-4
          top-4
          z-[70]
          h-14
          cursor-pointer
          rounded-[8em]
          border
          border-white/20
          bg-neutral-500/30
          shadow-lg
          backdrop-blur-sm
          transition-[width]
          duration-500
          ease-[cubic-bezier(0.075,0.82,0.165,1)]
          origin-right

          sm:right-6
          sm:top-6
          sm:h-15

          md:right-[2em]
          md:top-[2em]

          ${isOpen ? "w-[56px] sm:w-[60px]" : "w-[108px] sm:w-[120px]"}
        `}
      >
        {/* Toggle Copy */}
        <div
          className={`
            absolute
            top-1/2
            -translate-y-1/2
            text-white
            transition-[left,opacity]
            duration-500
            ease-[cubic-bezier(0.075,0.82,0.165,1)]
            z-[1]

            ${
              isOpen
                ? "left-[28px] opacity-0"
                : "left-[25px] opacity-100 group-hover:left-[18px]"
            }
          `}
        >
          <p className="m-0 p-0 text-[11px] font-medium uppercase tracking-[0.05em] sm:text-[12px]">
            Menu
          </p>
        </div>

        {/* Dynamic Circle */}
        <div
          className={`
            absolute
            right-0
            top-0
            h-14
            w-14
            overflow-hidden
            rounded-full
            bg-landing-violet-400
            transition-all
            duration-500
            ease-[cubic-bezier(0.075,0.82,0.165,1)]
            z-10

            sm:h-[60px]
            sm:w-[60px]

            ${
              isOpen
                ? "[clip-path:circle(50%_at_50%_50%)] scale-[1.125]"
                : "[clip-path:circle(10%_at_50%_50%)] group-hover:[clip-path:circle(35%_at_50%_50%)]"
            }
          `}
        >
          <div
            className={`
              absolute
              left-1/2
              top-1/2
              flex
              h-[30px]
              w-[30px]
              -translate-x-1/2
              -translate-y-1/2
              items-center
              justify-center
              transition-all
              duration-1000
              ease-[cubic-bezier(0.075,0.82,0.165,1)]

              ${isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
          >
            {/* Top Bar */}
            <div
              className={`
                absolute
                h-[1.5px]
                w-[15px]
                bg-black
                transition-transform
                duration-250
                ease-out

                ${
                  isOpen
                    ? "translate-y-0 rotate-45 scale-x-[1.05]"
                    : "-translate-y-[3px]"
                }
              `}
            />

            {/* Bottom Bar */}
            <div
              className={`
                absolute
                h-[1.5px]
                w-[15px]
                bg-black
                transition-transform
                duration-250
                ease-out

                ${
                  isOpen
                    ? "translate-y-0 -rotate-45 scale-x-[1.05]"
                    : "translate-y-0.75"
                }
              `}
            />
          </div>
        </div>
      </div>

      {/* =========================================================
          FULLSCREEN OVERLAY MENU
          ========================================================= */}

      <div
        className="
          orra-menu
          fixed
          inset-0
          z-50
          flex
          h-screen
          w-screen
          flex-col
          overflow-y-auto
          overflow-x-hidden
          bg-white
          text-black
          pointer-events-none
          transform-3d
          perspective-[1000px]

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          md:flex-row
        "
        style={{
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        }}
      >
        {/* =======================================================
            COLUMN 1
            ======================================================= */}

        <div
          className="
            orra-col
            orra-col-1
            relative
            flex
            min-h-fit
            w-full
            shrink-0
            flex-col
            items-start
            justify-between
            px-5
            pb-8
            pt-24

            sm:px-8
            sm:pb-10
            sm:pt-28

            md:h-full
            md:w-auto
            md:flex-1
            md:px-[3em]
            md:pb-[3em]
            md:pt-[8em]
          "
        >
          {/* Overlay Logo */}
          <div
            className="
              absolute
              left-5
              top-5

              sm:left-8
              sm:top-6

              md:left-[2em]
              md:top-[2em]
            "
          >
            <NeuralPayLogo
              size={48}
              showText={false}
              src="https://eqr61bekec.ufs.sh/f/sH4weU3V69zXXnnMPIifkPbws3hnSHtBAq6jeKT2Fr7GvEda"
            />
          </div>

          {/* Navigation Links */}
          <div
            className="
              mt-4
              flex
              w-full
              flex-col
              gap-1

              sm:mt-6
              sm:gap-1

              md:mt-[2em]
              md:gap-[0.25em]
            "
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeLink === item;

              return (
                <div
                  key={item}
                  className="
                    orra-link
                    relative
                    translate-y-7.5
                    opacity-0
                  "
                >
                  <Link
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => handleLinkClick(item)}
                    className={`
                      block
                      no-underline
                      font-light
                      tracking-tight
                      leading-[115%]
                      transition-colors
                      duration-300

                      text-[clamp(1.65rem,7vw,3rem)]

                      sm:text-[clamp(2rem,5vw,3rem)]

                      md:text-[clamp(2rem,4vw,3rem)]

                      ${
                        isActive
                          ? "text-landing-violet-600"
                          : "text-black hover:text-landing-violet-600"
                      }
                    `}
                  >
                    {item}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Video */}
          <div
            className="
              orra-video-wrapper
              mt-12
              w-full
              max-w-[420px]
              overflow-hidden
              bg-landing-card-dark/70
              p-3
              aspect-video

              sm:mt-14
              sm:p-5

              md:mt-0
              md:p-8
            "
            style={{
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            >
              <source
                src="https://eqr61bekec.ufs.sh/f/sH4weU3V69zXXbevIUfkPbws3hnSHtBAq6jeKT2Fr7GvEda4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>

        {/* =======================================================
            COLUMN 2
            ======================================================= */}

        <div
          className="
            orra-col
            orra-col-2
            relative
            flex
            min-h-fit
            w-full
            shrink-0
            flex-col
            items-start
            justify-between
            px-5
            pb-10
            pt-8

            sm:px-8
            sm:pb-12

            md:h-full
            md:w-auto
            md:flex-[2]
            md:items-end
            md:px-[3em]
            md:pb-[3em]
            md:pt-[8em]
          "
        >
          {/* =====================================================
              CONTACT / SOCIAL INFORMATION
              ===================================================== */}

          <div
            className="
              orra-socials
              flex
              w-full
              gap-8

              sm:gap-12

              md:w-[60%]
              md:gap-[2em]
            "
          >
            <div className="min-w-0 flex-1">
              <p className="relative translate-y-7.5 opacity-0 m-0 text-[9px] font-normal uppercase leading-[1.6] text-black sm:text-[10px] md:text-[11px]">
                NeuralPay Inc
              </p>

              <p className="relative translate-y-7.5 opacity-0 m-0 text-[9px] font-normal uppercase leading-[1.6] text-black sm:text-[10px] md:text-[11px]">
                Lagos, Nigeria
              </p>

              <br />

              <p className="relative translate-y-7.5 opacity-0 m-0 break-all text-[9px] font-normal uppercase leading-[1.6] text-black sm:text-[10px] md:text-[11px]">
                contact@neuralpay.io
              </p>

              <p className="relative translate-y-7.5 opacity-0 m-0 break-all text-[9px] font-normal uppercase leading-[1.6] text-black sm:text-[10px] md:text-[11px]">
                careers@neuralpay.io
              </p>
            </div>

            <div className="min-w-0 flex-1">
              <p className="relative translate-y-7.5 opacity-0 m-0 text-[9px] font-normal uppercase leading-[1.6] text-black sm:text-[10px] md:text-[11px]">
                Twitter
              </p>

              <p className="relative translate-y-7.5 opacity-0 m-0 text-[9px] font-normal uppercase leading-[1.6] text-black sm:text-[10px] md:text-[11px]">
                LinkedIn
              </p>

              <br />

              <p className="relative translate-y-7.5 opacity-0 m-0 text-[9px] font-normal uppercase leading-[1.6] text-black sm:text-[10px] md:text-[11px]">
                +234 800 000 0000
              </p>
            </div>
          </div>

          {/* =====================================================
              AGENT TITLE
              ===================================================== */}

          <div
            className="
              orra-menu-header
              mt-20
              flex
              w-full
              justify-start
              overflow-hidden

              sm:mt-24

              md:mt-0
              md:justify-end
            "
          >
            <h1
              className="
                m-0
                uppercase
                font-light
                leading-[0.85]
                text-landing-fg-dark
                font-rostex

                text-[clamp(4rem,20vw,9rem)]

                sm:text-[clamp(5rem,17vw,12rem)]

                md:text-[clamp(4rem,11vw,20vw)]

                [&_.char]:relative
                [&_.char]:inline-block
                [&_.char]:font-rostex
                [&_.char]:origin-bottom
                [&_.char]:translate-y-125
                [&_.char]:rotate-y-90
                [&_.char]:scale-[0.75]
              "
            >
              AGENT
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
