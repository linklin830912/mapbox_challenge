// frontend/src/App.tsx
import React, { useEffect, useState } from "react";
import 'mapbox-gl/dist/mapbox-gl.css';
import MapComponent from "./components/MapComponent";
import { getHelloFromServer } from "./api/pin/getHelloFromServer";

const App: React.FC = () => {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {    
    getHelloFromServer()
      .then((value) => {
        setMessage(value.message)})
      .catch((error) => {
        console.error('API error:', error);
      });
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", display:"flex", flexDirection:"column", position:"relative"}}>
      <div style={{ maxWidth:"500px",height:"fit", display:"flex", flexDirection:"column", zIndex:10, color:"white", padding:10}}>
        <h1 style={{ width:"fit", margin:0}}>MAP BOX CHALLENGE</h1>
        <h2 style={{ width:"fit", margin:0}}>{message || "Loading..."}</h2>
      </div>
      
      <div style={{position:"absolute", top:"0", left:"0", width: "100vw", height: "100vh"}}><MapComponent/></div>
    </div>
  );
};

export default App;
