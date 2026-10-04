import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ThemeWrapperContext from "./contexts/ThemeContext";
import Home from "./features/home";
import Login from "./features/login";
import RecoveryPassword from "./features/recoveryPassword";
import Register from "./features/register";
import Dashboard from "./features/dashboard";
import Insulina from "./features/insulina";


function App() {
  return (
    <ThemeWrapperContext>
      <Router>
        <Routes>
          <Route index element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/recoveryPassword' element={<RecoveryPassword />} />
          <Route path='/register' element={<Register />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/insulina' element={<Insulina />} />

        </Routes>
      </Router>
    </ThemeWrapperContext>
  );
}

export default App;