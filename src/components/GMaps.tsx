import { FC } from "react";
import { useGoogleMap } from "./useGoogleMap";
import { Box, Button, useToast } from "@chakra-ui/react";

const center = {
  lat: 43.0646,
  lng: 141.3468,
};

type Pin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "new" | "active" | "inactive";
  course: string;
};

const pins: Pin[] = [
  { id: "1", name: "Member 1", lat: 43.0646, lng: 141.3468, status: "new", course: "A" },
  { id: "2", name: "Member 2", lat: 43.068, lng: 141.35, status: "active", course: "B" },
];

export const GMap: FC = () => {
  const toast = useToast();
  const { mapRef, handlePolygonDelete, selectedPolygon } = useGoogleMap(center, pins, toast);

  return (
    <Box>
      <Box ref={mapRef} style={{ width: "100%", height: "100vh" }}></Box>
      <Box position="absolute" top="80px" right="20px" zIndex="10">
        <Button colorScheme="red" onClick={handlePolygonDelete} isDisabled={!selectedPolygon}>
          選択したポリゴンを削除
        </Button>
      </Box>
    </Box>
  );
};
