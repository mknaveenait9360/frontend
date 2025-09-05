import { error } from "console";
import { response } from "express";

const BASE_URL = "http://localhost:3000/products";

export const getProducts = async ()=>{
    try{
        const response = await fetch(BASE_URL);
        if(!response.ok) throw new Error("Failed to fetch products");
        return await response.json();
    }catch(error){
        console.error("getProducts error",error);
        return [];
    }
    
}

export const createProduct = async (product: any) =>{
    try{
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {"Content-type" : "application/json"},
            body: JSON.stringify(product)
        });
        if(!response.ok) throw new Error("Failed to create product")
        return await response.json();
    }catch(error){
        console.error("createProduct Error: ", error);
        return null;
    }
}

export const updateProduct = async (id: string, product : any) =>{
    try{
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify(product)
        })
        if(!response.ok) throw new Error("Failed to update Product")
        return await response.json()
    }catch(error){
        console.error("updateProduct Error: ",error);
        return null;
    }
}

export const deleteProduct = async (id:string) =>{
    try{
        const response = await fetch(`${BASE_URL}/${id}`,{
            method: "DELETE"
        })
        if(!response.ok) throw new Error("Failed to Delete product")
        return await response.json()
    }catch(error){
        console.error("deleteProduct Error: ", error);
        return null;
    }
    }