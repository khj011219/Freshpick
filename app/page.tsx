"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*");

      console.log("data:", data);
      console.log("error:", error);
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Supabase 연결 테스트</h1>
      <p>콘솔(F12)을 열어 확인하세요.</p>
    </div>
  );
}