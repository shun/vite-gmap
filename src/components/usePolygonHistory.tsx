import { useState, Dispatch, SetStateAction } from "react";

export const usePolygonHistory = (
  selectedPolygon: google.maps.Polygon | null,
  polygonPaths: { polygon: google.maps.Polygon; path: google.maps.LatLngLiteral[] }[],
  setPolygonPaths: Dispatch<SetStateAction<{ polygon: google.maps.Polygon; path: google.maps.LatLngLiteral[] }[]>>
) => {
  const [polygonHistory, setHistory] = useState<{ polygon: google.maps.Polygon; path: google.maps.LatLngLiteral[] }[]>(
    []
  );

  const saveToHistory = (polygon: google.maps.Polygon, path: google.maps.LatLngLiteral[]) => {
    setHistory((prevHistory) => [...prevHistory, { polygon, path }]);
    // polygonPaths を更新
    setPolygonPaths((prevPolygonPaths) =>
      prevPolygonPaths.map((polygonPath) => (polygonPath.polygon === polygon ? { polygon, path } : polygonPath))
    );
  };

  const handleUndo = () => {
    if (polygonHistory.length > 1 && selectedPolygon) {
      const lastState = polygonHistory[polygonHistory.length - 2];

      // polygonPaths を更新
      setPolygonPaths((prevPolygonPaths) =>
        prevPolygonPaths.map((polygonPath) =>
          polygonPath.polygon === selectedPolygon ? { ...polygonPath, path: lastState.path } : polygonPath
        )
      );

      // selectedPolygon のパスを更新 (google.maps.LatLng オブジェクトを使用)
      const path = selectedPolygon.getPath();
      path.clear();
      lastState.path.forEach((latLng) => {
        path.push(new google.maps.LatLng(latLng.lat, latLng.lng)); // google.maps.LatLng を使用する
      });

      setHistory(polygonHistory.slice(0, -1));
    } else {
      console.warn("Nothing to undo");
    }
  };

  return { saveToHistory, handleUndo };
};
