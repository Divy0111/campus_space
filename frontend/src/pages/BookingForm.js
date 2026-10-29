import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import api from "../api";

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function BookingForm() {
  const { roomId } = useParams();

  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "1",
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRoom() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/rooms/${encodeURIComponent(roomId || "")}`
        );

        // The API returns { success: true, room: {...} }.
        const roomData = response.data?.room || response.data;

        if (!roomData?._id) {
          throw new Error("The server did not return valid room details.");
        }

        if (active) {
          setRoom(roomData);
        }
      } catch (err) {
        if (active) {
          setRoom(null);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load this room. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (roomId) {
      loadRoom();
    } else {
      setError("Room ID is missing. Please select a room again.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [roomId]);

  function update(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!room?._id) {
      setError("Room details are missing. Please select the room again.");
      return;
    }

    const name = form.requesterName.trim();
    const email = form.requesterEmail.trim();
    const purpose = form.purpose.trim();
    const attendees = Number(form.attendees);

    if (!name || !email || !purpose) {
      setError("Please fill in your name, email, and booking purpose.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.date || form.date < getToday()) {
      setError("Please select today or a future booking date.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Please select both the start time and end time.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("End time must be later than start time.");
      return;
    }

    if (
      !Number.isInteger(attendees) ||
      attendees < 1 ||
      attendees > Number(room.capacity)
    ) {
      setError(
        `Number of attendees must be between 1 and ${room.capacity}.`
      );
      return;
    }

    setBusy(true);

    try {
      const payload = {
        roomId: room._id,
        requesterName: name,
        requesterEmail: email,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose,
        attendees,
      };

      const response = await api.post("/bookings", payload);

      setSuccess(
        response.data?.message ||
          "Your booking request was sent for admin approval."
      );
    } catch (err) {
      console.error(
        "Booking request failed:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (err.response
            ? `Booking failed (HTTP ${err.response.status}). Check the booking details and backend validation.`
            : "Cannot connect to the booking server. Check that your backend is running.")
      );
    } finally {
      setBusy(false);
    }
  }

  const roomsLink = room
    ? `/buildings?building=${encodeURIComponent(room.building)}`
    : "/buildings";

  if (loading) {
    return <main className="page-container">Loading room...</main>;
  }

  if (!room) {
    return (
      <main className="page-container">
        <p className="form-error">{error || "Room not found."}</p>
        <Link to="/buildings" className="text-link">
          <ArrowLeft size={17} /> Back to rooms
        </Link>
      </main>
    );
  }

  return (
    <main className="page-container booking-form-page">
      <Link to={roomsLink} className="text-link">
        <ArrowLeft size={17} /> Back to {room.building}
      </Link>

      <section className="booking-form-card">
        <span className="eyebrow">ROOM BOOKING REQUEST</span>

        <h1>Request {room.name}</h1>

        <p>
          {room.building} · Capacity: {room.capacity} seats
        </p>

        {success ? (
          <div className="booking-success" role="status">
            <CalendarCheck size={32} />
            <h2>Request submitted</h2>
            <p>{success}</p>
            <p>Your request is awaiting admin review.</p>

            <Link className="btn btn-primary" to={roomsLink}>
              Back to rooms
            </Link>
          </div>
        ) : (
          <form className="booking-form" onSubmit={submit} noValidate>
            <label>
              Full name
              <input
                type="text"
                name="requesterName"
                value={form.requesterName}
                onChange={update}
                autoComplete="name"
                maxLength={100}
                required
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                name="requesterEmail"
                value={form.requesterEmail}
                onChange={update}
                autoComplete="email"
                maxLength={254}
                required
              />
            </label>

            <label>
              Booking date
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={update}
                min={getToday()}
                required
              />
            </label>

            <div className="booking-time-grid">
              <label>
                Start time
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={update}
                  required
                />
              </label>

              <label>
                End time
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={update}
                  min={form.startTime || undefined}
                  required
                />
              </label>
            </div>

            <label>
              Purpose of booking
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={update}
                rows={3}
                maxLength={500}
                required
              />
            </label>

            <label>
              Number of attendees
              <input
                type="number"
                name="attendees"
                value={form.attendees}
                onChange={update}
                min={1}
                max={room.capacity}
                step={1}
                required
              />
              <small>Maximum capacity: {room.capacity} people</small>
            </label>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="btn btn-primary booking-submit"
              type="submit"
              disabled={busy}
            >
              <CalendarCheck size={17} />
              {busy ? "Submitting..." : "Submit for Approval"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
