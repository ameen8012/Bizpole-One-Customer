// 📁 src/components/ProductList.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const ProductList = () => {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    import("../../api/Products").then(({ getProducts }) => {
      getProducts()
        .then((data) => {
          setProducts(data.products || data || []);
        })
        .catch((err) => {
          console.log(err);

          setProducts([]);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  return (
    <>
      <section className="pt-20 min-h-[90vh] flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-yellow-50">
        {/* Badge */}
        <motion.div
          className="inline-block px-4 py-1 mb-12 border border-yellow-400 rounded-full text-sm text-yellow-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Bizpole suite
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Introducing <br />
          <span className="text-yellow-500">Bizpole Products</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-gray-700 text-lg max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          A unified solution, designed particularly to manage, develop, and
          enhance your eCommerce ecosystem.
        </motion.p>
      </section>

      <section className="py-12 px-4  mx-auto bg-gradient-to-t from-white to-yellow-50">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <motion.div
                className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="ml-4 text-yellow-500 font-semibold text-lg">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">No products available at the moment.</p>
            </div>
          ) : (
            <motion.div
              className="space-y-16"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.18,
                    delayChildren: 0.1
                  }
                }
              }}
            >
              <AnimatePresence>
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id || idx}
                    className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-15 mb-30 items-center`}
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    {/* Product Image */}
                    <div className="w-full md:w-1/2">
                      {product.icon_url?.data && Array.isArray(product.icon_url.data) ? (
                        <img
                          src={`data:image/png;base64,${arrayBufferToBase64(product.icon_url.data)}`}
                          alt={product.name || product.ProductName}
                          className="w-full h-95 object-cover rounded-2xl shadow-lg"
                        />
                      ) : product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || product.ProductName}
                          className="w-full h-80 object-cover rounded-2xl shadow-lg bg-gray-50"
                        />
                      ) : (
                        <div className="w-full h-80 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg flex items-center justify-center">
                          <span className="text-gray-400 text-lg">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Content */}
                    <div className="w-full md:w-1/2 space-y-4">
                      <h3 className="text-3xl md:text-4xl font-semibold text-gray-900">
                        {product.name || product.ProductName}
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {product.description || product.Description || "No description available."}
                      </p>
                      {product.price && (
                        <div className="text-yellow-500 font-bold text-2xl">₹{product.price}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductList;
