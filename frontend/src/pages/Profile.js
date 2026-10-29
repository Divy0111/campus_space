
// import React, { useEffect, useState } from "react";
// import api from "../api";
// import { useAuth } from "../AuthContext";

// export default function Profile() {
//   const { user } = useAuth();
//   const [bookings, setBookings] = useState([]);
//   const [message, setMessage] = useState("");

//   async function loadBookings() {
//     try {
//       const res = await api.get("/bookings");
//       setBookings(res.data.bookings);
//     } catch {
//       setMessage("Unable to load bookings.");
//     }
//   }

//   useEffect(() => {
//     loadBookings();
//   }, []);

//   async function updateStatus(id, status) {
//     try {
//       await api.patch(`/bookings/${id}/status`, { status });
//       setMessage(`Booking ${status}.`);
//       await loadBookings();
//     } catch (error) {
//       setMessage(error.response?.data?.message || "Update failed.");
//     }
//   }

//   async function cancelBooking(id) {
//     try {
//       await api.patch(`/bookings/${id}/cancel`);
//       setMessage("Booking cancelled.");
//       await loadBookings();
//     } catch (error) {
//       setMessage(error.response?.data?.message || "Cancellation failed.");
//     }
//   }

//   if (!user) return null;

//   return (
//     <main className="profile-page">
//       <span className="eyebrow">
//         {user.role === "admin" ? "ADMINISTRATION" : "YOUR ACCOUNT"}
//       </span>
//       <h1>{user.role === "admin" ? "Admin dashboard" : "My profile"}</h1>

//       <section className="profile-card">
//         <div className="avatar large-avatar">
//           {user.name?.charAt(0).toUpperCase()}
//         </div>
//         <div>
//           <h2>{user.name}</h2>
//           <p>{user.email}</p>
//           <span className="role-tag">{user.role}</span>
//         </div>
//       </section>

//       <section className="profile-card details-card">
//         <h2>Profile details</h2>
//         <p><strong>Department:</strong> {user.department || "Not provided"}</p>
//         <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
//         <p><strong>Account type:</strong> {user.role}</p>
//       </section>

//       <section className="booking-history">
//         <div className="section-heading">
//           <div>
//             <span className="eyebrow">
//               {user.role === "admin" ? "ALL RESERVATIONS" : "YOUR ACTIVITY"}
//             </span>
//             <h2>
//               {user.role === "admin" ? "Manage bookings" : "My bookings"}
//             </h2>
//           </div>
//           <button className="outline-btn" onClick={loadBookings}>
//             Refresh
//           </button>
//         </div>

//         {message && <p className="form-message">{message}</p>}

//         {bookings.length === 0 && <p>No bookings found.</p>}

//         {bookings.map((booking) => (
//           <article className="booking-row" key={booking._id}>
//             <div>
//               <h3>{booking.room}</h3>
//               <p>{booking.date} · {booking.startTime}–{booking.endTime}</p>
//               <p>{booking.purpose} · {booking.attendees} attendees</p>
//               {user.role === "admin" && booking.user && (
//                 <p>
//                   Requested by: {booking.user.name} ({booking.user.email})
//                 </p>
//               )}
//               <span className={`status status-${booking.status}`}>
//                 {booking.status}
//               </span>
//             </div>

//             <div className="booking-actions">
//               {user.role === "admin" && booking.status === "pending" && (
//                 <>
//                   <button
//                     className="primary-btn"
//                     onClick={() => updateStatus(booking._id, "approved")}
//                   >
//                     Approve
//                   </button>
//                   <button
//                     className="outline-btn"
//                     onClick={() => updateStatus(booking._id, "rejected")}
//                   >
//                     Reject
//                   </button>
//                 </>
//               )}

//               {(booking.status === "pending" ||
//                 booking.status === "approved") && (
//                 <button
//                   className="outline-btn"
//                   onClick={() => cancelBooking(booking._id)}
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </article>
//         ))}
//       </section>
//     </main>
//   );
// }





