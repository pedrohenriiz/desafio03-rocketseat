import { MdAddShoppingCart } from 'react-icons/md';

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  image: string;
  priceFormatted: string;
  handleAddProduct: (id: number) => void;
  productCartAmount: number;
}

export function ProductCard({
  title,
  priceFormatted,
  image,
  handleAddProduct,
  id,
  productCartAmount,
}: ProductCardProps) {
  return (
    <li>
      <img src={image} alt={title} />
      <strong>{title}</strong>
      <span>{priceFormatted}</span>
      <button
        type='button'
        data-testid='add-product-button'
        onClick={() => handleAddProduct(id)}
      >
        <div data-testid='cart-product-quantity'>
          <MdAddShoppingCart size={16} color='#FFF' />
          {productCartAmount || 0}
        </div>

        <span>ADICIONAR AO CARRINHO</span>
      </button>
    </li>
  );
}
