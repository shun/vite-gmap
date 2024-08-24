import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 43.0646,
  lng: 141.3468,
};

interface Pin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "new" | "active" | "inactive";
  course: string;
}

const pins: Pin[] = [
  { id: "1", name: "Member 1", lat: 43.0646, lng: 141.3468, status: "new", course: "A" },
  { id: "2", name: "Member 2", lat: 43.068, lng: 141.35, status: "active", course: "B" },
];

export const GMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const loaderRef = useRef<Loader | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      console.error("mapRef is not initialized.");
      return;
    }

    if (!loaderRef.current) {
      loaderRef.current = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
        libraries: ["marker"],
      });
    }

    loaderRef.current
      .load()
      .then(() => {
        const map = new google.maps.Map(mapRef.current as HTMLElement, {
          center,
          zoom: 15,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID!, // ここに有効なマップIDを設定
        });

        setMapInstance(map);
        setMapLoaded(true);

        // InfoWindowのインスタンスを作成
        const newInfoWindow = new google.maps.InfoWindow();
        setInfoWindow(newInfoWindow);

        // 地図をクリックするとInfoWindowを閉じるイベントを追加
        map.addListener("click", () => {
          newInfoWindow.close();
        });
      })
      .catch((e) => {
        console.error("Error loading Google Maps:", e);
      });
  }, []);

  useEffect(() => {
    if (mapLoaded && mapInstance) {
      pins.map((pin) => {
        const pinElement = new google.maps.marker.PinElement({
          scale: 1.0, // マーカーの大きさ( 等倍: 1)
          background: "#e44631", // マーカーの色
          borderColor: "#b01500", // マーカーの輪郭の色
          glyphColor: "#ffffff", // グリフの色
          glyph: pin.id,
        });
        const markerElement = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: pin.lat, lng: pin.lng },
          map: mapInstance,
          title: pin.name,
          content: pinElement.element, //document.createTextNode(pin.name),
        });
        markerElement.addListener("click", () => {
          if (infoWindow) {
            infoWindow.close();
            infoWindow.setContent(markerElement.title);
            infoWindow.open(markerElement.map, markerElement);
          }
        });
      });
    }
  }, [mapLoaded, mapInstance]);

  return <div ref={mapRef} style={mapContainerStyle}></div>;
};
