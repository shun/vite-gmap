import { Box } from "@chakra-ui/react";
import { GMap } from "./components/GMaps";
import "./App.css";

function App() {
  return (
    <Box p={4} height="100vh" width="100vw">
      <GMap
        memberSheetId={import.meta.env.VITE_GOOGLE_SHEETS_ID}
        memberSheetName="メインデータ"
        colorSheetId={import.meta.env.VITE_GOOGLE_SHEETS_ID}
        colorSheetName="カラー"
      />
    </Box>
  );
}

export default App;
