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

export const useSpreadsheetData = (
  memberSpreadsheetId: string,
  memberSheetName: string,
  colorSpreadsheetId: string,
  colorSheetName: string
) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpreadsheetData = async () => {
      try {
        const memberResponse = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${memberSpreadsheetId}/values/${memberSheetName}!A3:AB`,
          {
            params: {
              key: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
            },
          }
        );

        const colorResponse = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${colorSpreadsheetId}/values/${colorSheetName}!E2:E`,
          {
            params: {
              key: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
            },
          }
        );

        const colors = colorResponse.data.values.map((row: string) => {
          return row[0];
        });

        const fetchedPins = memberResponse.data.values.map((row: any) => ({
          id: row[0], // 組合員コードをIDとして使用
          name: row[8], // 組合員名を名前として使用
          lat: parseFloat(row[17]), // 緯度
          lng: parseFloat(row[18]), // 経度
          status: "active", // ステータスは仮に設定
          course: row[3], // コース
          delivery_order: row[26],
          color: colors[parseInt(row[27]) % 200], // コマの番号に基づいて色を設定
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
  }, [memberSpreadsheetId, memberSheetName, colorSpreadsheetId, colorSheetName]);

  return { pins, loading, error };
};
