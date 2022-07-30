import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';
import { ProductCard } from '../../components/ProductCard';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = product.amount;

    return sumAmount;
  }, {} as CartItemsAmount);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data } = await api('/products');

        const formattedData = data.map((item: Product) => {
          const formattedPrice = formatPrice(item.price);

          const newData = {
            ...item,
            priceFormatted: formattedPrice,
          };

          return newData;
        });

        setProducts(formattedData);
      } catch (error) {
        toast.error('Falha ao carregar os produtos!');
      }
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          price={product.price}
          priceFormatted={product.priceFormatted}
          image={product.image}
          handleAddProduct={handleAddProduct}
          productCartAmount={cartItemsAmount[product.id]}
        />
      ))}
    </ProductList>
  );
};

export default Home;
