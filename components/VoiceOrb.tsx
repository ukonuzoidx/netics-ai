"use client";

interface VoiceOrbProps {
  isListening: boolean; // true when user is actively speaking
}

export default function VoiceOrb({ isListening }: VoiceOrbProps) {
  return (
    <div className="voice-orb-container">
      <input
        type="checkbox"
        id="voice-orb-toggle"
        className="voice-orb-toggle"
        checked={isListening}
        readOnly
      />

      {/* Starfield Background */}
      <div className="starfield">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="star" />
        ))}
      </div>

      {/* Mountain Layers */}
      <div className="mountain-layer mountain-1" />
      <div className="mountain-layer mountain-2" />
      <div className="mountain-layer mountain-3" />

      {/* Nebula Clouds */}
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />

      {/* Tilt Grid for 3D effect */}
      <div className="tilt-grid">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="tilt-area" />
        ))}
      </div>

      {/* Main Orb Card */}
      <label htmlFor="voice-orb-toggle" className="orb-label">
        <div className="orb-card">
          <div className="orb-sphere">
            {/* Core energy glow */}
            <div className="core-energy" />

            {/* Icon container - switches between mic and wave bars */}
            <div className="orb-icon-container">
              {/* Mic icon - shown when NOT listening (AI speaking or idle) */}
              <svg
                className="mic-icon"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"></path>
                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"></path>
              </svg>

              {/* Wave bars - shown when listening (user speaking) */}
              <div className="wave-bars">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bar" />
                ))}
              </div>
            </div>

            {/* Floating particles */}
            <div className="particles">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="particle" />
              ))}
            </div>

            {/* "Listening" text - only shows when listening */}
            <div className="listening-text">
              {"Listening".split("").map((char, i) => (
                <span key={i} className="letter">
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      </label>
    </div>
  );
}
