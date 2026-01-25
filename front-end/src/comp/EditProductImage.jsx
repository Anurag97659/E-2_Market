import React,{useState} from "react";
import{useParams,useNavigate} from "react-router-dom";

function EditProductDetails(){
    const{ productId }=useParams();
    const navigate=useNavigate();
    const[image, setImage]=useState(null);
    const[preview, setPreview]=useState(null);
    const handleImageChange=(e)=>{
        const file=e.target.files[0];
        if(file){
            setImage(file);
            setPreview(URL.createObjectURL(file)); 
        }
    };
    const handleSubmit=async(e)=>{
        e.preventDefault();
        if(!image){
            alert("Please select an image before submitting.");
            return;
        }
        const formData=new FormData();
        formData.append("Image", image);
        try{
            const response=await fetch(
                `http://localhost:8000/e-2market/v1/products/updateImage/${productId}`,
               {
                    method: "PUT",
                    credentials: "include",
                    body: formData,
                }
            );
            const data=await response.json();
            if(data.error){
                alert(data.error);
            } else{
                alert("Product image updated successfully!");
                navigate("/dash");
            }
        } catch(error){
            alert("Error updating product image. Please try again.");
            console.error("Upload Error:", error);
        }
    };

    return(
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            
            <div className="w-full max-w-lg bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 relative z-10">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 text-center">
                    Update Product Image
                </h2>
                <div>
                    <label className="block text-sm font-medium text-white font-bold">Product Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${!image ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                    />
                </div>
               {preview &&(
                    <img src={preview} alt="Product" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                )}
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="mt-3 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-2 rounded-lg hover:shadow-2xl transition duration-300">
                    Change Image
                </button>
            </div>
        </div>
    );
}

export default EditProductDetails;
