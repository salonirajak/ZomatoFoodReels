import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UserRegister from '../pages/auth/UserRegister';
import UserLogin from '../pages/auth/UserLogin';
import ChooseRegister from '../pages/auth/ChooseRegister';
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister';
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin';
import Home from '../pages/ganeral/Home';
import Saved from '../pages/ganeral/Saved';
import BottomNav from '../components/BottomNav';
import CreateFood from '../pages/food-partner/CreateFood';
import Profile from '../pages/food-partner/profile';
import Search from '../pages/Search';
import Categories from '../pages/Categories';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root path - show login page */}
      <Route path="/" element={<UserLogin />} />
      
      {/* Public routes */}
      <Route path="/register" element={<ChooseRegister />} />
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
      <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
      
      {/* Protected routes */}
      <Route path="/home" element={
        <div>
          <Home />
          <BottomNav />
        </div>
      } />
      <Route path="/HomePage" element={
        <div>
          <Home />
          <BottomNav />
        </div>
      } />
      <Route path="/saved" element={
        <div>
          <Saved />
          <BottomNav />
        </div>
      } />
      <Route path="/search" element={
        <div>
          <Search />
          <BottomNav />
        </div>
      } />
      <Route path="/categories" element={
        <div>
          <Categories />
          <BottomNav />
        </div>
      } />
      <Route path="/create-food" element={<CreateFood />} />
      <Route path="/profile/food-partner/:id" element={<Profile />} />
    </Routes>
  );
};

export default AppRoutes;