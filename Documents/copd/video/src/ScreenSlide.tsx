import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from 'remotion';

interface ScreenSlideProps {
  imageSrc: string;
  title: string;
  description?: string;
  width: number;
  height: number;
}

export const ScreenSlide: React.FC<ScreenSlideProps> = ({
  imageSrc,
  title,
  description,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Entrance animations for the slide
  const slideEntrance = spring({
    frame,
    fps,
    from: 0.95,
    to: 1,
    config: {damping: 15, stiffness: 90},
  });

  const opacityEntrance = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: {damping: 12},
  });

  // Calculate scrolling metrics
  // Phone mockup dimensions
  const phoneWidth = 380;
  const phoneHeight = 780;
  // Scaled height of screenshot inside mockup (maintains original aspect ratio)
  const scaledImageHeight = height * (phoneWidth / width);
  // Total scroll distance (scaled image height minus mockup container viewport height)
  const maxScroll = Math.max(0, scaledImageHeight - phoneHeight);

  // Set scrolling timing:
  // - Frames 0-30 (0s-1s): Stay at top (scroll = 0)
  // - Frames 30-150 (1s-5s): Scroll smoothly to bottom
  // - Frames 150-180 (5s-6s): Stay at bottom
  const scrollTranslate = interpolate(
    frame,
    [30, 150],
    [0, -maxScroll],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Dynamic feature callout based on frame timeline
  const getActiveCallout = () => {
    if (title.includes('Onboarding') || title.includes('Welcome')) {
      if (frame < 60) {
        return {
          title: "Secure Authentication Gate",
          desc: "Supports Google Single Sign-On and anonymous guest entry routes."
        };
      } else if (frame < 120) {
        return {
          title: "Approachable Design",
          desc: "High-contrast clinical colors with large, easily clickable buttons."
        };
      } else {
        return {
          title: "Accessible Interface",
          desc: "Clean layout ensuring clear navigation guidance for all users."
        };
      }
    } else if (title.includes('Navigation') || title.includes('Hub')) {
      if (frame < 60) {
        return {
          title: "Action Plan Shortcuts",
          desc: "Immediate, single-tap access to emergency action checklists."
        };
      } else if (frame < 120) {
        return {
          title: "Status Dashboard Summary",
          desc: "Gives patients a clear visual indicator of their current triage zone."
        };
      } else {
        return {
          title: "Daily Log Check",
          desc: "Convenient links to log medication compliance and symptoms."
        };
      }
    } else if (title.includes('Logging') || title.includes('Dashboard')) {
      if (frame < 60) {
        return {
          title: "Live Telemetry Status",
          desc: "Real-time indicator showing active clinical telemetry status."
        };
      } else if (frame < 120) {
        return {
          title: "Frictionless Forms",
          desc: "Checking daily adherence is designed to accommodate elderly motor control."
        };
      } else {
        return {
          title: "Check-in History logs",
          desc: "Instantly logs daily medication compliance and active alerts."
        };
      }
    } else if (title.includes('Triage') || title.includes('Protocol') || title.includes('Guidelines')) {
      if (frame < 60) {
        return {
          title: "Green Stable Zone",
          desc: "Guidelines to maintain stable respiratory health when symptoms are managed."
        };
      } else if (frame < 120) {
        return {
          title: "Amber Warning Zone",
          desc: "Actions to take to prevent minor exacerbations from worsening."
        };
      } else {
        return {
          title: "Red Emergency Actions",
          desc: "High-visibility critical protocols to contact emergency care instantly."
        };
      }
    } else if (title.includes('Clinician') || title.includes('Action Plan')) {
      if (frame < 60) {
        return {
          title: "Physician Prescribed Plan",
          desc: "Displays direct medication changes and action steps customized by a doctor."
        };
      } else if (frame < 120) {
        return {
          title: "Physician Signature",
          desc: "Signed document verification establishes authority and patient reassurance."
        };
      } else {
        return {
          title: "Direct SOS Action",
          desc: "Prominent clinician emergency numbers for immediate access during distress."
        };
      }
    } else if (title.includes('Trends') || title.includes('Analytics')) {
      if (frame < 60) {
        return {
          title: "Visual Health Charts",
          desc: "Symptom trends plotted over time to visually track exacerbation peaks."
        };
      } else if (frame < 120) {
        return {
          title: "Oversized Legend",
          desc: "Clear visual descriptions ensuring data clarity for low-vision patients."
        };
      } else {
        return {
          title: "Consultation Preparation",
          desc: "Prepares data to allow physicians to spot long-term respiratory changes."
        };
      }
    } else {
      // Historical Logs
      if (frame < 60) {
        return {
          title: "Searchable Archives",
          desc: "Search past entries to review symptoms history and logs."
        };
      } else if (frame < 120) {
        return {
          title: "Exacerbation Records",
          desc: "Quickly view color-coded badges indicating past status warnings."
        };
      } else {
        return {
          title: "Telemetry Export",
          desc: "Generate export sheets to share logging data with healthcare providers."
        };
      }
    }
  };

  const callout = getActiveCallout();

  // Callout card animations on content change
  const calloutProgress = (frame % 60);
  const calloutOpacity = interpolate(
    calloutProgress,
    [0, 10, 50, 60],
    [0.2, 1, 1, 0.2],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #071D11 0%, #165A30 50%, #0F3C21 100%)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8%',
        opacity: opacityEntrance,
      }}
    >
      {/* LEFT SIDE: Information Sidebar */}
      <div
        style={{
          width: '42%',
          transform: `scale(${slideEntrance})`,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          fontFamily: 'Noto Sans, Arial, sans-serif',
          color: '#ffffff',
        }}
      >
        <div>
          {/* Brand/Project Tag */}
          <span
            style={{
              textTransform: 'uppercase',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '3px',
              color: '#F78E1E',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            COPD CARE MANAGER
          </span>
          {/* Main Title */}
          <h1
            style={{
              fontSize: '44px',
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.2,
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {title}
          </h1>
          {/* Description */}
          {description && (
            <p
              style={{
                fontSize: '18px',
                color: '#d0e8d9',
                marginTop: '16px',
                lineHeight: 1.6,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Dynamic Highlight Card (Glassmorphism) */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            transition: 'opacity 0.25s ease',
            opacity: calloutOpacity,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#F78E1E',
                display: 'inline-block',
                boxShadow: '0 0 8px #F78E1E',
              }}
            />
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
              }}
            >
              {callout.title}
            </h3>
          </div>
          <p
            style={{
              fontSize: '15px',
              color: '#d0e8d9',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {callout.desc}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Phone Frame Viewport */}
      <div
        style={{
          width: '45%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Sleek iPhone Phone Mockup Frame */}
        <div
          style={{
            width: `${phoneWidth}px`,
            height: `${phoneHeight}px`,
            borderRadius: '40px',
            border: '12px solid #1C1F22',
            backgroundColor: '#ffffff',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.1)',
            overflow: 'hidden',
            position: 'relative',
            transform: `scale(${slideEntrance})`,
          }}
        >
          {/* iPhone Notch Speaker details */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '140px',
              height: '25px',
              backgroundColor: '#1C1F22',
              borderBottomLeftRadius: '15px',
              borderBottomRightRadius: '15px',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '4px',
                backgroundColor: '#333',
                borderRadius: '2px',
                marginBottom: '4px',
              }}
            />
          </div>

          {/* Screenshot inside viewport */}
          <div
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              backgroundColor: '#FAFAFA',
            }}
          >
            <div
              style={{
                width: '100%',
                transform: `translateY(${scrollTranslate}px)`,
                display: 'block',
              }}
            >
              <Img
                src={staticFile(imageSrc)}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
