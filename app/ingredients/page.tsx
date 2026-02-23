"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Ingredient = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expire_date: string;
};

export default function IngredientsPage() {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState<number>(0);
    const [unit, setUnit] = useState("");
    const [expireDate, setExpireDate] = useState("");
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    // 📌 READ
    const fetchIngredients = async () => {
        const { data, error } = await supabase
            .from("ingredients")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
        } else {
            setIngredients(data as Ingredient[]);
        }
    };

    // 📌 CREATE
    const addIngredient = async () => {
        if (!name || !expireDate) return;

        const { error } = await supabase.from("ingredients").insert([
            {
                name,
                quantity,
                unit,
                expire_date: expireDate,
            },
        ]);

        if (error) {
            console.error(error);
        } else {
            setName("");
            setQuantity(0);
            setUnit("");
            setExpireDate("");
            fetchIngredients();
        }
    };

    const deleteIngredient = async (id: string) => {
        await supabase.from("ingredients").delete().eq("id", id);
        fetchIngredients();
    };

    const getExpireStatus = (expireDate: string) => {
        const today = new Date();
        const target = new Date(expireDate);

        const diff = Math.ceil(
            (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diff < 0) return { text: "만료됨", color: "text-red-500" };
        if (diff <= 3) return { text: `${diff}일 남음 ⚠`, color: "text-orange-500" };
        return { text: `${diff}일 남음`, color: "text-green-600" };
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    return (
        <div className="p-10 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">식재료 등록</h1>

            {/* 입력 폼 */}
            <div className="flex flex-col gap-4 mb-6">
                <input
                    type="text"
                    placeholder="식재료 이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2"
                />

                <input
                    type="number"
                    placeholder="수량"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border p-2"
                />

                <input
                    type="text"
                    placeholder="단위 (예: 개, g, ml)"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="border p-2"
                />

                <input
                    type="date"
                    value={expireDate}
                    onChange={(e) => setExpireDate(e.target.value)}
                    className="border p-2"
                />

                <button
                    onClick={addIngredient}
                    className="bg-blue-500 text-white py-2"
                >
                    등록하기
                </button>
            </div>

            {/* 목록 */}
            <div>
                <h2 className="text-xl font-semibold mb-4">등록된 식재료</h2>
                {ingredients.map((item) => {
                    const status = getExpireStatus(item.expire_date);

                    return (
                        <div
                            key={item.id}
                            className="border p-4 mb-3 rounded-lg shadow-sm flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold text-lg">{item.name}</p>
                                <p className="text-sm text-gray-600">
                                    {item.quantity} {item.unit}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className={`text-sm font-medium ${status.color}`}>
                                    {status.text}
                                </p>

                                <button
                                    onClick={() => deleteIngredient(item.id)}
                                    className="text-xs text-red-400 mt-1"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}