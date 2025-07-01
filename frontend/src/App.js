import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';

// Import components
import Home from "./Components/Home/Home";
import Art from "./Components/Art/Art";
import Cart from "./Components/Cart/Cart";
import AddArt from "./Components/AddArt/AddArt";
import UpdateArt from "./Components/UpdateArt/UpdateArt";
import ArtDetail from "./Components/ArtDetail/ArtDetail";
import Favorites from "./Components/Favorites/Favorites";
import Payment from "./Components/Payment/Payment";
import PaymentDetails from "./Components/PaymentDetails/PaymentDetails";
import PaymentConfirmation from "./Components/PaymentConfirmation/PaymentConfirmation";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mainart" element={<Art />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/addart" element={<AddArt />} />
          <Route path="/updateart/:id" element={<UpdateArt />} />
          <Route path="/artdetail/:id" element={<ArtDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          
          {/* Payment routes */}
          <Route path="/checkout" element={<Payment />} />
          
          <Route path="/payment-details" element={<PaymentDetails />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;