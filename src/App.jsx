import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { initializeScene } from './hooks/threeScene';
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";

const assetObject = [
  {
    name: "Porsche",
    assetName: "models/porche.glb",
  },
  {
    name: "Police",
    assetName: "models/policeTwo.glb",
  },
  {
    name: "BMW",
    assetName: "models/bmw.glb",
  },
];

function App() {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

  useEffect(() => {
    if (canvasRef.current) {
      const { switchModel, cleanup } = initializeScene(canvasRef.current, assetObject, currentAssetIndex);
      sceneRef.current = { switchModel, cleanup };

      return cleanup; // Clean up resources on component unmount or re-render
    }
  }, [currentAssetIndex]);

  const handleModelSwitch = async () => {
    if (sceneRef.current) {
      setCurrentAssetIndex((prevIndex) => (prevIndex + 1) % assetObject.length);
      await sceneRef.current.switchModel(currentAssetIndex);
    }
  };

  const handleModelSwitchBackWard = async () => {
    if (sceneRef.current) {
      setCurrentAssetIndex((prevIndex) => (prevIndex - 1) % assetObject.length);
      await sceneRef.current.switchModel(currentAssetIndex);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="webgl"></canvas>
      <nav>
        <a href="/">CAR STORE</a>
        <ul>
          <li>Lorem 1</li>
          <li>Lorem 2</li>
        </ul>
      </nav>
      <h1 className='title'>{assetObject[currentAssetIndex].name}</h1>
      <div className='storeControls'>
        <MdKeyboardArrowLeft onClick={handleModelSwitchBackWard} />
        <MdKeyboardArrowRight onClick={handleModelSwitch} />
      </div>
    </>
  );
}

export default App;