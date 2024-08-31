import { useEffect } from "react";

export const useDrawingManager = (
  map: google.maps.Map | null,
  markers: google.maps.marker.AdvancedMarkerElement[],
  toast: any,
  setSelectedPolygon: (polygon: google.maps.Polygon | null) => void,
  setPolygons: React.Dispatch<React.SetStateAction<google.maps.Polygon[]>>,
  labels: { [key: string]: google.maps.InfoWindow },
  setLabels: React.Dispatch<
    React.SetStateAction<{ [key: string]: google.maps.InfoWindow }>
  >,
  setPolygonHistory: React.Dispatch<
    React.SetStateAction<google.maps.LatLngLiteral[][]>
  >,
  polygonColor: string
) => {
  useEffect(() => {
    if (!map) return;

    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ["polygon"],
      },
      polygonOptions: {
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        editable: true,
      },
    });

    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, "polygoncomplete", (polygon) => {
      polygon.setEditable(true);
      polygon.setOptions({ draggable: true });

      // ポリゴンのセットアップと履歴管理
      // ...

      setPolygons((prevPolygons) => [...prevPolygons, polygon]);

      // その後の処理を追加
    });
  }, [map, markers, toast, setSelectedPolygon, setPolygons, labels, setLabels, setPolygonHistory, polygonColor]);
};
