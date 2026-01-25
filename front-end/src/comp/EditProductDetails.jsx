import React,{useState,} from "react";
import{useParams,useNavigate} from "react-router-dom";
import { motion } from "framer-motion";

function EditProductDetails(){
    const{productId}=useParams(); 
    const navigate=useNavigate(); 
    const[Title,setTitle]=useState("");
    const[Description,setDescription]=useState("");
    const[Price,setPrice]=useState("");
    const[Category,setCategory]=useState("");
    const[Quantity,setQuantity]=useState("");

    const handleSubmit=async(e) =>{
        e.preventDefault();
        try{
            const response=await fetch(
                `http://localhost:8000/e-2market/v1/products/updateProduct/${productId}`,
               {
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json",
                    },
                    credentials:"include",
                    body: JSON.stringify({Title,Description,Price,Category,Quantity}),
                }
            );

            const data=await response.json();

            if(data.error){
                alert(data.error);
            } else{
                alert("Product updated successfully!");
                navigate("/dash"); 
            }
        } catch(error){
            console.error("Error updating product:", error);
        }
    };

    return(
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

            <motion.div
                initial={{y: 20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{duration: 0.6, ease: "easeOut"}}
                className="w-full max-w-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 md:p-10 border border-purple-500/20 relative z-10"
            >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none"></div>

                <div className="relative z-20">
                    <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 text-center">
                        Update Product Details
                    </h2>
                    <p className="text-center text-slate-400 mb-6 text-sm font-medium">Modify your product information</p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {[
                            { label: "Title", type: "text", value: Title, setter: setTitle, placeholder: "Product Title" },
                            { label: "Description", type: "textarea", value: Description, setter: setDescription, placeholder: "Product Description" },
                            { label: "Price", type: "number", value: Price, setter: setPrice, placeholder: "0.00" },
                            { label: "Category", type: "text", value: Category, setter: setCategory, placeholder: "Category" },
                            { label: "Quantity", type: "number", value: Quantity, setter: setQuantity, placeholder: "0" },
                        ].map((field, idx) => (
                            <div key={idx}>
                                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                                    {field.label}
                                </label>
                                {field.type === "textarea" ? (
                                    <textarea
                                        value={field.value}
                                        onChange={(e)=> field.setter(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition duration-300 hover:bg-slate-700/70 hover:border-slate-600/70"
                                        placeholder={field.placeholder}
                                        required
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        value={field.value}
                                        onChange={(e)=> field.setter(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition duration-300 hover:bg-slate-700/70 hover:border-slate-600/70"
                                        placeholder={field.placeholder}
                                        required
                                    />
                                )}
                            </div>
                        ))}

                        <motion.button
                            whileHover={{scale: 1.02, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)"}}
                            whileTap={{scale: 0.98}}
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-2xl transition duration-300 mt-4 text-lg tracking-wide"
                        >
                            Update Product
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default EditProductDetails;
