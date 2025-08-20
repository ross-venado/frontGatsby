import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const API_BASE_URL = process.env.GATSBY_API_URL || "https://apins.vtemgt.com/api";

const IndexPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.image) return;
    try {
      await axios.post(`${API_BASE_URL}/products`, {
        name: form.name,
        price: parseFloat(form.price),
        image: form.image,
      });
      setForm({ name: "", price: "", image: "" });
      fetchProducts();
    } catch (err) {
      console.error("Error creating product", err);
    }
  };

  return (
    <main>
      <h1>Catálogo de Productos</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre del producto"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="image"
          placeholder="URL de imagen"
          value={form.image}
          onChange={handleChange}
          required
        />
        <button type="submit">Agregar Producto</button>
      </form>

      <div className="grid">
        {products.map((product) => (
          <div key={product._id} className="card">
            <img src={product.image} alt={product.name} />
            <h2>{product.name}</h2>
            <p>${product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default IndexPage;
