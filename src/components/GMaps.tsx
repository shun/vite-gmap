import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Loader } from "@googlemaps/js-api-loader";
import { Box, Button, useToast } from "@chakra-ui/react";

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
  const [selectedPolygon, setSelectedPolygon] = useState<google.maps.Polygon | null>(null); // 選択されたポリゴン
  const [markerElements, setMarkerElements] = useState<google.maps.marker.AdvancedMarkerElement[]>([]); // マーカーリスト
  const loaderRef = useRef<Loader | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!mapRef.current) {
      console.error("mapRef is not initialized.");
      return;
    }

    if (!loaderRef.current) {
      loaderRef.current = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
        libraries: ["geometry", "drawing", "marker"],
      });
    }

    loaderRef.current
      .load()
      .then(() => {
        const map = new google.maps.Map(mapRef.current as HTMLElement, {
          center,
          zoom: 15,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID!,
        });

        setMapInstance(map);
        setMapLoaded(true);

        // InfoWindow の作成
        const infoWindow = new google.maps.InfoWindow();

        // マーカーの設定
        const newMarkers = pins.map((pin) => {
          const pinElement = new google.maps.marker.PinElement({
            scale: 1.0,
            background: "#e44631",
            borderColor: "#b01500",
            glyphColor: "#ffffff",
            glyph: pin.id,
          });

          const markerElement = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: pin.lat, lng: pin.lng },
            map: map,
            title: pin.name,
            content: pinElement.element,
          });

          // マーカークリック時の InfoWindow 表示
          markerElement.addListener("click", () => {
            console.log("hoge");
            if (infoWindow) {
              infoWindow.close();
              infoWindow.setContent(`<div>${pin.name}<br>${pin.course}</div>`);
              infoWindow.open({
                anchor: markerElement,
                map,
                shouldFocus: false,
              });
            }
          });

          return markerElement;
        });

        setMarkerElements(newMarkers);

        // DrawingManagerの設定
        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER, // 上部中央に配置
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

        // ポリゴンが描画されたときのイベントを処理
        google.maps.event.addListener(drawingManager, "polygoncomplete", (polygon) => {
          polygon.setEditable(true);
          polygon.addListener("click", () => {
            setSelectedPolygon(polygon);
          });

          // ポリゴン内のピンを取得
          const pinsInsidePolygon = newMarkers.filter((marker) =>
            google.maps.geometry.poly.containsLocation(marker.position, polygon)
          );

          if (pinsInsidePolygon.length > 0) {
            const pinNames = pinsInsidePolygon.map((marker) => marker.title).join(", ");

            // クリップボードにコピー
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
      })
      .catch((e) => {
        console.error("Error loading Google Maps:", e);
      });
  }, []);

  const handlePolygonDelete = () => {
    if (selectedPolygon) {
      selectedPolygon.setMap(null); // ポリゴンをマップから削除
      toast({
        title: "ポリゴン削除",
        description: "ポリゴンが削除されました。",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setSelectedPolygon(null); // 選択状態を解除
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

  return (
    <Box>
      <Box ref={mapRef} style={mapContainerStyle}></Box>
      <Box position="absolute" top="80px" right="20px" zIndex="10">
        <Button
          colorScheme="red"
          onClick={handlePolygonDelete}
          isDisabled={!selectedPolygon} // 選択されていない場合は無効化
        >
          選択したポリゴンを削除
        </Button>
      </Box>
    </Box>
  );
};
