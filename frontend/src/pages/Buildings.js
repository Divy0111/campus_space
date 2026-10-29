
// import React from "react";
// import { Link } from "react-router-dom";
// import {
//   Building2,
//   ArrowRight,
//   MapPin,
//   ArrowLeft,
// } from "lucide-react";

// const buildings = [
//   {
//     name: "Central Library",
//     rooms: ["CL 1", "CL 2", "CL 3", "CL 4", "CL 5", "CL 6", "CL 7", "CL 8"],
//   },
//   {
//     name: "Block 1",
//     rooms: ["B1 21", "B1 22", "B1 23", "B1 24", "B1 25"],
//   },
//   {
//     name: "Block 2",
//     rooms: ["B2 21", "B2 22", "B2 23", "B2 24", "B2 25"],
//   },
//   {
//     name: "Block 3",
//     rooms: ["B3 21", "B3 22", "B3 23", "B3 24", "B3 25"],
//   },
//   {
//     name: "Block 4",
//     rooms: ["B4 21", "B4 22", "B4 23", "B4 24", "B4 25"],
//   },
// ];

// export default function Buildings() {
//   return (
//     <main className="page-container buildings-page">
//       <Link to="/" className="text-link">
//         <ArrowLeft size={17} />
//         Back to Home
//       </Link>

//       <div className="page-heading">
//         <span className="eyebrow">CAMPUS DIRECTORY</span>
//         <h1>Explore Campus Rooms</h1>
//         <p>
//           Select a building and choose the room you want to book.
//         </p>
//         <p className="rooms-summary">
//           5 buildings · 28 rooms available to explore
//         </p>
//       </div>

//       <div className="buildings-grid">
//         {buildings.map((building) => (
//           <section className="building-card" key={building.name}>
//             <div className="building-card-heading">
//               <div className="building-icon">
//                 <Building2 size={25} />
//               </div>

//               <span className="building-room-count">
//                 {building.rooms.length} rooms
//               </span>
//             </div>

//             <h2>{building.name}</h2>

//             <p className="building-description">
//               Choose a room below to view its booking details.
//             </p>

//             <div className="subroom-list">
//               {building.rooms.map((roomName) => (
//                 <div className="subroom-row" key={roomName}>
//                   <span className="subroom-name">
//                     <MapPin size={16} />
//                     {roomName}
//                   </span>

//                   <Link
//                     className="subroom-select"
//                     to={`/rooms?building=${encodeURIComponent(
//                       building.name
//                     )}&room=${encodeURIComponent(roomName)}`}
//                   >
//                     Select <ArrowRight size={15} />
//                   </Link>
//                 </div>
//               ))}
//             </div>

//             <Link
//               className="building-view-all"
//               to={`/rooms?building=${encodeURIComponent(building.name)}`}
//             >
//               View all rooms in {building.name}
//               <ArrowRight size={16} />
//             </Link>
//           </section>
//         ))}
//       </div>
//     </main>
//   );
// }







import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  MapPin,
  RefreshCw,
} from "lucide-react";
import api from "../api";

const buildingData = [
  {
    name: "Central Library",
    rooms: ["CL 1", "CL 2", "CL 3", "CL 4", "CL 5", "CL 6", "CL 7", "CL 8"],
  },
  {
    name: "Block 1",
    rooms: ["B1 21", "B1 22", "B1 23", "B1 24", "B1 25"],
  },
  {
    name: "Block 2",
    rooms: ["B2 21", "B2 22", "B2 23", "B2 24", "B2 25"],
  },
  {
    name: "Block 3",
    rooms: ["B3 21", "B3 22", "B3 23", "B3 24", "B3 25"],
  },
  {
    name: "Block 4",
    rooms: ["B4 21", "B4 22", "B4 23", "B4 24", "B4 25"],
  },
];

