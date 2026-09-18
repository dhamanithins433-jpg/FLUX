import React, { useState, useEffect } from "react";
import "./CSECourseHub.css";

const API_BASE = "http://localhost:5001/api";

export default function DepartmentCourseHub({ courseCode = "IT", courseName = "Information Technology", onBackToCourses }) {
  // Navigation tiers: 'regulations' | 'semesters' | 'subjects' | 'materials'
  const [viewLevel, setViewLevel] = useState("regulations");

  // Selection state
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Data states
  const [courseData, setCourseData] = useState(null);
  const [regulations, setRegulations] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectMaterials, setSubjectMaterials] = useState(null);

  // UI / Tab states
  const [activeMaterialTab, setActiveMaterialTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initial Load: Fetch Department & Regulations
  useEffect(() => {
    fetchDepartmentOverview();
  }, [courseCode]);

  const fetchDepartmentOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const code = courseCode.toLowerCase();
      const res = await fetch(`${API_BASE}/courses/${code}`);
      if (!res.ok) throw new Error(`Unable to load ${courseName} details`);
      const data = await res.json();
      setCourseData(data.course);
      setRegulations(data.regulations || []);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to university server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Select Regulation -> Fetch Semesters
  const handleSelectRegulation = async (reg) => {
    setSelectedRegulation(reg);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSearchQuery("");
    setSearchResults(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/regulations/${reg.id}/semesters`);
      if (!res.ok) throw new Error("Unable to load regulation semesters");
      const data = await res.json();
      setSemesters(data.semesters || []);
      setViewLevel("semesters");
    } catch (err) {
      console.error(err);
      setError("Failed to load semesters for " + reg.name);
    } finally {
      setLoading(false);
    }
  };

  // Select Semester -> Fetch Subjects
  const handleSelectSemester = async (sem) => {
    setSelectedSemester(sem);
    setSelectedSubject(null);
    setSearchQuery("");
    setSearchResults(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/semesters/${sem.id}/subjects`);
      if (!res.ok) throw new Error("Unable to load subjects");
      const data = await res.json();
      setSubjects(data.subjects || []);
      setViewLevel("subjects");
    } catch (err) {
      console.error(err);
      setError("Failed to load subjects for " + sem.title);
    } finally {
      setLoading(false);
    }
  };

  // Select Subject -> Fetch Materials
  const handleSelectSubject = async (sub) => {
    setSelectedSubject(sub);
    setActiveMaterialTab("All");
    setSearchQuery("");
    setSearchResults(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/subjects/${sub.id}/materials`);
      if (!res.ok) throw new Error("Unable to load materials");
      const data = await res.json();
      setSubjectMaterials(data);
      setViewLevel("materials");
    } catch (err) {
      console.error(err);
      setError("Failed to load study materials for " + sub.subject_name);
    } finally {
      setLoading(false);
    }
  };

  // Live Search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const code = courseCode.toLowerCase();
        const res = await fetch(`${API_BASE}/courses/${code}/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (e) {
        console.error("Search query error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, courseCode]);

  const handleSearchResultSelect = async (subjectItem) => {
    handleSelectSubject(subjectItem);
  };

  // Material category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Lecture Notes": return "📚";
      case "Important Questions": return "📝";
      case "Normal Notes": return "📖";
      case "Question Paper": return "📄";
      case "Video Lecture": return "🎥";
      case "Syllabus": return "📑";
      case "Useful Resources": return "🔗";
      default: return "📁";
    }
  };

  const displayName = courseData?.name || courseName;
  const deptHeader = courseData?.department ? `DEPARTMENT OF ${courseData.department.toUpperCase()}` : `DEPARTMENT OF ${courseCode.toUpperCase()}`;

  return (
    <div className="cse-container">
      {/* ---------------- BREADCRUMBS NAVIGATION ---------------- */}
      <nav className="cse-breadcrumbs" aria-label="breadcrumb">
        <span
          className="breadcrumb-item"
          onClick={() => {
            if (onBackToCourses) onBackToCourses();
          }}
        >
          Courses
        </span>
        <span className="breadcrumb-separator">›</span>

        <span
          className={`breadcrumb-item ${viewLevel === "regulations" && !selectedRegulation ? "active" : ""}`}
          onClick={() => {
            setViewLevel("regulations");
            setSelectedRegulation(null);
            setSelectedSemester(null);
            setSelectedSubject(null);
            setSearchResults(null);
          }}
        >
          {displayName}
        </span>

        {selectedRegulation && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span
              className={`breadcrumb-item ${viewLevel === "semesters" ? "active" : ""}`}
              onClick={() => {
                handleSelectRegulation(selectedRegulation);
              }}
            >
              {selectedRegulation.name}
            </span>
          </>
        )}

        {selectedSemester && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span
              className={`breadcrumb-item ${viewLevel === "subjects" ? "active" : ""}`}
              onClick={() => {
                handleSelectSemester(selectedSemester);
              }}
            >
              {selectedSemester.title}
            </span>
          </>
        )}

        {selectedSubject && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">
              {selectedSubject.subject_code} {selectedSubject.subject_name}
            </span>
          </>
        )}
      </nav>

      {/* ---------------- HERO HEADER BANNER ---------------- */}
      <section className="cse-hero-banner">
        <div className="cse-hero-content">
          <div className="cse-badge-tag">
            <span>{deptHeader}</span>
          </div>
          <h1>{displayName}</h1>
          <p>
            {courseData?.description || `Welcome to the dedicated academic hub for ${displayName} students. Explore comprehensive curricula, syllabus blueprints, unit-wise lecture notes, university question banks, and verified learning resources.`}
          </p>

          <div className="cse-stats-chips">
            <div className="stat-chip">
              📜 Regulations: <strong>2021 & 2025</strong>
            </div>
            <div className="stat-chip">
              🎓 Semesters: <strong>{courseCode === "ME-CSE" || courseCode === "MBA" || courseCode === "MCA" ? "1 to 4" : "1 to 8"}</strong>
            </div>
            <div className="stat-chip">
              🏛️ Affiliation: <strong>Anna University</strong>
            </div>
            <div className="stat-chip">
              ⭐ Status: <strong>NBA Tier-1 Accredited</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- LIVE SEARCH SECTION ---------------- */}
      <section className="cse-search-section">
        <div className="cse-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={`Search ${courseCode} subjects, codes, topics, or study resources...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="cse-search-clear"
              onClick={() => {
                setSearchQuery("");
                setSearchResults(null);
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* SEARCH RESULTS DROPDOWN PANEL */}
        {searchResults && (
          <div className="cse-search-results-panel">
            <div className="search-results-header">
              <h3>
                Search Results for "{searchResults.query}"
              </h3>
              <span className="search-count-badge">
                {searchResults.total_matches} found
              </span>
            </div>

            {searchResults.total_matches === 0 ? (
              <div className="empty-materials-state">
                <div className="empty-icon">🔎</div>
                <h3>No exact matches found</h3>
                <p>Try searching with subject code (e.g. {courseCode}3401) or general topic.</p>
              </div>
            ) : (
              <div className="search-results-grid">
                {searchResults.subjects.map((sub) => (
                  <div
                    key={`sub-${sub.id}`}
                    className="search-result-card"
                    onClick={() => handleSearchResultSelect(sub)}
                  >
                    <div>
                      <span className="search-result-type">Subject • Sem {sub.semester}</span>
                      <h4>{sub.subject_code} – {sub.subject_name}</h4>
                      <p style={{ margin: "4px 0", fontSize: "12px", color: "#64748b" }}>
                        Credits: {sub.credits} | {sub.regulation_name || "Regulation 2021"}
                      </p>
                    </div>
                    <div className="search-result-meta">
                      Click to open study materials →
                    </div>
                  </div>
                ))}

                {searchResults.materials.map((mat) => (
                  <div
                    key={`mat-${mat.id}`}
                    className="search-result-card"
                    onClick={() => {
                      fetch(`${API_BASE}/subjects/${mat.subject_id}`)
                        .then((r) => r.json())
                        .then((data) => {
                          if (data.subject) handleSelectSubject(data.subject);
                        });
                    }}
                  >
                    <div>
                      <span className="search-result-type" style={{ background: "#fef3c7", color: "#92400e" }}>
                        {mat.material_type} • {mat.unit || "General"}
                      </span>
                      <h4>{mat.title}</h4>
                      <p style={{ margin: "4px 0", fontSize: "12px", color: "#64748b" }}>
                        Subject: {mat.subject_code} ({mat.subject_name})
                      </p>
                    </div>
                    <div className="search-result-meta">
                      Source: {mat.source || "Academic Platform"} →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ERROR BANNER */}
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "14px 20px", borderRadius: "8px", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ---------------- LEVEL 1: REGULATION SELECTION ---------------- */}
      {viewLevel === "regulations" && !searchResults && (
        <section className="regulations-section">
          <div className="cse-section-bar">
            <h2 className="cse-section-title">
              <span>🏛️</span> Select Academic Regulation
            </h2>
            {onBackToCourses && (
              <button className="back-btn" onClick={onBackToCourses}>
                ← Back to All Departments
              </button>
            )}
          </div>

          {loading ? (
            <div className="cse-loading-container">
              <div className="cse-spinner"></div>
              <p>Loading regulations...</p>
            </div>
          ) : (
            <div className="regulations-grid">
              {regulations.map((reg) => {
                const is2021 = reg.code === "R2021" || reg.year === 2021;
                return (
                  <div
                    key={reg.id}
                    className="regulation-card"
                    onClick={() => handleSelectRegulation(reg)}
                  >
                    <div>
                      <div className="reg-card-top">
                        <div className="reg-icon-wrapper">
                          {is2021 ? "📘" : "✨"}
                        </div>
                        <span className={`reg-status-pill ${is2021 ? "active" : "upcoming"}`}>
                          {is2021 ? "Active & Verified" : "Autonomous 2025"}
                        </span>
                      </div>

                      <h2>{reg.name}</h2>
                      <p>{reg.description}</p>

                      <ul className="reg-highlights-list">
                        <li>
                          <span>✓</span> Choice Based Credit System (CBCS)
                        </li>
                        <li>
                          <span>✓</span> Curated Syllabi & Authentic Academic Modules
                        </li>
                        <li>
                          <span>✓</span> {is2021 ? "Official Notes, Question Banks & Video Lectures" : "Modular Syllabus Framework in Preparation"}
                        </li>
                      </ul>
                    </div>

                    <button className="reg-card-action">
                      <span>Explore Semesters</span>
                      <span>→</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ---------------- LEVEL 2: SEMESTER SELECTION ---------------- */}
      {viewLevel === "semesters" && !searchResults && selectedRegulation && (
        <section className="semesters-section">
          <div className="cse-section-bar">
            <h2 className="cse-section-title">
              <span>📅</span> {selectedRegulation.name} – Select Semester
            </h2>
            <button
              className="back-btn"
              onClick={() => {
                setViewLevel("regulations");
                setSelectedRegulation(null);
              }}
            >
              ← Back to Regulations
            </button>
          </div>

          {loading ? (
            <div className="cse-loading-container">
              <div className="cse-spinner"></div>
              <p>Loading semesters for {selectedRegulation.name}...</p>
            </div>
          ) : (
            <div className="semesters-grid">
              {semesters.map((sem) => {
                const semIcons = ["🌱", "🌿", "💻", "⚡", "🌐", "🛠️", "🚀", "🎓"];
                const icon = semIcons[sem.semester_number - 1] || "📖";
                return (
                  <div
                    key={sem.id}
                    className="semester-card"
                    onClick={() => handleSelectSemester(sem)}
                  >
                    <div>
                      <div className="sem-card-header">
                        <span className="sem-badge">{sem.academic_year}</span>
                        <span className="sem-icon">{icon}</span>
                      </div>
                      <h3>{sem.title}</h3>
                      <p className="sem-year-text">
                        Anna University {selectedRegulation.code || "R2021"} Curriculum
                      </p>
                    </div>

                    <div className="sem-info-footer">
                      <span className="sem-sub-count">
                        {sem.subject_count > 0 ? `${sem.subject_count} Subjects` : "Curriculum Enrolled"}
                      </span>
                      <span className="sem-btn-link">
                        View Subjects →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ---------------- LEVEL 3: SEMESTER SUBJECTS VIEW ---------------- */}
      {viewLevel === "subjects" && !searchResults && selectedSemester && (
        <section className="subjects-section">
          <div className="cse-section-bar">
            <h2 className="cse-section-title">
              <span>📚</span> {selectedSemester.title} – Subjects ({selectedRegulation?.name})
            </h2>
            <button
              className="back-btn"
              onClick={() => {
                setViewLevel("semesters");
                setSelectedSemester(null);
              }}
            >
              ← Back to Semesters
            </button>
          </div>

          {loading ? (
            <div className="cse-loading-container">
              <div className="cse-spinner"></div>
              <p>Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="empty-materials-state">
              <div className="empty-icon">📂</div>
              <h3>Curriculum in Preparation</h3>
              <p>Subjects for this regulation will be updated soon.</p>
            </div>
          ) : (
            <div className="subjects-grid">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="subject-card"
                  onClick={() => handleSelectSubject(sub)}
                >
                  <div>
                    <div className="sub-card-top">
                      <span className="sub-code-badge">{sub.subject_code}</span>
                      <span className="sub-credits-pill">{sub.credits} Credits</span>
                    </div>
                    <h3>{sub.subject_name}</h3>
                    <p className="sub-dept-label">
                      {sub.department || displayName} • Sem {sub.semester}
                    </p>

                    <div className="sub-materials-badge">
                      <span>📁</span>
                      <span>{sub.material_count || 0} Study Resources Available</span>
                    </div>
                  </div>

                  <button className="sub-card-btn">
                    <span>View Study Materials</span>
                    <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---------------- LEVEL 4: SUBJECT MATERIALS PAGE ---------------- */}
      {viewLevel === "materials" && !searchResults && selectedSubject && (
        <section className="subject-materials-section">
          {/* Header Card */}
          <div className="subject-page-header">
            <div className="subject-header-top">
              <div>
                <span className="subject-code-large">{selectedSubject.subject_code}</span>
                <h1>{selectedSubject.subject_name}</h1>
                <div className="subject-header-meta">
                  <span>🏛️ {selectedRegulation?.name || "Regulation 2021"}</span>
                  <span>•</span>
                  <span>📅 {selectedSemester?.title || `Semester ${selectedSubject.semester}`}</span>
                  <span>•</span>
                  <span>⭐ {selectedSubject.credits} Academic Credits</span>
                  <span>•</span>
                  <span>📁 {subjectMaterials?.total_materials || 0} Total Resources</span>
                </div>
              </div>

              <button
                className="back-btn"
                onClick={() => {
                  setViewLevel("subjects");
                  setSelectedSubject(null);
                }}
              >
                ← Back to Subjects
              </button>
            </div>
          </div>

          {loading ? (
            <div className="cse-loading-container">
              <div className="cse-spinner"></div>
              <p>Loading study materials for {selectedSubject.subject_code}...</p>
            </div>
          ) : (
            <>
              {/* Category Filter Tabs */}
              <div className="material-tabs-bar">
                {["All", "Lecture Notes", "Important Questions", "Normal Notes", "Question Paper", "Video Lecture", "Syllabus", "Useful Resources"].map((tab) => {
                  const count = tab === "All"
                    ? subjectMaterials?.total_materials || 0
                    : (subjectMaterials?.grouped_materials?.[tab] || []).length;
                  return (
                    <button
                      key={tab}
                      className={`material-tab-btn ${activeMaterialTab === tab ? "active" : ""}`}
                      onClick={() => setActiveMaterialTab(tab)}
                    >
                      <span>{tab === "All" ? "✨" : getCategoryIcon(tab)}</span>
                      <span>{tab}</span>
                      <span className="tab-count-badge">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Render Materials by Section */}
              {["Syllabus", "Lecture Notes", "Important Questions", "Normal Notes", "Question Paper", "Video Lecture", "Useful Resources"]
                .filter((cat) => activeMaterialTab === "All" || activeMaterialTab === cat)
                .map((cat) => {
                  const items = subjectMaterials?.grouped_materials?.[cat] || [];
                  if (activeMaterialTab === "All" && items.length === 0) {
                    return null;
                  }

                  return (
                    <div key={cat} className="materials-section-block">
                      <h3 className="materials-section-heading">
                        <span>{getCategoryIcon(cat)}</span>
                        <span>{cat}</span>
                        <span style={{ fontSize: "13px", fontWeight: "normal", color: "#64748b" }}>
                          ({items.length} {items.length === 1 ? "resource" : "resources"})
                        </span>
                      </h3>

                      {items.length === 0 ? (
                        <div className="empty-materials-state">
                          <div className="empty-icon">{getCategoryIcon(cat)}</div>
                          <h3>Study material will be added soon.</h3>
                          <p>Faculty & administration are currently preparing verified resources for {cat}.</p>
                        </div>
                      ) : (
                        <div className="materials-grid">
                          {items.map((item) => {
                            const isPdf = item.url.toLowerCase().endsWith(".pdf") || item.title.toLowerCase().includes("pdf");
                            const isYouTube = item.url.toLowerCase().includes("youtube.com") || item.url.toLowerCase().includes("youtu.be");

                            return (
                              <div key={item.id} className="material-card">
                                <div>
                                  <div className="mat-card-header">
                                    <span className="mat-unit-badge">
                                      {item.unit || "All Units"}
                                    </span>
                                    <span className="mat-type-tag">
                                      {item.material_type}
                                    </span>
                                  </div>

                                  <h4>{item.title}</h4>

                                  <div className="mat-source-info">
                                    <span>🌐</span>
                                    <span>Source: <strong>{item.source || "Academic Repository"}</strong></span>
                                  </div>
                                </div>

                                <div className="mat-action-buttons">
                                  {isPdf ? (
                                    <>
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-action-view"
                                      >
                                        📄 View PDF
                                      </a>
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="btn-action-download"
                                      >
                                        ⬇️ Download PDF
                                      </a>
                                    </>
                                  ) : isYouTube ? (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-action-watch"
                                    >
                                      🎥 Watch Lecture
                                    </a>
                                  ) : (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-action-link"
                                    >
                                      🔗 Open Link
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* If absolutely no materials exist in any category */}
              {subjectMaterials?.total_materials === 0 && (
                <div className="empty-materials-state">
                  <div className="empty-icon">📚</div>
                  <h3>Study material will be added soon.</h3>
                  <p>Our departmental team is actively digitizing notes, syllabi, and question banks for this course.</p>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
