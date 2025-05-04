import { SparklesText } from '../magicui/sparkles-text';
import ProductCard from './ProductCard';

interface DisplayProductsProps {}

const sampleProducts = Array.from({ length: 4 }, (_, i) => ({ id: i + 1 }));

const DisplayProducts: React.FC<DisplayProductsProps> = (props) => {
    return (
        <div className="flex flex-col">
            <SparklesText className="mb-4 mt-4 text-lg sm:text-2xl xl:text-4xl" colors={{ first: '#32CD32', second: '#006400' }}>
                Our Products
            </SparklesText>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-3xl">
                {sampleProducts.map((product) => (
                    <ProductCard key={product.id} productId={product.id} />
                ))}
            </div>
        </div>
    );
};

export default DisplayProducts;