export default function Buildings() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedBuilding = searchParams.get("building") || "";

  const currentBuilding = useMemo(
    () => buildingData.find((building) => building.name === selectedBuilding),
    [selectedBuilding]
  );

  useEffect(() => {
    let active = true;

    async function loadRooms() {
      setLoading(true);
      setError("");

      try {
        // The backend server mounts room routes at /api/rooms.
        // Your api.js should have baseURL set to http://localhost:5000/api.
        const response = await api.get("/rooms");
        const data = response.data;

        const roomList = Array.isArray(data)
          ? data
          : Array.isArray(data?.rooms)
          ? data.rooms
          : null;

        if (!roomList) {
          throw new Error("The server returned an invalid room list.");
        }

        if (active) {
          setRooms(roomList);
        }
      } catch (err) {
        console.error("Failed to load rooms:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load rooms. Please check that the backend is running."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRooms();

    return () => {
      active = false;
    };
  }, []);

  const buildingRooms = useMemo(() => {
    if (!selectedBuilding) return [];

    return rooms
      .filter(
        (room) =>
          String(room.building || "").trim() === selectedBuilding &&
          room.isActive !== false
      )
      .sort((a, b) => {
        const aIndex = currentBuilding?.rooms.indexOf(a.name) ?? -1;
        const bIndex = currentBuilding?.rooms.indexOf(b.name) ?? -1;

        return aIndex - bIndex;
      });
  }, [rooms, selectedBuilding, currentBuilding]);

  function chooseBuilding(name) {
    setSearchParams({ building: name });
  }

  function backToBuildings() {
    setSearchParams({});
  }

  async function retryLoadingRooms() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/rooms");
      const data = response.data;

      const roomList = Array.isArray(data)
        ? data
        : Array.isArray(data?.rooms)
        ? data.rooms
        : null;

      if (!roomList) {
        throw new Error("The server returned an invalid room list.");
      }

      setRooms(roomList);
    } catch (err) {
      console.error("Failed to reload rooms:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load rooms. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-container buildings-page">
      <Link to="/" className="text-link">
        <ArrowLeft size={17} />
        Back to Home
      </Link>

      <div className="page-heading">
        <span className="eyebrow">CAMPUSSPACE DIRECTORY</span>

        <h1>
          {currentBuilding
            ? currentBuilding.name
            : selectedBuilding
            ? "Building Not Found"
            : "Explore Campus Rooms"}
        </h1>

        <p>
          {currentBuilding
            ? `Choose a room in ${currentBuilding.name} and request a booking.`
            : selectedBuilding
            ? "The selected building is not in the campus directory."
            : "Select a building to explore its individual rooms."}
        </p>
      </div>

      {!selectedBuilding && (
        <div className="building-choice-grid">
          {buildingData.map((building) => (
            <button
              type="button"
              className="building-choice-card"
              key={building.name}
              onClick={() => chooseBuilding(building.name)}
            >
              <div className="building-choice-icon">
                <Building2 size={28} />
              </div>

              <h2>{building.name}</h2>

              <p>{building.rooms.length} rooms</p>

              <span className="building-choice-action">
                Explore rooms <ArrowRight size={17} />
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedBuilding && (
        <>
          <button
            type="button"
            className="text-link building-back-button"
            onClick={backToBuildings}
          >
            <ArrowLeft size={17} />
            All buildings
          </button>

          {!currentBuilding && (
            <div className="empty-state">
              <h3>Building not found</h3>
              <p>Please select a building from the campus directory.</p>
            </div>
          )}

          {currentBuilding && loading && (
            <div className="empty-state">
              <p>Loading rooms...</p>
            </div>
          )}

          {currentBuilding && !loading && error && (
            <div className="empty-state">
              <h3>Unable to load rooms</h3>
              <p>{error}</p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={retryLoadingRooms}
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          )}

          {currentBuilding &&
            !loading &&
            !error &&
            buildingRooms.length === 0 && (
              <div className="empty-state">
                <Building2 size={32} />

                <h3>No rooms found for {selectedBuilding}</h3>

                <p>
                  No active room records were returned for this building.
                  Check that the 28 individual rooms have been added to
                  MongoDB and that each room has the correct building name.
                </p>
              </div>
            )}

          {currentBuilding &&
            !loading &&
            !error &&
            buildingRooms.length > 0 && (
              <>
                <p className="room-results-count">
                  Showing {buildingRooms.length} room
                  {buildingRooms.length !== 1 ? "s" : ""} in{" "}
                  {selectedBuilding}
                </p>

                <div className="individual-rooms-grid">
                  {buildingRooms.map((room) => (
                    <article
                      className="individual-room-card"
                      key={room._id}
                    >
                      <div className="individual-room-icon">
                        <MapPin size={22} />
                      </div>

                      <span className="individual-room-building">
                        {room.building}
                      </span>

                      <h2>{room.name}</h2>

                      <p>
                        {room.description ||
                          `Room ${room.name} in ${room.building}.`}
                      </p>

                      <div className="individual-room-capacity">
                        Capacity:{" "}
                        {room.capacity ?? "Not specified"} seats
                      </div>

                      <Link
                        to={`/book/${room._id}`}
                        className="btn btn-primary individual-room-book"
                      >
                        <CalendarCheck size={17} />
                        Request Booking
                      </Link>
                    </article>
                  ))}
                </div>
              </>
            )}
        </>
      )}
    </main>
  );
}
