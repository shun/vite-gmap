import { useEffect, useState } from "react";
import axios from "axios";

type Pin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "new" | "active" | "inactive";
  course: string;
  delivery_order: string;
};

export const useSpreadsheetData = (spreadsheetId: string, sheetName: string) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpreadsheetData = async () => {
      try {
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A2:AB`,
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
          delivery_order: row[26]
        }));

        setPins(fetchedPins);
        setLoading(false);
      } catch (error) {
        console.error(error)
        setError("スプレッドシートのデータ取得に失敗しました。");
        setLoading(false);
      }
    };

    fetchSpreadsheetData();
  }, [spreadsheetId, sheetName]);

  return { pins, loading, error };
};
