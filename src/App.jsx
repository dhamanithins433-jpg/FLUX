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

  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      const saved = localStorage.getItem("svcet_user");
      return saved ? "portal" : "home";
    } catch {
      return "home";
    }
  });

  const [portalTab, setPortalTab] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("svcet_token");
    localStorage.removeItem("svcet_user");
    setCurrentUser(null);
    setActiveMenu("home");
    setPortalTab("");
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveMenu("portal");
    setPortalTab("");
  };

  // Dynamic Navigation based on logged-in role
  const getNavItems = () => {
    if (!currentUser) {
      return [
        { id: "home", icon: "🏠", name: "Home" },
        { id: "courses", icon: "🎓", name: "Courses" },
        { id: "achievements", icon: "🏆", name: "Achievements" },
        { id: "placement", icon: "💼", name: "Placement" },
        { id: "contact", icon: "📞", name: "Contact" }
      ];
    }

    const role = (currentUser.role || "student").toLowerCase();

    if (role === "student") {
      return [
        { id: "courses", icon: "🎓", name: "Courses" },
        { id: "portal-attendance", icon: "📅", name: "Attendance" },
        { id: "portal-marks", icon: "🏆", name: "Marks" },
        { id: "portal-fees", icon: "💳", name: "Fees" },
        { id: "portal-profile", icon: "👤", name: "Profile" },
        { id: "logout", icon: "🚪", name: "Logout" }
      ];
    }

    if (role === "faculty") {
      return [
        { id: "portal-students", icon: "👥", name: "Students" },
        { id: "portal-attendance", icon: "📋", name: "Attendance" },
        { id: "portal-marks", icon: "📊", name: "Marks" },
        { id: "courses", icon: "🎓", name: "Courses" },
        { id: "portal-profile", icon: "👤", name: "Profile" },
        { id: "logout", icon: "🚪", name: "Logout" }
      ];
    }

    // Admin / College
    return [
      { id: "portal-students", icon: "👥", name: "Students" },
      { id: "portal-faculty", icon: "🏛️", name: "Faculty" },
      { id: "portal-fees", icon: "💳", name: "Fees" },
      { id: "portal-reports", icon: "📈", name: "Reports" },
      { id: "portal-materials", icon: "📚", name: "Courses" },
      { id: "portal-profile", icon: "👤", name: "Profile" },
      { id: "logout", icon: "🚪", name: "Logout" }
    ];
  };

  const handleNavClick = (itemId) => {
    if (itemId === "logout") {
      handleLogout();
      return;
    }
    if (itemId === "home" || itemId === "achievements" || itemId === "placement" || itemId === "contact") {
      setActiveMenu(itemId);
      return;
    }
    if (itemId === "courses") {
      setActiveMenu("courses");
      return;
    }
    if (itemId.startsWith("portal-")) {
      const sub = itemId.replace("portal-", "");
      setPortalTab(sub);
      setActiveMenu("portal");
      return;
    }
    setActiveMenu(itemId);
  };

  const isNavActive = (item) => {
    if (item.id === "logout") return false;
    if (activeMenu === "courses" && (item.id === "courses" || activeMenu === "cse-course")) {
      return item.id === "courses";
    }
    if (activeMenu === item.id) return true;
    if (activeMenu === "portal" && item.id.startsWith("portal-")) {
      const sub = item.id.replace("portal-", "");
      if (portalTab === sub) return true;
      if (!portalTab) {
        if (currentUser?.role === "student" && sub === "fees") return true;
        if (currentUser?.role === "faculty" && sub === "attendance") return true;
        if ((currentUser?.role === "college" || currentUser?.role === "admin") && sub === "students") return true;
      }
    }
    return false;
  };

  // Department & Courses Data (13 academic programs)
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

  const currentRole = currentUser?.role?.toLowerCase() || "";
  const isAdmin = currentRole === "college" || currentRole === "admin";
  const isFaculty = currentRole === "faculty";
  const isStudent = currentRole === "student";

  return (
    <div className="app">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        {/* COLLEGE LOGO */}
        <div className="sidebar-logo">
          <img src="/college-logo.png" alt="College Logo" />
          <h1>SVCET</h1>
          <p>
            {currentUser
              ? isAdmin
                ? "Admin Portal"
                : isFaculty
                ? "Faculty Portal"
                : "Student Portal"
              : "College Portal"}
          </p>
        </div>

        {/* DYNAMIC ROLE NAVIGATION MENU */}
        <nav className="navigation">
          {getNavItems().map((item) => (
            <button
              key={item.id}
              className={isNavActive(item) ? "nav-item active" : "nav-item"}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* SIDEBAR FOOTER */}
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
        {/* ================= HEADER (NO GENERIC PORTAL BUTTON) ================= */}
        <header className="top-header">
          <div className="header-left">
            <img src="/college-logo.png" alt="College Logo" />
            <div>
              <h1>SRI VENKATESWARA</h1>
              <p>College of Engineering and Technology</p>
            </div>
          </div>

          <div className="header-right">
            {!currentUser ? (
              <>
                <p>An Autonomous Institution</p>
                {activeMenu !== "login" && (
                  <button
                    className="login-button"
                    onClick={() => setActiveMenu("login")}
                  >
                    Login
                  </button>
                )}
              </>
            ) : (
              <div className="header-logged-actions">
                <div className="header-user-badge">
                  <span className="welcome-text">
                    Welcome, <strong>{currentUser.name}</strong> ({currentUser.register_no || currentUser.userId || currentUser.user_id || "User"})
                  </span>
                  <span className={`role-pill role-${isAdmin ? "admin" : currentRole}`}>
                    {isAdmin ? "ADMIN" : currentRole.toUpperCase()}
                  </span>
                </div>
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
                onClick={() => setActiveMenu("courses")}
              >
                Explore Courses →
              </button>
            </div>

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

            <div className="department-grid">
              {departments.map((department, index) => {
                const isCse = department.title === "Computer Science Engineering";
                return (
                  <div
                    className={`department-card ${isCse ? "department-card-cse" : ""}`}
                    key={index}
                  >
                    <div className="dept-icon-box">{department.icon}</div>
                    <h3>{department.title}</h3>
                    <p>{department.description}</p>
                    {isCse && (
                      <button
                        className="btn-cse-hub-launch"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu("cse-course");
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
          <CSECourseHub onBackToCourses={() => setActiveMenu("courses")} />
        )}

        {/* ================= ACHIEVEMENTS ================= */}
        {activeMenu === "achievements" && (
          <section id="achievements" className="achievements-section">
            <div className="achievement-heading">
              <span>EXCELLENCE & RECOGNITION</span>
              <h2>Our Institutional Achievements</h2>
              <p>Celebrating Decades of Academic Distinction, Innovation & Leadership</p>
            </div>

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
                  <h2>150+</h2>
                  <p>Recruiting Partners</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= CONTACT ================= */}
        {activeMenu === "contact" && (
          <section id="contact" className="contact-section">
            <div className="contact-info">
              <span className="small-heading">LOCATION</span>
              <h2>Contact Us</h2>
              <div className="info-item">
                <span>📍</span>
                <p>Sri Venkateswara College of Engineering and Technology, Chittoor Road, Tamil Nadu / AP Border, Pin - 517127</p>
              </div>
              <div className="info-item">
                <span>📞</span>
                <p>+91 8572 246339 / 246340</p>
              </div>
              <div className="info-item">
                <span>✉️</span>
                <p>principal@svcet.edu.in / admissions@svcet.edu.in</p>
              </div>
            </div>

            <div className="map-box">
              <div className="map-pin">📍</div>
            </div>
          </section>
        )}

        {/* ================= SECURE ROLE-BASED PORTAL ROUTING ================= */}
        {activeMenu === "portal" && (
          currentUser ? (
            isAdmin ? (
              <AdminPortal user={currentUser} initialTab={portalTab || "students"} />
            ) : isFaculty ? (
              <TeacherPortal user={currentUser} initialTab={portalTab || "attendance"} />
            ) : (
              <StudentPortal user={currentUser} initialTab={portalTab || "fees"} />
            )
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        )}

        {/* ================= LOGIN ================= */}
        {activeMenu === "login" && (
          <Login onLoginSuccess={handleLoginSuccess} />
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