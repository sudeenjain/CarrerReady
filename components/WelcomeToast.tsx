import React from 'react';
import toast from 'react-hot-toast';
import { Sparkles, PartyPopper, X } from 'lucide-react';

interface WelcomeToastProps {
  name: string;
  toastId: string;
}

const WelcomeToastContent: React.FC<WelcomeToastProps> = ({ name, toastId }) => {
  return (
    <div
      className="welcome-toast-container"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '20px 22px',
        minWidth: '360px',
        maxWidth: '440px',
        background: 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(124,58,237,0.10) 50%, rgba(99,102,241,0.08) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(79,70,229,0.25), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.1) inset',
        position: 'relative',
        overflow: 'hidden',
        animation: 'welcomeSlideIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      {/* Animated shimmer overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          animation: 'welcomeShimmer 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Glow dot top-left */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 8px 24px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
          animation: 'welcomeIconPulse 2s ease-in-out infinite',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <PartyPopper size={22} color="white" />
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px',
          }}
        >
          <Sparkles size={14} color="#a5b4fc" style={{ animation: 'welcomeSparkle 1.5s ease-in-out infinite' }} />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#a5b4fc',
            }}
          >
            Welcome Back
          </span>
        </div>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: 'var(--text-main, #f1f5f9)',
            margin: '4px 0 6px',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
          }}
        >
          Thank you for logging in, {name}! 🎉
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted, #94a3b8)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Welcome to <strong style={{ color: '#a5b4fc' }}>CareerReady AI</strong> platform.
          Your career journey continues — let's make progress today!
        </p>

        {/* Mini progress bar animation */}
        <div
          style={{
            marginTop: '12px',
            height: '3px',
            borderRadius: '4px',
            background: 'rgba(99,102,241,0.15)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
              animation: 'welcomeProgress 4s ease-in-out forwards',
            }}
          />
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => toast.dismiss(toastId)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '24px',
          height: '24px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted, #64748b)',
          transition: 'all 0.2s ease',
          zIndex: 2,
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.color = 'var(--text-main, #f1f5f9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.color = 'var(--text-muted, #64748b)';
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
};

/**
 * Shows a premium welcome toast notification when a user logs in.
 * Auto-dismisses after 5 seconds.
 */
export const showWelcomeToast = (name: string) => {
  const toastId = `welcome-${Date.now()}`;

  toast.custom(
    (t) => (
      <div
        style={{
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
          transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <WelcomeToastContent name={name} toastId={t.id} />
      </div>
    ),
    {
      id: toastId,
      duration: 5000,
      position: 'top-center',
    }
  );
};
