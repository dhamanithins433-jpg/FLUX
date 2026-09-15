import { useState } from "react";
import Login from "./login";
import AdminPortal from "./components/AdminPortal";
import TeacherPortal from "./components/TeacherPortal";
import StudentPortal from "./components/StudentPortal";
import CSECourseHub from "./components/courses/CSECourseHub";

import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("svcet_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeMenu, setActiveMenu] = useState("home");

  const handleLogout = () => {
    localStorage.removeItem("svcet_token");
    localStorage.removeItem("svcet_user");
    setCurrentUser(null);
    setActiveMenu("home");
  };

  // Navigation function
  const navigateTo = (page) => {
    setActiveMenu(page);
  };

  // Menu Data (Sidebar navigation - strictly site sections, no sidebar login)
  const menuItems = [
    {
      id: "home",
      icon: "🏠",
      name: "Home"
    },
    {
      id: "courses",
      icon: "🎓",
      name: "Courses"
    },
    {
      id: "achievements",
      icon: "🏆",
      name: "Achievements"
    },
    {
      id: "placement",
      icon: "💼",
      name: "Placement"
    },
    {
      id: "contact",
      icon: "📞",
      name: "Contact"
    }
  ];

  // Department & Courses Data (Expanded list of 13 academic programs)
  const departments = [
    {
      icon: "💻",
      title: "Computer Science Engineering",
      description: "Learn programming, artificial intelligence, cloud architectures, cybersecurity, and modern technologies."
    },
    {
      icon: "🤖",
      title: "AI & Data Science",
      description: "Master machine learning algorithms, deep neural networks, computer vision, NLP, and big data systems."
    },
    {
      icon: "🖥️",
      title: "Information Technology",
      description: "Build robust enterprise software, full-stack systems, cloud architectures, and DevOps pipelines."
    },
    {
      icon: "📊",
      title: "CS & Business Systems",
      description: "TCS-curated curriculum blending digital computing technologies with financial and business analytics."
    },
    {
      icon: "🛡️",
      title: "Cyber Security & Forensics",
      description: "Specialized defense curriculum in ethical hacking, cryptography, threat intelligence, and digital forensics."
    },
    {
      icon: "📡",
      title: "Electronics & Communication",
      description: "Explore VLSI chip design, embedded microcontrollers, satellite communications, and IoT sensor systems."
    },
    {
      icon: "⚡",
      title: "Electrical & Electronics",
      description: "Power electronics, smart electric grid systems, renewable solar/wind energy, and EV powertrain design."
    },
    {
      icon: "⚙️",
      title: "Mechanical Engineering",
      description: "Robotics, automation, mechatronics, CAD/CAM modeling, finite element analysis, and Industry 4.0."
    },
    {
      icon: "🏢",
      title: "Civil Engineering",
      description: "Smart infrastructure design, structural analysis, green building architecture, and modern geoinformatics."
    },
    {
      icon: "🧬",
      title: "Biomedical & Biotechnology",
      description: "Genetic engineering, bio-sensors, biomedical instrumentation, bioinformatics, and healthcare AI."
    },
    {
      icon: "🔬",
      title: "M.E. Computer Science (PG)",
      description: "Postgraduate research program in advanced distributed algorithms, high-performance computing, and AI."
    },
    {
      icon: "📈",
      title: "Master of Business Administration (MBA)",
      description: "Executive management program covering Finance, Human Resources, Digital Marketing, and Operations."
    },
    {
      icon: "📱",
      title: "Master of Computer Applications (MCA)",
      description: "Advanced applications engineering, modern cloud platforms, mobile app architecture, and IT systems."
    }
  ];

  // Achievements Data
  const achievementsList = [
    {
      icon: "🎖️",
      tag: "ACCREDITATION",
      title: "NAAC 'A+' Grade Accreditation",
      description: "Conferred with premier 'A+' Grade by National Assessment and Accreditation Council for outstanding pedagogical quality and research infrastructure."
    },
    {
      icon: "🌍",
      tag: "GLOBAL BENCHMARK",
      title: "NBA Tier-1 Global Accreditation",
      description: "Core undergraduate engineering programs accredited under the Washington Accord, ensuring global degree recognition worldwide."
    },
    {
      icon: "🏛️",
      tag: "ACADEMIC FREEDOM",
      title: "UGC Autonomous Institution",
      description: "Granted academic autonomy by UGC and Anna University, Chennai to continuously update course syllabi with emerging global tech trends."
    },
    {
      icon: "💡",
      tag: "RESEARCH & PATENTS",
      title: "50+ Patents & Research Grants",
      description: "Over ₹3.8 Crores in sponsored funding from DST-FIST, SERB, AICTE, and MSME, with more than 50 published and granted intellectual properties."
    },
    {
      icon: "🥇",
      tag: "NATIONAL HONORS",
      title: "Smart India Hackathon Champions",
      description: "SVCET student innovator teams consecutively bagged 1st prizes across Healthcare, AI, and Clean Energy categories at national finals."
    },
    {
      icon: "🤝",
      tag: "INDUSTRY TIE-UPS",
      title: "35+ Global MoUs & Tech Centers",
      description: "Active industry partnerships with TCS, Infosys, Wipro, IBM, Cisco Networking Academy, and foreign university exchange programs."
    }
  ];

  return (
    <div className="app">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        {/* COLLEGE LOGO */}
        <div className="sidebar-logo">
          <img src="/college-logo.png" alt="College Logo" />
          <h1>SVCET</h1>
          <p>College Portal</p>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={
                activeMenu === item.id || (item.id === "courses" && activeMenu === "cse-course")
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => navigateTo(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-footer">
          <span>Learn</span>
          <span>|</span>
          <span>Grow</span>
          <span>|</span>
          <span>Succeed</span>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        {/* ================= HEADER (ONE NAVBAR LOGIN) ================= */}
        <header className="top-header">
          <div className="header-left">
            <img src="/college-logo.png" alt="College Logo" />
            <div>
              <h1>SRI VENKATESWARA</h1>
              <p>College of Engineering and Technology</p>
            </div>
          </div>

          <div className="header-right">
            <p>An Autonomous Institution</p>
            {!currentUser ? (
              activeMenu !== "login" && (
                <button
                  className="login-button"
                  onClick={() => navigateTo("login")}
                >
                  Login
                </button>
              )
            ) : (
              <div className="header-logged-actions">
                <button
                  className="login-button"
                  onClick={() => navigateTo("portal")}
                >
                  {currentUser.role === "college"
                    ? "Admin Portal"
                    : currentUser.role === "faculty"
                    ? "Faculty Portal"
                    : "Student Portal"}
                </button>
                <button
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ================= HOME ================= */}
        {activeMenu === "home" && (
          <section id="home" className="hero-section">
            {/* HERO TEXT */}
            <div className="hero-content">
              <div className="hero-tag">
                <span>KNOWLEDGE</span>
                <span>|</span>
                <span>INNOVATION</span>
                <span>|</span>
                <span>EXCELLENCE</span>
              </div>

              <h1>
                Welcome to
                <br />
                Sri Venkateswara College
                <br />
                of Engineering and Technology
              </h1>

              <p>
                Empowering Students Through
                <br />
                Knowledge, Innovation and Excellence
              </p>

              <button
                className="explore-button"
                onClick={() => navigateTo("courses")}
              >
                Explore Courses →
              </button>
            </div>

            {/* HERO IMAGE */}
            <div className="hero-image">
              <img src="college-campus.png" alt="College Campus" />
              <div className="slider-dots">
                <span className="active-dot"></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </section>
        )}

        {/* ================= COURSES ================= */}
        {activeMenu === "courses" && (
          <section id="courses" className="courses-section">
            <div className="section-header">
              <div>
                <span className="section-title">ACADEMICS & PROGRAMS</span>
                <h2>Our Academic Departments</h2>
                <p>Explore our wide range of Undergraduate, Postgraduate & Research Programs</p>
              </div>
              <button className="view-course-button">
                13 Accredited Programs
              </button>
            </div>

            {/* DEPARTMENT CARDS */}
            <div className="department-grid">
              {departments.map((department, index) => {
                const isCSE = department.title === "Computer Science Engineering";
                return (
                  <div
                    className={isCSE ? "department-card featured-cse" : "department-card"}
                    key={index}
                    onClick={() => {
                      if (isCSE) navigateTo("cse-course");
                    }}
                  >
                    {isCSE && <span className="featured-pill">Curriculum & Materials Hub</span>}
                    <div className="department-icon">{department.icon}</div>
                    <h3>{department.title}</h3>
                    <p>{department.description}</p>
                    {isCSE && (
                      <button
                        className="explore-cse-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo("cse-course");
                        }}
                      >
                        Explore Curriculum & Materials →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= CSE COURSE & STUDY MATERIALS HUB ================= */}
        {activeMenu === "cse-course" && (
          <CSECourseHub onBackToCourses={() => navigateTo("courses")} />
        )}

        {/* ================= ACHIEVEMENTS ================= */}
        {activeMenu === "achievements" && (
          <section id="achievements" className="achievements-section">
            <div className="achievement-heading">
              <span>EXCELLENCE & RECOGNITION</span>
              <h2>Our Institutional Achievements</h2>
              <p>Celebrating Decades of Academic Distinction, Innovation & Leadership</p>
            </div>

            {/* STAT COUNTERS */}
            <div className="stats-container">
              <div className="stat-box">
                <div>🎓</div>
                <h2>6500+</h2>
                <p>Students & Alumni</p>
              </div>

              <div className="stat-box">
                <div>👨‍🏫</div>
                <h2>280+</h2>
                <p>Faculty (85+ Ph.D.)</p>
              </div>

              <div className="stat-box">
                <div>🏢</div>
                <h2>13+</h2>
                <p>Accredited Programs</p>
              </div>

              <div className="stat-box">
                <div>🏆</div>
                <h2>180+</h2>
                <p>National & State Awards</p>
              </div>

              <div className="stat-box">
                <div>🔬</div>
                <h2>50+</h2>
                <p>Patents Filed & Granted</p>
              </div>

              <div className="stat-box">
                <div>💼</div>
                <h2>94.5%</h2>
                <p>Placement Record</p>
              </div>
            </div>

            {/* MILESTONE HIGHLIGHT CARDS */}
            <div className="achievement-cards-grid">
              {achievementsList.map((item, idx) => (
                <div className="achievement-card" key={idx}>
                  <div className="achievement-card-top">
                    <div className="achievement-card-icon">{item.icon}</div>
                    <span className="achievement-card-tag">{item.tag}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= PLACEMENT ================= */}
        {activeMenu === "placement" && (
          <section id="placement" className="placement-section">
            <div className="placement-left">
              <span className="small-heading">CAREER</span>
              <h2>Training & Placement</h2>
              <p>Building Successful Careers</p>
              <ul>
                <li>✓ Technical Training</li>
                <li>✓ Aptitude Training</li>
                <li>✓ Mock Interviews</li>
                <li>✓ Campus Recruitment</li>
              </ul>
            </div>

            <div className="placement-right">
              <div className="placement-card">
                <span>👥</span>
                <div>
                  <h2>90%</h2>
                  <p>Placement Rate</p>
                </div>
              </div>

              <div className="placement-card">
                <span>₹</span>
                <div>
                  <h2>8 LPA</h2>
                  <p>Highest Package</p>
                </div>
              </div>

              <div className="placement-card">
                <span>🏢</span>
                <div>
                  <h2>100+</h2>
                  <p>Recruiters</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= CONTACT ================= */}
        {activeMenu === "contact" && (
          <section id="contact" className="contact-section">
            <div className="contact-left">
              <span className="small-heading">CONTACT</span>
              <h2>Get In Touch</h2>
              <p>We Would Love to Hear From You</p>

              <div className="contact-details">
                <div>
                  <span>📍</span>
                  <p>
                    Thirupachur,
                    <br />
                    Thiruvallur TK,
                    <br />
                    Tamil Nadu - 631203
                  </p>
                </div>

                <div>
                  <span>📞</span>
                  <p>+91 XXXXX XXXXX</p>
                </div>

                <div>
                  <span>✉️</span>
                  <p>info@svcet.edu.in</p>
                </div>
              </div>

              <button className="message-button">
                Send Message →
              </button>
            </div>

            {/* MAP */}
            <div className="map-box">
              <div className="map-pin">📍</div>
            </div>
          </section>
        )}

        {/* ================= PORTAL (AFTER LOGIN) ================= */}
        {activeMenu === "portal" && (
          currentUser ? (
            currentUser.role === "college" ? (
              <AdminPortal user={currentUser} />
            ) : currentUser.role === "faculty" ? (
              <TeacherPortal user={currentUser} />
            ) : (
              <StudentPortal user={currentUser} />
            )
          ) : (
            <Login
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                setActiveMenu("portal");
              }}
            />
          )
        )}

        {/* ================= LOGIN ================= */}
        {activeMenu === "login" && (
          <Login
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setActiveMenu("portal");
            }}
          />
        )}

        {/* ================= FOOTER ================= */}
        <footer className="footer">
          <div className="footer-left">
            <img src="/college-logo.png" alt="College Logo" />
            <div>
              <h3>Sri Venkateswara College of Engineering and Technology</h3>
              <p>
                Empowering Students
                <span>|</span>
                Building Future Leaders
              </p>
            </div>
          </div>

          <div className="footer-right">
            <div className="social-icons">
              <span>f</span>
              <span>◎</span>
              <span>in</span>
              <span>▶</span>
            </div>
            <p>© 2026 SVCET. All Rights Reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;