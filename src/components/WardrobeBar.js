import React from 'react';

function WardrobeBar({ onCategoryClick }) {
  const categories = [
    { name: 'T-Shirts & Tops', class: 'category-tops', key: 'tops' },
    { name: 'Pants & Skirts', class: 'category-bottoms', key: 'bottoms' },
    { name: 'Shoes & Footwear', class: 'category-shoes', key: 'shoes' },
    { name: 'Accessories', class: 'category-accessories', key: 'accessories' }
  ];

  return (
    <div className="wardrobe-bar">
      {categories.map((category, index) => (
        <div 
          key={index}
          className="clothing-item"
          onClick={() => onCategoryClick(category.name)}
        >
          <span className={`category-badge ${category.class}`}></span>
          <span>{category.name}</span>
        </div>
      ))}
    </div>
  );
}

export default WardrobeBar;