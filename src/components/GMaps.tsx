import { FC } from "react";
import { useGoogleMap } from "./useGoogleMap";
import { Box, Button, Input, useToast } from "@chakra-ui/react";
import { useSpreadsheetData } from "./useSpreadsheetData";

const center = {
  lat: 43.0646,
  lng: 141.3468,
};

type GMapProps = {
  sheetId: string;
  sheetName: string;
};

export const GMap: FC<GMapProps> = (props) => {
  const { sheetId, sheetName } = props;
  const toast = useToast();
  const { pins, loading, error } = useSpreadsheetData(sheetId, sheetName);
  const { mapRef, handlePolygonDelete, handleCopyPins, selectedPolygon, setPolygonColor, polygonColor, handleUndo } = useGoogleMap(
    center,
    pins,
    toast
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box>
      <Box ref={mapRef} id="map" style={{ width: "100%", height: "100vh" }}></Box>
      <Box position="absolute" top="80px" right="20px" zIndex="10" display="flex" flexDirection="column" gap={2}>
        <Input type="color" onChange={(e) => setPolygonColor(e.target.value)} value={polygonColor} mb={2} />
        <Button colorScheme="red" onClick={handlePolygonDelete} isDisabled={!selectedPolygon}>
          選択したポリゴンを削除
        </Button>
        <Button colorScheme="blue" onClick={handleCopyPins} isDisabled={!selectedPolygon}>
          ピン情報をコピー
        </Button>
        <Button colorScheme="blue" onClick={handleUndo} isDisabled={!selectedPolygon}>
          ポリゴンを元に戻す
        </Button>
      </Box>
    </Box>
  );
};
