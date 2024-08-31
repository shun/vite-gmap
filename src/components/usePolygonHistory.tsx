import { useState, useEffect } from "react";

export const usePolygonHistory = (
  selectedPolygon: google.maps.Polygon | null,
  setPolygonHistory: React.Dispatch<
    React.SetStateAction<google.maps.LatLngLiteral[][]>
  >
) => {
  const [polygonHistory, setHistory] = useState<
    google.maps.LatLngLiteral[][]
  >([]);

  const saveToHistory = (path: google.maps.LatLngLiteral[]) => {
    setHistory((prevHistory) => [...prevHistory, path]);
    setPolygonHistory((prevHistory) => [...prevHistory, path]);
  };

  const handleUndo = () => {
    if (polygonHistory.length > 1 && selectedPolygon) {
      const lastState = polygonHistory[polygonHistory.length - 2];
      const path = selectedPolygon.getPath();
      path.clear();
      lastState.forEach((latLng) => {
        path.push(new google.maps.LatLng(latLng.lat, latLng.lng));
      });
      setHistory(polygonHistory.slice(0, -1));
    }
  };

  return { saveToHistory, handleUndo };
};
