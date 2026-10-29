
// import React, { useEffect, useState } from "react";
// import { Link, useSearchParams } from "react-router-dom";
// import {
//   Building2,
//   Users,
//   ArrowLeft,
//   CalendarCheck,
//   Search
// } from "lucide-react";
// import api from "../api";

// const buildings = [
//   "Central Library",
//   "Block 1",
//   "Block 2",
//   "Block 3",
//   "Block 4"
// ];

// export default function Rooms() {
//   const [rooms, setRooms] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [searchParams, setSearchParams] = useSearchParams();
//   const selectedBuilding = searchParams.get("building") || "";

// //   useEffect(() => {
// //     let active = true;

// //     async function loadRooms() {
// //       try {
// //         const response = await api.get("/rooms");

// //         if (active) {
// //           setRooms(response.data);
// //           setError("");
// //         }
// //       } catch (err) {
// //         if (active) {
// //           setError(
// //             err.response?.data?.message ||
// //             "Unable to load rooms. Check that the backend is running."
// //           );
// //         }
// //       } finally {
// //         if (active) setLoading(false);
// //       }
// //     }

// //     loadRooms();

// //     return () => {
// //       active = false;
// //     };
// //   }, []);



// // useEffect(() => {
// //   const fetchRooms = async () => {
// //     try {
// //       const response = await api.get("/rooms");

// //       console.log("Rooms API response:", response.data);

// //       // Accept an array directly or an array inside an object.
// //       const data = response.data;
// //       const roomList = Array.isArray(data)
// //         ? data
// //         : Array.isArray(data.rooms)
// //           ? data.rooms
// //           : null;

// //       if (!roomList) {
// //         setRooms([]);
// //         setError("The server did not return a list of rooms. Check the backend API.");
// //         return;
// //       }

// //       setRooms(roomList);
// //       setError("");
// //     } catch (err) {
// //       console.error("Failed to fetch rooms:", err);
// //       setRooms([]);
// //       setError(
// //         err.response?.data?.message ||
// //         "Unable to load rooms. Check that the backend is running."
// //       );
// //     }
// //     finally {
// //       setLoading(false);
// //     }
// //   };

// //   fetchRooms();
// // }, []);




// useEffect(() => {
//   async function loadRooms() {
//     setLoading(true);
//     setError("");

//     try {
//       const response = await api.get("/rooms");
//       console.log("Rooms API response:", response.data);

//       const data = response.data;

//       const roomList = Array.isArray(data)
//         ? data
//         : Array.isArray(data.rooms)
//         ? data.rooms
//         : [];

//       setRooms(roomList);

//       if (roomList.length === 0) {
//         setError("No rooms found. Please check the room data in MongoDB.");
//       }
//     } catch (err) {
//       console.error("Failed to load rooms:", err);
//       setError(
//         err.response?.data?.message ||
//           "Could not load rooms. Check that the backend is running."
//       );
//       setRooms([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   loadRooms();
// }, []);




// //   const filteredRooms = rooms.filter((room) => {
// //     const matchesBuilding =
// //       !selectedBuilding || room.building === selectedBuilding;

// //     const matchesSearch =
// //       room.name.toLowerCase().includes(search.toLowerCase()) ||
// //       room.building.toLowerCase().includes(search.toLowerCase());

// //     return matchesBuilding && matchesSearch;
// //   });




// const filteredRooms = rooms.filter((room) => {
//   const roomName = String(room.name || "");
//   const buildingName = String(room.building || "");
//   const searchText = search.trim().toLowerCase();

//   const matchesBuilding =
//     !selectedBuilding || buildingName === selectedBuilding;

//   const matchesSearch =
//     roomName.toLowerCase().includes(searchText) ||
//     buildingName.toLowerCase().includes(searchText);

//   return matchesBuilding && matchesSearch;
// });




//   return (
//     <main className="page-container">
//       <Link to="/" className="text-link">
//         <ArrowLeft size={17} /> Back to Home
//       </Link>

//       <div className="page-heading rooms-page-heading">
//         <span className="eyebrow">CAMPUS DIRECTORY</span>

//         <h1>{selectedBuilding || "Explore All Rooms"}</h1>

//         <p>
//           Choose a room to see its details and submit a booking request.
//         </p>

//         {!loading && !error && (
//           <p className="rooms-summary">
//             {filteredRooms.length} rooms found
//           </p>
//         )}
//       </div>

//       <div className="room-filters">
//         <div className="search-box">
//           <Search size={18} />
//           <input
//             type="text"
//             placeholder="Search rooms..."
//             value={search}
//             onChange={(event) => setSearch(event.target.value)}
//           />
//         </div>

//         <select
//           aria-label="Select building"
//           value={selectedBuilding}
//           onChange={(event) => {
//             const value = event.target.value;

//             if (value) {
//               setSearchParams({ building: value });
//             } else {
//               setSearchParams({});
//             }
//           }}
//         >
//           <option value="">All buildings</option>
//           {buildings.map((name) => (
//             <option key={name} value={name}>
//               {name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {loading && <p>Loading rooms...</p>}

//       {error && <p className="form-error">{error}</p>}

//       {!loading && !error && filteredRooms.length === 0 && (
//         <div className="empty-state">
//           <Building2 size={32} />
//           <h3>No rooms found</h3>
//           <p>
//             Check your search or confirm that the rooms have been added
//             to your MongoDB database.
//           </p>
//         </div>
//       )}

//       {!loading && !error && filteredRooms.length > 0 && (
//         <div className="rooms-grid">
//           {filteredRooms.map((room) => (
//             <article className="room-card" key={room._id}>
//               <div className="room-card-icon">
//                 <Building2 size={25} />
//               </div>

