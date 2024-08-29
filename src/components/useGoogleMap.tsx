import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import type {Pin} from "./useSpreadsheetData"

export const useGoogleMap = (center: google.maps.LatLngLiteral, pins: Pin[], toast: any) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<google.maps.Polygon | null>(null);
  const [markerElements, setMarkerElements] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
      libraries: ["geometry", "drawing", "marker"],
    });

    loader
      .load()
      .then(() => {
        const map = new google.maps.Map(mapRef.current as HTMLElement, {
          center,
          zoom: 15,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID!,
        });

        setMapInstance(map);
        const infoWindow = new google.maps.InfoWindow();
        const markers = createMarkers(map, pins, infoWindow);
        setMarkerElements(markers);

        setupDrawingManager(map, markers, toast, setSelectedPolygon);
      })
      .catch(console.error);
  }, [center, pins, toast]);

  const createMarkers = (
    map: google.maps.Map,
    pins: Pin[],
    infoWindow: google.maps.InfoWindow
  ): google.maps.marker.AdvancedMarkerElement[] => {
    return pins.map((pin) => {
      const pinElement = new google.maps.marker.PinElement({
        scale: 1.0,
        background: "#e44631",
        borderColor: "#b01500",
        glyphColor: "#ffffff",
        glyph: pin.delivery_order,
      });

      const markerElement = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: pin.lat, lng: pin.lng },
        map,
        title: pin.name,
        content: pinElement.element,
      });

      markerElement.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(`<div>${pin.name}<br>${pin.course}</div>`);
        infoWindow.open({
          anchor: markerElement,
          map,
          shouldFocus: false,
        });
      });

      return markerElement;
    });
  };

  const setupDrawingManager = (
    map: google.maps.Map,
    markers: google.maps.marker.AdvancedMarkerElement[],
    toast: any,
    setSelectedPolygon: (polygon: google.maps.Polygon | null) => void
  ) => {
    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
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
      polygon.setOptions({draggable: true});
      polygon.addListener("click", () => setSelectedPolygon(polygon));

      const pinsInsidePolygon = markers.filter((marker) =>
        google.maps.geometry.poly.containsLocation(marker.position, polygon)
      );

      if (pinsInsidePolygon.length > 0) {
        const pinNames = pinsInsidePolygon.map((marker) => marker.title).join(", ");
        navigator.clipboard
          .writeText(pinNames)
          .then(() => {
            toast({
              title: "コピー完了",
              description: "ピンの名前がクリップボードにコピーされました！",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          })
          .catch((err) => {
            console.error("クリップボードへのコピーに失敗しました:", err);
            toast({
              title: "コピー失敗",
              description: "コピーに失敗しました。",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          });
      }

      console.log("Total pins inside polygon:", pinsInsidePolygon.length);
    });
  };

  const handlePolygonDelete = () => {
    if (selectedPolygon) {
      selectedPolygon.setMap(null);
      toast({
        title: "ポリゴン削除",
        description: "ポリゴンが削除されました。",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setSelectedPolygon(null);
    } else {
      toast({
        title: "削除失敗",
        description: "削除するポリゴンが選択されていません。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return { mapRef, mapInstance, handlePolygonDelete, selectedPolygon };
};
