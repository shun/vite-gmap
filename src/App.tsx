import { Box } from "@chakra-ui/react";
import { GMap } from "./components/GMaps";
import "./App.css";

function App() {
  return (
    <Box p={4} height="100vh" width="100vw">
      <GMap sheetId={import.meta.env.VITE_GOOGLE_SHEETS_ID} sheetName="メインデータ" />
    </Box>
  );
}

export default App;
