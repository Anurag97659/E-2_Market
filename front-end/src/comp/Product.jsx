import React,{useState} from"react";
import{Link} from"react-router-dom";
import{motion} from"framer-motion";

function Product() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    console.log(title, description, price, category, quantity, image);

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", description);
    formData.append("Price", price);
    formData.append("Category", category);
    formData.append("Quantity", quantity);
    if (image) {
      formData.append("Image", image);
    }

    try {
      const response = await fetch(
        "http://localhost:8000/e-2market/v1/products/registerProduct",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert("Product registered successfully!");
        window.location.href = "/dash";
      }
    } catch (error) {
      alert("Error registering product. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-purple-700 to-gray-800 flex items-center justify-center px-4 py-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

      <motion.div
        initial={{y: 20, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        transition={{duration: 0.6, ease: "easeOut"}}
        className="w-full max-w-md bg-gradient-to-br from-gray-900/80 to-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-purple-600/20 relative z-10"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none"></div>

        <div className="relative z-20">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 text-center font-mono">
            Product Registration
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300">
                Product Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 bg-gray-800 text-white font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 bg-gray-800 text-white font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300">
                Price (in INR)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 bg-gray-800 text-white font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 bg-gray-800 text-white font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 bg-gray-800 text-white font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 font-sans"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-bold"
            >
              Register Product
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-300 mt-4 font-bold">
            <Link to="/dash" className="text-blue-500 hover:underline">
              Back to Home
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Product;