import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function Profile() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      setMessage("");

      const res = await api.get("/bookings");

      const bookingList = Array.isArray(res.data.bookings)
        ? res.data.bookings
        : [];

      setBookings(bookingList);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  async function updateStatus(id, status) {
    try {
      setActionLoading(id);
      setMessage("");

      await api.patch(`/bookings/${id}/status`, { status });

      setMessage(
        status === "approved"
          ? "Booking approved successfully."
          : "Booking rejected successfully."
      );

      await loadBookings();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to update booking status."
      );
    } finally {
      setActionLoading("");
    }
  }

  async function cancelBooking(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setMessage("");

      await api.patch(`/bookings/${id}/cancel`);

      setMessage("Booking cancelled successfully.");

      await loadBookings();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to cancel booking."
      );
    } finally {
      setActionLoading("");
    }
  }

  // Safely handle populated room objects and room IDs.
  function getRoomName(room) {
    if (!room) return "Room unavailable";

    if (typeof room === "string") {
      return room;
    }

    if (typeof room === "object") {
      return room.name || "Room unavailable";
    }

    return "Room unavailable";
  }

  function getRoomBuilding(room) {
    if (room && typeof room === "object") {
      return room.building || "";
    }

    return "";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Date not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (!user) return null;

  return (
    <main className="profile-page">
      <span className="eyebrow">
        {user.role === "admin" ? "ADMINISTRATION" : "YOUR ACCOUNT"}
      </span>

      <h1>
        {user.role === "admin" ? "Admin dashboard" : "My profile"}
      </h1>

      {/* Profile information */}
      <section className="profile-card">
        <div className="avatar large-avatar">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div>
          <h2>{user.name || "CampusSpace User"}</h2>
          <p>{user.email || "Email not available"}</p>
          <span className="role-tag">{user.role || "student"}</span>
        </div>
      </section>

      {/* Account details */}
      <section className="profile-card details-card">
        <h2>Profile details</h2>

        <p>
          <strong>Department:</strong>{" "}
          {user.department || "Not provided"}
        </p>

        <p>
          <strong>Phone:</strong> {user.phone || "Not provided"}
        </p>

        <p>
          <strong>Account type:</strong> {user.role || "student"}
        </p>
      </section>

      {/* Booking history */}
      <section className="booking-history">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {user.role === "admin"
                ? "ALL RESERVATIONS"
                : "YOUR ACTIVITY"}
            </span>

            <h2>
              {user.role === "admin"
                ? "Manage bookings"
                : "My bookings"}
            </h2>
          </div>

          <button
            type="button"
            className="outline-btn"
            onClick={loadBookings}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}

        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          bookings.map((booking) => {
            const roomName = getRoomName(booking.room);
            const building = getRoomBuilding(booking.room);
            const isActionLoading = actionLoading === booking._id;

            return (
              <article className="booking-row" key={booking._id}>
                <div className="booking-information">
                  <h3>{roomName}</h3>

                  {building && <p>Building: {building}</p>}

                  {booking.room &&
                    typeof booking.room === "object" &&
                    booking.room.capacity != null && (
                      <p>
                        Room capacity: {booking.room.capacity} people
                      </p>
                    )}

                  <p>
                    <strong>Date:</strong> {formatDate(booking.date)}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {booking.startTime || "—"}–{booking.endTime || "—"}
                  </p>

                  <p>
                    <strong>Purpose:</strong>{" "}
                    {booking.purpose || "Not specified"}
                  </p>

                  <p>
                    <strong>Attendees:</strong>{" "}
                    {booking.attendees ?? "—"}
                  </p>

                  {user.role === "admin" && booking.user && (
                    <p>
                      <strong>Requested by:</strong>{" "}
                      {typeof booking.user === "object"
                        ? `${booking.user.name || "Unknown user"}${
                            booking.user.email
                              ? ` (${booking.user.email})`
                              : ""
                          }`
                        : "User details unavailable"}
                    </p>
                  )}

                  <span
                    className={`status status-${booking.status || "pending"}`}
                  >
                    {booking.status || "pending"}
                  </span>
                </div>

                <div className="booking-actions">
                  {user.role === "admin" &&
                    booking.status === "pending" && (
                      <>
                        <button
                          type="button"
                          className="primary-btn"
                          disabled={isActionLoading}
                          onClick={() =>
                            updateStatus(booking._id, "approved")
                          }
                        >
                          {isActionLoading ? "Please wait..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          className="outline-btn"
                          disabled={isActionLoading}
                          onClick={() =>
                            updateStatus(booking._id, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}

                  {booking.status !== "cancelled" &&
                    booking.status !== "rejected" &&
                    (booking.status === "pending" ||
                      booking.status === "approved") && (
                      <button
                        type="button"
                        className="outline-btn"
                        disabled={isActionLoading}
                        onClick={() => cancelBooking(booking._id)}
                      >
                        Cancel booking
                      </button>
                    )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}