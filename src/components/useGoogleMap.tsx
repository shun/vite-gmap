import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useMarkers } from "./useMarkers";
import { useDrawingManager } from "./useDrawingManager";
import { usePolygonHistory } from "./usePolygonHistory";
import type { Pin } from "./useSpreadsheetData";

export const useGoogleMap = (center: google.maps.LatLngLiteral, pins: Pin[], toast: any) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<google.maps.Polygon | null>(null);
  const [polygonColor, setPolygonColor] = useState("#FF0000");
  // ポリゴンとそのパスを管理する状態
  const [polygonPaths, setPolygonPaths] = useState<
    { polygon: google.maps.Polygon; path: google.maps.LatLngLiteral[] }[]
  >([]);

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
    // FIXME
    // mapRef.current を監視対象にしないと地図が出ないため、
    // linterエラーを下記で回避
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, mapRef.current]);

  useMarkers(mapInstance, pins);

  const { saveToHistory, handleUndo } = usePolygonHistory(selectedPolygon, setPolygonPaths);

  useDrawingManager(
    mapInstance,
    setSelectedPolygon,
    setPolygonPaths, // setPolygonPaths を渡す
    saveToHistory,
    polygonColor
  );

  const handlePolygonDelete = () => {
    if (selectedPolygon) {
      selectedPolygon.setMap(null);
      setSelectedPolygon(null);
      setPolygonPaths((prevPolygonPaths) => prevPolygonPaths.filter((p) => p.polygon !== selectedPolygon));
    }
  };

  const handleCopyPins = () => {
    if (selectedPolygon) {
      const pinsInsidePolygon = pins.filter((pin) => {
        const latLng = new google.maps.LatLng(pin.lat, pin.lng);
        return google.maps.geometry.poly.containsLocation(latLng, selectedPolygon);
      });

      const pinNames = pinsInsidePolygon.map((pin) => pin.name).join(", ");

      navigator.clipboard
        .writeText(pinNames)
        .then(() => {
          toast({
            title: "コピー完了",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          toast({
            title: "コピー失敗",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        });
    }
  };

  const handleSetPolygonColor = (color: string) => {
    if (selectedPolygon) {
      selectedPolygon.setOptions({
        strokeColor: color,
        fillColor: color,
      });

      // 保存するために polygonPaths を更新
      setPolygonPaths((prevPolygonPaths) =>
        prevPolygonPaths.map((polygonPath) =>
          polygonPath.polygon === selectedPolygon ? { polygon: selectedPolygon, path: polygonPath.path } : polygonPath
        )
      );
    }
  };

  useEffect(() => {
    if (selectedPolygon) {
      const currentColor = selectedPolygon.get("fillColor") || "#FF0000";
      setPolygonColor(currentColor);
    }
  }, [selectedPolygon]);

  return {
    mapRef,
    mapInstance,
    handlePolygonDelete,
    handleCopyPins,
    selectedPolygon,
    setPolygonColor,
    polygonColor,
    handleUndo,
    handleSetPolygonColor,
  };
};