//               <span className="room-building">{room.building}</span>
//               <h3>{room.name}</h3>

//               <p>
//                 {room.description ||
//                   `Room ${room.name} in ${room.building}.`}
//               </p>

//               <div className="room-meta">
//                 <span>
//                   <Users size={16} />
//                   {room.capacity || "Not specified"} seats
//                 </span>
//               </div>

//               {room.equipment?.length > 0 && (
//                 <div className="equipment-list">
//                   {room.equipment.map((item) => (
//                     <span key={item}>{item}</span>
//                   ))}
//                 </div>
//               )}

//               <Link
//                 to={`/book/${room._id}`}
//                 className="btn btn-primary room-book"
//               >
//                 <CalendarCheck size={17} />
//                 Request Booking
//               </Link>
//             </article>
//           ))}
//         </div>
//       )}
//     </main>
//   );
// }










import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Building2,
  Users,
  ArrowLeft,
  CalendarCheck,
  Search,
} from "lucide-react";
import api from "../api";

const buildings = [
  "Central Library",
  "Block 1",
  "Block 2",
  "Block 3",
  "Block 4",
];

const roomNames = {
  "Central Library": [
    "CL 1", "CL 2", "CL 3", "CL 4",
    "CL 5", "CL 6", "CL 7", "CL 8",
  ],
  "Block 1": ["B1 21", "B1 22", "B1 23", "B1 24", "B1 25"],
  "Block 2": ["B2 21", "B2 22", "B2 23", "B2 24", "B2 25"],
  "Block 3": ["B3 21", "B3 22", "B3 23", "B3 24", "B3 25"],
  "Block 4": ["B4 21", "B4 22", "B4 23", "B4 24", "B4 25"],
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedBuilding = searchParams.get("building") || "";
  const selectedRoom = searchParams.get("room") || "";

  useEffect(() => {
    let active = true;

    async function loadRooms() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/rooms");
        console.log("Rooms API response:", response.data);

        const data = response.data;

        const roomList = Array.isArray(data)
          ? data
          : Array.isArray(data?.rooms)
          ? data.rooms
          : null;

        if (!roomList) {
          throw new Error("The server did not return a valid room list.");
        }

        if (active) {
          setRooms(roomList);

          if (roomList.length === 0) {
            setError(
              "No rooms were returned by the server. Check your room records in MongoDB."
            );
          }
        }
      } catch (err) {
        console.error("Failed to load rooms:", err);

        if (active) {
          setRooms([]);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load rooms. Check that your backend is running."
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

  const filteredRooms = rooms.filter((room) => {
    const roomName = String(room.name || "").trim();
    const buildingName = String(room.building || "").trim();
    const searchText = search.trim().toLowerCase();

    const matchesBuilding =
      !selectedBuilding || buildingName === selectedBuilding;

    const matchesRoom =
      !selectedRoom ||
      roomName.toLowerCase() === selectedRoom.toLowerCase();

    const matchesSearch =
      roomName.toLowerCase().includes(searchText) ||
      buildingName.toLowerCase().includes(searchText);

    return matchesBuilding && matchesRoom && matchesSearch;
  });

  function handleBuildingChange(event) {
    const building = event.target.value;
    const params = new URLSearchParams();

    if (building) {
      params.set("building", building);
    }

    // Clear the individual room filter when changing buildings.
    setSearchParams(params);
  }

  return (
    <main className="page-container">
      <Link to="/buildings" className="text-link">
        <ArrowLeft size={17} />
        Back to Buildings
      </Link>

      <div className="page-heading rooms-page-heading">
        <span className="eyebrow">CAMPUS DIRECTORY</span>

        <h1>
          {selectedRoom
            ? `Room ${selectedRoom}`
            : selectedBuilding || "Explore All Rooms"}
        </h1>

        <p>
          Choose a room to see its details and submit a booking request.
        </p>

        {!loading && !error && (
          <p className="rooms-summary">
            {filteredRooms.length} room
            {filteredRooms.length === 1 ? "" : "s"} found
          </p>
        )}
      </div>

      <div className="room-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search rooms or buildings..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          aria-label="Select building"
          value={selectedBuilding}
          onChange={handleBuildingChange}
        >
          <option value="">All buildings</option>
          {buildings.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading rooms...</p>}

      {!loading && error && (
        <div className="empty-state">
          <Building2 size={32} />
          <h3>Unable to display rooms</h3>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filteredRooms.length === 0 && (
        <div className="empty-state">
          <Building2 size={32} />
          <h3>No matching rooms found</h3>
          <p>
            The selected room may not exist in the database yet.
            Check the room name and building values in MongoDB.
          </p>

          <Link to="/buildings" className="btn btn-primary">
            Browse Buildings
          </Link>
        </div>
      )}

      {!loading && !error && filteredRooms.length > 0 && (
        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <article
              className="room-card"
              key={room._id || `${room.building}-${room.name}`}
            >
              <div className="room-card-icon">
                <Building2 size={25} />
              </div>

              <span className="room-building">{room.building}</span>
              <h3>{room.name}</h3>

              <p>
                {room.description ||
                  `Room ${room.name} in ${room.building}.`}
              </p>

              <div className="room-meta">
                <span>
                  <Users size={16} />
                  {room.capacity || "Not specified"} seats
                </span>
              </div>

              {Array.isArray(room.equipment) &&
                room.equipment.length > 0 && (
                  <div className="equipment-list">
                    {room.equipment.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                )}

              <Link
                to={`/book/${room._id}`}
                className="btn btn-primary room-book"
              >
                <CalendarCheck size={17} />
                Request Booking
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
