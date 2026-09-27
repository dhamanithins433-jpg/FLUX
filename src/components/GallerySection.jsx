import React, { useState, useEffect } from "react";

export default function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  const galleryItems = [
    {
      id: 1,
      title: "Central Digital Knowledge Center & Library",
      category: "campus",
      image: "/campus-library.jpg",
      tag: "Academic Infrastructure"
    },
    {
      id: 2,
      title: "Advanced Artificial Intelligence & Network Lab",
      category: "laboratories",
      image: "/campus-computer-lab.jpg",
      tag: "Computing Facilities"
    },
    {
      id: 3,
      title: "Interactive Smart Classroom & Amphitheatre Lecture",
      category: "campus",
      image: "/campus-smart-classroom.jpg",
      tag: "Smart Classrooms"
    },
    {
      id: 4,
      title: "Robotics Research, Mechatronics & IoT Maker Lab",
      category: "laboratories",
      image: "/campus-robotics-lab.jpg",
      tag: "Research & Patents"
    },
    {
      id: 5,
      title: "Annual Sports Meet & Athletic Stadium Grounds",
      category: "sports",
      image: "/campus-sports.jpg",
      tag: "Sports & Athletics"
    },
    {
      id: 6,
      title: "SVCET Main Administrative & Engineering Campus",
      category: "campus",
      image: "/college-campus.png",
      tag: "Thirupachur Campus"
    },
    {
      id: 7,
      title: "Modern Green Campus & Academic Quadrangle",
      category: "campus",
      image: "/college-campus2.png",
      tag: "Campus Life"
    },
    {
      id: 8,
      title: "On-Campus Corporate Placement & Recruitment Drives",
      category: "placements",
      image: "/placement-1.jpg",
      tag: "Training & Placement"
    }
  ];

  const filteredItems = selectedCategory === "all"
    ? galleryItems
    : galleryItems.filter((item) => item.category === selectedCategory);

  // Keyboard navigation for Lightbox (Esc, Left, Right)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeLightboxIndex === null) return;
      if (e.key === "Escape") {
        setActiveLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveLightboxIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowLeft") {
        setActiveLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, filteredItems.length]);

  return (
    <section id="gallery" className="gallery-section py-4">
      <div className="container-fluid px-lg-4">
        {/* HEADER */}
        <div className="section-header text-center mb-4">
          <span className="section-tag text-uppercase fw-bold text-primary">Campus Visual Tour</span>
          <h2 className="display-6 fw-bold mt-2 text-dark">
            SVCET Campus Photo Gallery
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
            Explore moments of academic distinction, research innovation, athletic milestones, 
            and vibrant student life at our 25+ acre campus.
          </p>
        </div>

        {/* CATEGORY FILTER BUTTONS */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
          {[
            { id: "all", label: "All Photos" },
            { id: "campus", label: "Campus & Infrastructure" },
            { id: "laboratories", label: "Laboratories & Research" },
            { id: "sports", label: "Sports & Athletics" },
            { id: "placements", label: "Placement & Drives" }
          ].map((cat) => (
            <button
              key={cat.id}
              className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold ${
                selectedCategory === cat.id
                  ? "btn-primary shadow-sm"
                  : "btn-outline-secondary"
              }`}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveLightboxIndex(null);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* RESPONSIVE GALLERY GRID */}
        <div className="row g-4">
          {filteredItems.map((item, index) => (
            <div key={item.id} className="col-lg-3 col-md-4 col-sm-6">
              <div
                className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative group-gallery"
                style={{ cursor: "pointer", transition: "transform 0.25s ease" }}
                onClick={() => setActiveLightboxIndex(index)}
              >
                <div style={{ height: "220px", overflow: "hidden" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-100 h-100 object-fit-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/college-campus.png";
                    }}
                  />
                </div>
                <div className="p-3 bg-white d-flex flex-column justify-content-between flex-grow-1">
                  <div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill mb-2 px-2 py-1 small">
                      {item.tag}
                    </span>
                    <h6 className="fw-bold text-dark small mb-0" style={{ lineHeight: "1.4" }}>
                      {item.title}
                    </h6>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                    <small className="text-muted">Click to Enlarge</small>
                    <span className="text-primary fw-bold">🔍</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LIGHTBOX MODAL WITH NEXT / PREV / KEYBOARD CONTROLS */}
        {activeLightboxIndex !== null && filteredItems[activeLightboxIndex] && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{
              backgroundColor: "rgba(12, 24, 48, 0.95)",
              zIndex: 99999,
              backdropFilter: "blur(8px)"
            }}
            onClick={() => setActiveLightboxIndex(null)}
          >
            {/* LIGHTBOX CONTENT CONTAINER */}
            <div
              className="position-relative text-center"
              style={{ maxWidth: "1050px", width: "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* CLOSE BUTTON */}
              <button
                className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow fw-bold"
                style={{ width: "42px", height: "42px", zIndex: 10 }}
                onClick={() => setActiveLightboxIndex(null)}
                aria-label="Close Lightbox"
              >
                ✕
              </button>

              {/* IMAGE */}
              <img
                src={filteredItems[activeLightboxIndex].image}
                alt={filteredItems[activeLightboxIndex].title}
                className="img-fluid rounded-4 shadow-lg border"
                style={{ maxHeight: "75vh", objectFit: "contain", width: "auto", maxWidth: "100%" }}
              />

              {/* CAPTION */}
              <div className="text-white mt-3 p-2">
                <span className="badge bg-primary px-3 py-1 rounded-pill mb-1">
                  {filteredItems[activeLightboxIndex].tag}
                </span>
                <h5 className="fw-bold mt-1 mb-1">
                  {filteredItems[activeLightboxIndex].title}
                </h5>
                <small className="text-white-50">
                  Image {activeLightboxIndex + 1} of {filteredItems.length} • Use Arrow Keys or Buttons to Navigate
                </small>
              </div>

              {/* PREV / NEXT NAVIGATION CONTROLS */}
              <button
                className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle shadow fw-bold d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLightboxIndex(
                    (prev) => (prev - 1 + filteredItems.length) % filteredItems.length
                  );
                }}
                aria-label="Previous Image"
              >
                ‹
              </button>

              <button
                className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle shadow fw-bold d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLightboxIndex(
                    (prev) => (prev + 1) % filteredItems.length
                  );
                }}
                aria-label="Next Image"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
