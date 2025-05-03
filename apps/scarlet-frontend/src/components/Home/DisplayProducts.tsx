import { SparklesText } from '../magicui/sparkles-text';
import ProductCard from './ProductCard';

interface DisplayProductsProps {
    // Define component props here
}

const DisplayProducts: React.FC<DisplayProductsProps> = (props) => {
    return (
        <div className="flex flex-col">
            {/* <div className="text-2xl font-bold text-start mb-4">Explore Our Products</div> */}
            <SparklesText className="mb-4 mt-4 text-lg sm:text-2xl xl:text-4xl" colors={{ first: '#32CD32', second: '#006400' }}>
                Our Products
            </SparklesText>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-3xl">
                {/* Example Product Card */}
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
            </div>
        </div>
    );
};

export default DisplayProducts;
