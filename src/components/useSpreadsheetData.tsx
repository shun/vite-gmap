import { useEffect, useState } from "react";
import axios from "axios";

export type Pin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "new" | "active" | "inactive";
  course: string;
  delivery_order: string;
  color: string;
};

export const useSpreadsheetData = (spreadsheetId: string, sheetName: string) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 200種類の色を生成
  //const pinColors = generateColors(200);
  const pinColors = generateDarkColors(200);

  useEffect(() => {
    const fetchSpreadsheetData = async () => {
      try {
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A3:AB`,
          {
            params: {
              key: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
            },
          }
        );

        const fetchedPins = response.data.values.map((row: any) => ({
          id: row[0], // 組合員コードをIDとして使用
          name: row[8], // 組合員名を名前として使用
          lat: parseFloat(row[17]), // 緯度
          lng: parseFloat(row[18]), // 経度
          status: "active", // ステータスは仮に設定
          course: row[3], // コース
          delivery_order: row[26],
          color: pinColors[parseInt(row[27]) % 200], // コマの番号に基づいて色を設定
        }));

        setPins(fetchedPins);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("スプレッドシートのデータ取得に失敗しました。");
        setLoading(false);
      }
    };

    fetchSpreadsheetData();
  }, [spreadsheetId, sheetName]);

  return { pins, loading, error };
};

// 色生成関数
function generateColors(numColors: number) {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const color = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    colors.push(color);
  }
  return colors;
}

// 暗い色生成関数
function generateDarkColors(numColors: number) {
  const colors = [];
  const color_threashhold = 170;
  for (let i = 0; i < numColors; i++) {
    const red = Math.floor(Math.random() * color_threashhold); // 0〜100の暗い赤
    const green = Math.floor(Math.random() * color_threashhold); // 0〜100の暗い緑
    const blue = Math.floor(Math.random() * color_threashhold); // 0〜100の暗い青
    const color = `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
    colors.push(color);
  }
  return colors;
}
