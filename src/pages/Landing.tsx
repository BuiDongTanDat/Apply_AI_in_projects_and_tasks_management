import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const cards = [
    { icon: "/images/landing/Projects.png", title: "Projects", path: "/projects", top: 0, left: 10, width: 300, height: 380 },
    { icon: "/images/landing/Calendar.png", title: "Calendar", path: "/calendar", top: 350, left: 10, width: 300, height: 210 },
    { icon: "/images/landing/Teams.png", title: "Teams", path: "/teams", top: 0, left: 290, width: 420, height: 250 },
    { icon: "/images/landing/Workspaces.png", title: "Workspaces", path: "/workspaces", top: 220, left: 350, width: 350, height: 300 },
  ];

  const frameWidth = 620;
  const frameHeight = 500;

  const [showBg, setShowBg] = useState(false);
  const [showFrame, setShowFrame] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    setShowBg(true);
    const timer1 = setTimeout(() => setShowFrame(true), 200);
    const timer2 = setTimeout(() => setShowCards(true), 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start overflow-hidden"
      style={{
        backgroundColor: "#902F0B",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        opacity: showBg ? 1 : 0,
      }}
    >
      <h1 className="text-2xl font-bold mt-6 text-white">WoodyTask</h1>
      <p className="mb-2 text-white">Begin now</p>

      {/* --- Layout cho màn hình lớn --- */}
      <div
        className="relative w-full max-w-[700px] flex-1 hidden md:block"
        style={{ height: 400 }}
      >
        <img
          src="/images/landing/Frame.png"
          alt="Frame"
          style={{
            position: "absolute",
            top: 30,
            left: 100,
            width: frameWidth,
            height: frameHeight,
            zIndex: 0,
            pointerEvents: "none",
            opacity: showFrame ? 1 : 0,
            transition: "opacity 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />

        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate(card.path)}
            style={{
              top: card.top,
              left: card.left,
              width: card.width,
              height: card.height,
              zIndex: 1,
              opacity: showCards ? 1 : 0,
              transform: `translateY(${showCards ? 0 : 40}px)`,
              transition: `
                opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 0.15}s,
                transform 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 0.15}s
              `,
            }}
            className="absolute"
          >
            <div className="w-full h-full cursor-pointer transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
              <img
                src={card.icon}
                alt={card.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- Layout dọc cho màn hình nhỏ --- */}
      <div className="flex flex-col items-center gap-4 mt-6 md:hidden">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate(card.path)}
            className="w-4/5 max-w-[400px] cursor-pointer transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
          >
            <img
              src={card.icon}
              alt={card.title}
              className="w-full h-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;
