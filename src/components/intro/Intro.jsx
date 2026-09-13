import { useEffect } from "react";
import { FiPlay, FiScissors, FiVolume2 } from "react-icons/fi";
import "./intro.css";

export default function Intro({ onFinish }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const timer = window.setTimeout(onFinish, reducedMotion ? 0 : 4200);

    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__workspace">
        <header className="intro__topbar">
          <div className="intro__traffic-lights">
            <span />
            <span />
            <span />
          </div>

          <div className="intro__project-name">ADHAM PROJECT</div>

          <div className="intro__topbar-tools">
            <FiScissors />
            <FiVolume2 />
          </div>
        </header>

        <div className="intro__preview">
          <strong>فكرتك</strong>
          <br />
          <small>ADHAM ELSAYED · VIDEO EDITOR</small>
        </div>

        <section className="intro__timeline">
          <div className="intro__timeline-header">
            <span>00:00:00:00</span>
            <span>00:00:05:00</span>
            <span>00:00:10:00</span>
            <span>00:00:15:00</span>
            <span>00:00:20:00</span>
          </div>

          <div className="intro__tracks">
            <div className="intro__track-label">V3</div>
            <div className="intro__track intro__track--video">
              <span className="intro__clip intro__clip--mint" />
              <span className="intro__clip intro__clip--dark" />
              <span className="intro__clip intro__clip--mint intro__clip--short" />
            </div>

            <div className="intro__track-label">V2</div>
            <div className="intro__track intro__track--video">
              <span className="intro__clip intro__clip--purple" />
              <span className="intro__clip intro__clip--mint intro__clip--wide" />
            </div>

            <div className="intro__track-label">A1</div>
            <div className="intro__track intro__track--audio">
              <span className="intro__audio-wave" />
            </div>

            <div className="intro__track-label">A2</div>
            <div className="intro__track intro__track--audio">
              <span className="intro__audio-wave intro__audio-wave--second" />
            </div>
          </div>

          <div className="intro__playhead">
            <span />
          </div>

          <div className="intro__controls">
            <FiPlay />
            <b>00:00:11:08</b>
          </div>
        </section>
      </div>
    </div>
  );
}
