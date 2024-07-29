import React from 'react';
// import "bootstrap/dist/css/bootstrap.min.css";
import './styles/App.scss';
import VideoComponment from './VideoComponment';
// import VideoComponment2 from './VideoComponment2';
import HeaderComponment from './HeaderComponment';
// import NavBar from './NavBar';
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";


function App() {

  React.useEffect(() => {
    console.log('App Mounted.')
    if (!("Notification" in window)) {
      console.log("Browser does not support Desktop Notification");
      return
    } else {
      console.log("Notifications are supported");
    }

    Notification.requestPermission();
  })

  return (
    <div className="App">
      <header className="App-header">
        <HeaderComponment></HeaderComponment>
      </header>
      {/* <Router>
      <div>
        <NavBar />
        <div className="App-content">
          <Routes>
            <Route path="/addr" element={<VideoComponment />} />
            <Route path="/addr2" element={<VideoComponment2 />} />
          </Routes>
        </div>
      </div>
    </Router> */}
      <div className="App-content">
        <VideoComponment></VideoComponment>

      </div>
    </div>
  );
}

export default App;
