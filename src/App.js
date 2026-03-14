import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Sidebar from './components/layout/Sidebar';
import ProductsPage from './pages/ProductsPage';
import AddProduct from './pages/AddProduct/AddProduct';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import SearchPage from './pages/SearchPage/SearchPage';
import Categories from './pages/Categories/Categories';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
