import { useEffect, useState } from "react";

export const useDrawingManager = (
  map: google.maps.Map | null,
  markers: google.maps.marker.AdvancedMarkerElement[],
  toast: any,
  setSelectedPolygon: (polygon: google.maps.Polygon | null) => void,
  polygonPaths: { polygon: google.maps.Polygon; path: google.maps.LatLngLiteral[] }[],
  setPolygonPaths: React.Dispatch<
    React.SetStateAction<{ polygon: google.maps.Polygon; path: google.maps.LatLngLiteral[] }[]>
  >,
  labels: { [key: string]: google.maps.InfoWindow },
  setLabels: React.Dispatch<
    React.SetStateAction<{ [key: string]: google.maps.InfoWindow }>
  >,
  saveToHistory: (
    polygon: google.maps.Polygon,
    path: google.maps.LatLngLiteral[]
  ) => void,
  polygonColor: string
) => {
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

  useEffect(() => {
    if (!map || drawingManager) return;

    const newDrawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ["polygon"],
      },
      polygonOptions: {
        strokeColor: polygonColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: polygonColor,
        fillOpacity: 0.35,
        editable: true,
      },
    });

    newDrawingManager.setMap(map);
    setDrawingManager(newDrawingManager);

    google.maps.event.addListener(newDrawingManager, "polygoncomplete", (polygon) => {
      let isDragging = false;

      // ドラッグ開始時に isDragging を true に設定
      google.maps.event.addListener(polygon, "dragstart", () => {
        isDragging = true;
      });

      polygon.setEditable(true);
      polygon.setOptions({ draggable: true });

      const initialPath = polygon.getPath().getArray().map((latlng) => ({
        lat: latlng.lat(),
        lng: latlng.lng(),
      }));

      // polygonPaths を更新
      setPolygonPaths((prevPolygonPaths) => [
        ...prevPolygonPaths,
        { polygon, path: initialPath },
      ]);

      saveToHistory(polygon, initialPath); // polygonを渡す

      // ドラッグ終了時に履歴を保存
      google.maps.event.addListener(polygon, "dragend", () => {
        isDragging = false;
        const newPath = polygon.getPath().getArray().map((latlng) => ({
          lat: latlng.lat(),
          lng: latlng.lng(),
        }));
        saveToHistory(polygon, newPath); // polygonを渡す

        // polygonPaths を更新
        setPolygonPaths((prevPolygonPaths) =>
          prevPolygonPaths.map((polygonPath) =>
            polygonPath.polygon === polygon ? { polygon, path: newPath } : polygonPath
          )
        );
      });

      // 頂点編集時に履歴を保存
      google.maps.event.addListener(polygon.getPath(), "set_at", () => {
        if (isDragging) return;

        const newPath = polygon.getPath().getArray().map((latlng) => ({
          lat: latlng.lat(),
          lng: latlng.lng(),
        }));
        saveToHistory(polygon, newPath); // polygonを渡す

        // polygonPaths を更新
        setPolygonPaths((prevPolygonPaths) =>
          prevPolygonPaths.map((polygonPath) =>
            polygonPath.polygon === polygon ? { polygon, path: newPath } : polygonPath
          )
        );
      });

      google.maps.event.addListener(polygon.getPath(), "insert_at", () => {
        const newPath = polygon.getPath().getArray().map((latlng) => ({
          lat: latlng.lat(),
          lng: latlng.lng(),
        }));
        saveToHistory(polygon, newPath); // polygonを渡す

        // polygonPaths を更新
        setPolygonPaths((prevPolygonPaths) =>
          prevPolygonPaths.map((polygonPath) =>
            polygonPath.polygon === polygon ? { polygon, path: newPath } : polygonPath
          )
        );
      });

      // ポリゴンがクリックされた時の処理
      google.maps.event.addListener(polygon, "click", () => {
        setSelectedPolygon(polygon);
      });
    });
  }, [map]);

  useEffect(() => {
    if (drawingManager) {
      drawingManager.setOptions({
        polygonOptions: {
          strokeColor: polygonColor,
          fillColor: polygonColor,
        },
      });
    }
  }, [polygonColor, drawingManager]);
};
