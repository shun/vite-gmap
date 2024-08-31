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
  // ポリゴンとそのパスを管理する状態
  const [polygonPaths, setPolygonPaths] = useState<
    { polygon: google.maps.Polygon; path: google.maps.LatLngLiteral[] }[]
  >([]);
  const [labels, setLabels] = useState<{ [key: string]: google.maps.InfoWindow }>({});

  useEffect(() => {

    if (!mapRef.current) {
      //console.error("mapRef is null at the start of useEffect");
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

  const { saveToHistory, handleUndo } = usePolygonHistory(
    selectedPolygon,
    polygonPaths,
    setPolygonPaths
  );

  useDrawingManager(
    mapInstance,
    markerElements,
    toast,
    setSelectedPolygon,
    polygonPaths, // polygonPaths を渡す
    setPolygonPaths, // setPolygonPaths を渡す
    labels,
    setLabels,
    saveToHistory,
    polygonColor
  );

  const handlePolygonDelete = () => {
    if (selectedPolygon) {
      selectedPolygon.setMap(null);
      setSelectedPolygon(null);
      setPolygonPaths((prevPolygonPaths) =>
        prevPolygonPaths.filter((p) => p.polygon !== selectedPolygon)
      );
    }
  };

  const handleCopyPins = () => {
    if (selectedPolygon) {
      const polygonBounds = selectedPolygon.getPath();
      const pinsInsidePolygon = pins.filter((pin) =>
        google.maps.geometry.poly.containsLocation(
          new google.maps.LatLng(pin.lat, pin.lng),
          polygonBounds
        )
      );

      const pinNames = pinsInsidePolygon.map((pin) => pin.name).join(", ");

      navigator.clipboard.writeText(pinNames)
        .then(() => {
          toast({
            title: "コピー完了",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          toast({
            title: "コピー失敗",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };


  return {
    mapRef,
    mapInstance,
    handlePolygonDelete,
    handleCopyPins,
    selectedPolygon,
    setPolygonColor,
    polygonColor,
    handleUndo,
  };
};
