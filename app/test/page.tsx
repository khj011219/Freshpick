"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {

    // CREATE
    const addIngredient = async () => {
        const { data, error } = await supabase
            .from("ingredients")
            .insert([
                {
                    name: "계란",
                    quantity: 10,
                    unit: "개",
                    expire_date: "2026-03-01"
                }
            ]);

        if (error) {
            console.error("Insert Error:", error);
        } else {
            console.log("Inserted:", data);
        }
    };

    // READ
    const getIngredients = async () => {
        const { data, error } = await supabase
            .from("ingredients")
            .select("*");

        if (error) {
            console.error("Select Error:", error);
        } else {
            console.log("Ingredients:", data);
        }
    };

    // UPDATE
    const updateIngredient = async () => {
        const { data, error } = await supabase
            .from("ingredients")
            .update({ quantity: 20 })
            .eq("name", "계란");

        if (error) {
            console.error("Update Error:", error);
        } else {
            console.log("Updated:", data);
        }
    };

    // DELETE
    const deleteIngredient = async () => {
        const { data, error } = await supabase
            .from("ingredients")
            .delete()
            .eq("name", "계란");

        if (error) {
            console.error("Delete Error:", error);
        } else {
            console.log("Deleted:", data);
        }
    };

    return (
        <div className="p-10">
            <button
                onClick={addIngredient}
                className="bg-blue-500 text-white px-4 py-2 mr-4"
            >
                Add Ingredient
            </button>

            <button
                onClick={getIngredients}
                className="bg-green-500 text-white px-4 py-2"
            >
                Get Ingredients
            </button>

            <button
                onClick={updateIngredient}
                className="bg-yellow-500 text-white px-4 py-2 mr-4"
            >
                Update Ingredient
            </button>

            <button
                onClick={deleteIngredient}
                className="bg-red-500 text-white px-4 py-2"
            >
                Delete Ingredient
            </button>
        </div>
    );
}