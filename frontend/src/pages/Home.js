import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  BookOpen,
  Users,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck
} from "lucide-react";

const buildings = [
  {
    name: "Central Library",
    description:
      "Explore dedicated spaces for individual study, group discussions and academic activities.",
    count: 8,
    icon: BookOpen,
    className: "library-building"
  },
  {
    name: "Block 1",
    description:
      "Find rooms for academic activities, meetings and student collaboration.",
    count: 5,
    icon: Building2,
    className: "block-one"
  },
  {
    name: "Block 2",
    description:
      "Discover campus spaces for classes, discussions and group work.",
    count: 5,
    icon: Building2,
    className: "block-two"
  },
  {
    name: "Block 3",
    description:
      "Explore rooms suitable for workshops, club activities and meetings.",
    count: 5,
    icon: Building2,
    className: "block-three"
  },
  {
    name: "Block 4",
    description:
      "Browse available spaces and submit a request for your next campus activity.",
    count: 5,
    icon: Building2,
    className: "block-four"
  }
];

export default function Home() {
  const totalRooms = buildings.reduce(
    (total, building) => total + building.count,
    0
  );

  return (
    <>
      <main className="campus-home">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              <MapPin size={15} />
              SMART CAMPUS MANAGEMENT
            </span>

            <h1>
              Find your space.
              <br />
              <span>Make it happen.</span>
            </h1>

            <p>
              Discover campus rooms, explore facilities and request
              bookings for your academic activities, meetings and events.
              Everything you need to find your campus space in one place.
            </p>

            <div className="hero-actions">
              <a href="#buildings" className="btn btn-primary">
                Explore Buildings
                <ArrowRight size={17} />
              </a>

              <Link to="/my-bookings" className="btn btn-outline">
                <CalendarCheck size={17} />
                My Bookings
              </Link>
            </div>

            <div className="hero-benefits">
              <span>
                <CheckCircle2 size={17} />
                Easy room discovery
              </span>

              <span>
                <CheckCircle2 size={17} />
                Simple booking requests
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-decoration hero-decoration-one" />
            <div className="hero-decoration hero-decoration-two" />

            <div className="hero-card">
              <div className="hero-card-top">
                <div className="hero-card-icon">
                  <Building2 size={27} />
                </div>

                <span className="status-pill">
                  <span className="status-dot" />
                  Campus Directory
                </span>
              </div>

              <span className="hero-card-label">
                YOUR CAMPUS, CONNECTED
              </span>

              <h3>Your campus, organized.</h3>

              <p className="muted">
                Find a suitable room, submit your request and keep track
                of your booking in one place.
              </p>

              <div className="mini-stat-grid">
                <div>
                  <strong>{buildings.length}</strong>
                  <span>Locations</span>
                </div>

                <div>
                  <strong>{totalRooms}</strong>
                  <span>Campus rooms</span>
                </div>
              </div>

              <a href="#buildings" className="hero-card-link">
                Find your room
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="floating-note">
              <div className="floating-note-icon">
                <CalendarCheck size={22} />
              </div>

              <span>
                <strong>Simple booking</strong>
                <small>Submit a request online</small>
              </span>

              <CheckCircle2
                className="floating-check"
                size={20}
              />
            </div>
          </div>
        </section>

        {/* QUICK STATISTICS */}
        <section className="campus-stats" aria-label="Campus statistics">
          <div className="campus-stat">
            <div className="campus-stat-icon">
              <Building2 size={21} />
            </div>

            <div>
              <strong>{buildings.length}</strong>
              <span>Campus locations</span>
            </div>
          </div>

          <div className="campus-stat">
            <div className="campus-stat-icon">
              <BookOpen size={21} />
            </div>

            <div>
              <strong>{totalRooms}</strong>
              <span>Listed rooms</span>
            </div>
          </div>

          <div className="campus-stat">
            <div className="campus-stat-icon">
              <Clock size={21} />
            </div>

            <div>
              <strong>Easy</strong>
              <span>Booking requests</span>
            </div>
          </div>

          <div className="campus-stat">
            <div className="campus-stat-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <strong>Approval</strong>
              <span>Request-based booking</span>
            </div>
          </div>
        </section>

        {/* BUILDINGS SECTION */}
        <section className="section buildings-section" id="buildings">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CAMPUS DIRECTORY</span>

              <h2>Explore Campus Buildings</h2>

              <p>
                Choose a location to view its rooms. Select a room to
                submit a booking request for approval.
              </p>
            </div>
          </div>

          <div className="building-grid">
            {buildings.map((building) => {
              const Icon = building.icon;

              return (
                <article
                  className={`building-card ${building.className}`}
                  key={building.name}
                >
                  <div className="building-card-top">
                    <div className="building-icon">
                      <Icon size={25} />
                    </div>

                    <span className="room-count">
                      {building.count}{" "}
                      {building.count === 1 ? "ROOM" : "ROOMS"}
                    </span>
                  </div>

                  <h3>{building.name}</h3>

                  <p>{building.description}</p>

                  <div className="building-card-footer">
                    <span className="building-room-info">
                      <Users size={15} />
                      {building.count} individual rooms
                    </span>

                    <Link
                      to={`/buildings?building=${encodeURIComponent(
                        building.name
                      )}`}
                      className="btn btn-primary explore-button"
                      aria-label={`Explore rooms in ${building.name}`}
                    >
                      Explore Rooms
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section how-section" id="how-it-works">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THREE SIMPLE STEPS</span>

              <h2>How CampusSpaces works</h2>

              <p>
                From discovering a room to submitting your booking
                request, the process is simple.
              </p>
            </div>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01</span>

              <div className="building-icon">
                <Building2 size={23} />
              </div>

              <h3>Choose a building</h3>

              <p>
                Select the Central Library or any of the four campus
                blocks to see its rooms.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">02</span>

              <div className="building-icon">
                <CalendarCheck size={23} />
              </div>

              <h3>Select your room</h3>

              <p>
                Explore room details and open the booking form for the
                space you want.
              </p>
            </article>

            <article className="step-card">
              <span className="step-number">03</span>

              <div className="building-icon">
                <CheckCircle2 size={23} />
              </div>

              <h3>Request approval</h3>

              <p>
                Enter your date, time and purpose, then submit your
                request for review.
              </p>
            </article>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="campus-cta">
          <div className="campus-cta-icon">
            <CalendarCheck size={27} />
          </div>

          <div className="campus-cta-content">
            <h2>Ready to find your space?</h2>

            <p>
              Explore campus locations and choose the room that suits
              your next activity.
            </p>
          </div>

          <a href="#buildings" className="btn btn-light">
            Browse Rooms
            <ArrowRight size={17} />
          </a>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Building2 size={21} />
          </span>

          Campus<span className="brand-accent">Spaces</span>
        </Link>

        <p>Making campus room management simpler.</p>

        <a href="#buildings" className="footer-link">
          Explore locations
          <ArrowRight size={15} />
        </a>
      </footer>
    </>
  );
}
