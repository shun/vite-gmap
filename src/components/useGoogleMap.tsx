import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useMarkers } from "./useMarkers";
import { useDrawingManager } from "./useDrawingManager";
import { usePolygonHistory } from "./usePolygonHistory";
import type { Pin } from "./useSpreadsheetData";

export const useGoogleMap = (
  center: google.maps.LatLngLiteral,
  pins: Pin[],
  toast: any
) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<google.maps.Polygon | null>(null);
  const [polygonColor, setPolygonColor] = useState("#FF0000");
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);
  const [labels, setLabels] = useState<{ [key: string]: google.maps.InfoWindow }>({});

  useEffect(() => {
    console.log("mapRef:", mapRef.current);

    if (!mapRef.current) {
        console.error("mapRef is null at the start of useEffect");
        return;
    }

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
      libraries: ["geometry", "drawing", "marker"],
    });

    loader
      .load()
      .then(() => {
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current as HTMLElement, {
          center,
          zoom: 15,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID!,
          disableDoubleClickZoom: true,
        });

        setMapInstance(map);
      })
      .catch(console.error);
  }, [center, mapRef.current]);

  const markerElements = useMarkers(mapInstance, pins, toast);

  useDrawingManager(
    mapInstance,
    markerElements,
    toast,
    setSelectedPolygon,
    setPolygons,
    labels,
    setLabels,
    usePolygonHistory(selectedPolygon, setPolygons).saveToHistory,
    polygonColor
  );

  const { handleUndo } = usePolygonHistory(selectedPolygon, setPolygons);

  return {
    mapRef,
    mapInstance,
    handlePolygonDelete: () => {/* implementation */},
    handleCopyPins: () => {/* implementation */},
    selectedPolygon,
    setPolygonColor,
    polygonColor,
    handleUndo,
  };
};
