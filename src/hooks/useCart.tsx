import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const cartData = [...cart];

      const existsProduct = cart.find((item) => item.id === productId);

      const { data } = await api.get(`/stock/${productId}`);

      const newAmount = existsProduct?.amount ? existsProduct.amount + 1 : 0;

      if (newAmount > data.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (existsProduct) {
        existsProduct.amount = newAmount;
      } else {
        const { data: productData } = await api.get(`/products/${productId}`);

        const newProductData = {
          ...productData,
          amount: 1,
        };

        cartData.push(newProductData);
      }

      setCart(cartData);

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartData));
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const findProduct = cart.findIndex((item) => item.id === productId);

      if (findProduct >= 0) {
        const removeFromCart = cart.filter((item) => item.id !== productId);

        setCart(removeFromCart);

        localStorage.setItem(
          '@RocketShoes:cart',
          JSON.stringify(removeFromCart)
        );
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }

      const { data: stockData } = await api.get(`/stock/${productId}`);

      if (amount > stockData.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const existsProduct = cart.find((item) => item.id === productId);

      if (!existsProduct) {
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }

      const newCartData = cart.map((item) => {
        if (item.id === productId) {
          return { ...item, amount };
        }

        return item;
      });

      setCart(newCartData);

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartData));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
