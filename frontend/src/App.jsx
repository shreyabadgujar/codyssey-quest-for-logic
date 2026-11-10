import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WorldMap from "./pages/WorldMap.jsx";
import IslandDetails from "./pages/IslandDetails.jsx";
import Mission from "./pages/Mission.jsx";
import TreasureHunt from "./pages/TreasureHunt.jsx";
import AvatarCustomizer from "./pages/AvatarCustomizer.jsx";
import Shop from "./pages/Shop.jsx";
import Profile from "./pages/Profile.jsx";
import Achievements from "./pages/Achievements.jsx";
import Puzzles from "./pages/Puzzles.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route element={<MainLayout />}>
        {/* Game routes require login. Server still enforces unlock state. */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="map" element={<WorldMap />} />
          <Route path="islands/:islandId" element={<IslandDetails />} />
          <Route path="missions/:missionId" element={<Mission />} />
          <Route path="missions/:missionId/hunt" element={<TreasureHunt />} />
          <Route path="avatar" element={<AvatarCustomizer />} />
          <Route path="shop" element={<Shop />} />
          <Route path="profile" element={<Profile />} />
          <Route path="puzzles" element={<Puzzles />} />
          <Route path="puzzles/:id" element={<Puzzles />} />
          <Route path="achievements" element={<Achievements />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
