import '../App.css';
import brain from "../assets/brain.png"; 
import user from "../assets/user.png";


const AboutScreen = () => {
  return (
    <div className="about-page">
      {/* Mission Box */}
      <div className="mission-box">
        <div>
          <h2>Our Mission</h2>
          <p>
            AI Learning Companion is AI-powered platform helps 
            the students progress, identify weak areas, and improve learning.
          </p>
        </div>
        <img src={brain} alt="brain" />
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="team-card">
          <img src={user} alt="Furqan" />
          <h3>Furqan Qudoos</h3>
          <p>Co-founder & CEO</p>
        </div>

        <div className="team-card">
          <img src={user} alt="Fahad" />
          <h3>Fahad Manzoor</h3>
          <p>Head & Product</p>
        </div>

        <div className="team-card">
          <img src={user} alt="Mansoor" />
          <h3>Mansoor-ul-Haq</h3>
          <p>Lead Developer</p>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="bottom-section">
        <div className="info-card">
          <h3>🚀 Mission</h3>
          <p>
            Empower students globally with personalized, intelligent learning tools.
          </p>
        </div>

        <div className="info-card">
          <h3>📘 Our Vision</h3>
          <p>
            To create future where AI facilitates accessible education for all.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
