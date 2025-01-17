import { FC } from "react";
import { useGoogleMap } from "./useGoogleMap";
import { Box, Button, Input, useToast } from "@chakra-ui/react";
import { useSpreadsheetData } from "./useSpreadsheetData";

const center = {
  lat: 43.0646,
  lng: 141.3468,
};

type GMapProps = {
  memberSheetId: string;
  memberSheetName: string;
  colorSheetId: string;
  colorSheetName: string;
};

export const GMap: FC<GMapProps> = (props) => {
  const { memberSheetId, memberSheetName, colorSheetId, colorSheetName } = props;
  const toast = useToast();
  const { pins, loading, error } = useSpreadsheetData(memberSheetId, memberSheetName, colorSheetId, colorSheetName);
  const {
    mapRef,
    handlePolygonDelete,
    handleCopyPins,
    selectedPolygon,
    polygonColor,
    handleUndo,
    handleSetPolygonColor,
  } = useGoogleMap(center, pins, toast);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box>
      <Box ref={mapRef} id="map" style={{ width: "100%", height: "100vh" }}></Box>
      <Box position="absolute" top="80px" right="20px" zIndex="10" display="flex" flexDirection="column" gap={2}>
        <Input type="color" onChange={(e) => handleSetPolygonColor(e.target.value)} value={polygonColor} mb={2} />
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
