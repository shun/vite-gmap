import { useEffect, useState } from "react";
import type { Pin } from "./useSpreadsheetData";

export const useMarkers = (
  map: google.maps.Map | null,
  pins: Pin[],
  toast: any
) => {
  const [markerElements, setMarkerElements] = useState<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);

  useEffect(() => {
    if (!map) return;

    const markers = pins.map((pin) => {
      const pinElement = new google.maps.marker.PinElement({
        scale: 1.0,
        background: pin.color,
        borderColor: pin.color,
        glyphColor: "#ffffff",
        glyph: pin.delivery_order,
      });

      const markerElement = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: pin.lat, lng: pin.lng },
        map,
        title: pin.name,
        content: pinElement.element,
      });

      return markerElement;
    });

    setMarkerElements(markers);
  }, [map, pins]);

  return markerElements;
};